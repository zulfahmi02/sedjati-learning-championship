<?php

namespace App\Http\Controllers\Judge;

use App\Enums\ScoreSheetStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Judge\AdjustLiveScoreRequest;
use App\Models\Criterion;
use App\Models\Participant;
use App\Models\Round;
use App\Models\ScoreSheet;
use App\Services\AuditLogger;
use App\Services\ScoreCalculationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class LiveScoringController extends Controller
{
    public function __construct(private ScoreCalculationService $calculator) {}

    public function index(Request $request): Response|RedirectResponse
    {
        $judge = $request->user();
        $panel = $judge->panel()->with('participants')->first();
        $activeRound = Round::active();

        if (! $panel || ! $activeRound || $panel->participants->isEmpty()) {
            return redirect()->route('judge.dashboard');
        }

        $activeRound->load('criteria');

        if ($activeRound->criteria->count() !== 1) {
            return redirect()
                ->route('judge.dashboard')
                ->withErrors(['round' => 'Ronde aktif harus memiliki tepat satu kriteria Live Scoring.']);
        }

        $criterion = $activeRound->criteria->sole();

        $sheets = ScoreSheet::query()
            ->where('user_id', $judge->id)
            ->where('round_id', $activeRound->id)
            ->with('scores')
            ->get()
            ->keyBy('participant_id');

        $participants = $panel->participants
            ->sortBy('participant_number')
            ->map(function (Participant $participant) use ($sheets, $criterion) {
                $sheet = $sheets->get($participant->id);
                $score = $sheet?->scores->firstWhere('criterion_id', $criterion->id);

                return [
                    'id' => $participant->id,
                    'participant_number' => $participant->participant_number,
                    'name' => $participant->name,
                    'current_score' => $score ? (float) $score->value : 0,
                    'status' => $sheet?->status->value ?? 'pending',
                ];
            })->values();

        return Inertia::render('judge/live-scoring', [
            'panel' => $panel->only(['id', 'name']),
            'activeRound' => $activeRound->only(['id', 'name', 'sequence']),
            'criterion' => $criterion->only([
                'id',
                'name',
                'description',
                'weight',
                'min_score',
                'max_score',
            ]),
            'participants' => $participants,
        ]);
    }

    public function adjust(AdjustLiveScoreRequest $request, Participant $participant): RedirectResponse
    {
        $judge = $request->user();
        $activeRound = Round::active();

        abort_unless($activeRound !== null, 404);

        Gate::authorize('score', [ScoreSheet::class, $participant, $activeRound]);

        $criterion = $this->soleCriterion($activeRound);
        $delta = $request->integer('delta');

        DB::transaction(function () use ($judge, $participant, $activeRound, $criterion, $delta): void {
            $lockedRound = Round::query()->lockForUpdate()->findOrFail($activeRound->id);
            abort_unless($lockedRound->isActive(), 404);

            ScoreSheet::query()->firstOrCreate([
                'user_id' => $judge->id,
                'participant_id' => $participant->id,
                'round_id' => $lockedRound->id,
            ], [
                'status' => ScoreSheetStatus::Draft,
            ]);

            $sheet = ScoreSheet::query()
                ->where('user_id', $judge->id)
                ->where('participant_id', $participant->id)
                ->where('round_id', $lockedRound->id)
                ->lockForUpdate()
                ->firstOrFail();

            Gate::authorize('update', $sheet);

            $sheet->scores()->firstOrCreate(
                ['criterion_id' => $criterion->id],
                ['value' => 0],
            );

            $score = $sheet->scores()
                ->where('criterion_id', $criterion->id)
                ->lockForUpdate()
                ->firstOrFail();

            $oldValue = (float) $score->value;
            $newValue = (float) min(max($oldValue + $delta, $criterion->min_score), $criterion->max_score);

            if ($newValue === $oldValue) {
                return;
            }

            $score->update(['value' => $newValue]);

            AuditLogger::log($judge, 'score.live_adjusted', $sheet, [
                'round_id' => $lockedRound->id,
                'participant_id' => $participant->id,
                'criterion_id' => $criterion->id,
                'delta' => $delta,
                'old_value' => $oldValue,
                'new_value' => $newValue,
            ]);
        }, attempts: 3);

        return back();
    }

    public function submit(Request $request, Participant $participant): RedirectResponse
    {
        $judge = $request->user();
        $activeRound = Round::active();

        abort_unless($activeRound !== null, 404);

        Gate::authorize('score', [ScoreSheet::class, $participant, $activeRound]);

        $criterion = $this->soleCriterion($activeRound);

        DB::transaction(function () use ($judge, $participant, $activeRound, $criterion): void {
            $lockedRound = Round::query()->lockForUpdate()->findOrFail($activeRound->id);
            abort_unless($lockedRound->isActive(), 404);

            ScoreSheet::query()->firstOrCreate([
                'user_id' => $judge->id,
                'participant_id' => $participant->id,
                'round_id' => $lockedRound->id,
            ], [
                'status' => ScoreSheetStatus::Draft,
            ]);

            $sheet = ScoreSheet::query()
                ->where('user_id', $judge->id)
                ->where('participant_id', $participant->id)
                ->where('round_id', $lockedRound->id)
                ->lockForUpdate()
                ->firstOrFail();

            Gate::authorize('update', $sheet);

            $score = $sheet->scores()->firstOrCreate(
                ['criterion_id' => $criterion->id],
                ['value' => 0],
            );

            $sheet->update([
                'status' => ScoreSheetStatus::Submitted,
                'submitted_at' => now(),
            ]);

            AuditLogger::log($judge, 'score.submitted', $sheet, [
                'round_id' => $lockedRound->id,
                'participant_id' => $participant->id,
                'criterion_id' => $criterion->id,
                'score' => (float) $score->value,
            ]);
        }, attempts: 3);

        $this->calculator->forgetCachedStandings();

        return back()->with('success', 'Nilai '.$participant->name.' berhasil dikirim.');
    }

    private function soleCriterion(Round $round): Criterion
    {
        $criteria = $round->criteria()->get();

        abort_unless($criteria->count() === 1, 422, 'Ronde aktif harus memiliki tepat satu kriteria Live Scoring.');

        return $criteria->sole();
    }
}
