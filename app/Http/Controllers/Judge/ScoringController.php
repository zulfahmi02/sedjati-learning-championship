<?php

namespace App\Http\Controllers\Judge;

use App\Enums\ScoreSheetStatus;
use App\Http\Controllers\Controller;
use App\Models\Participant;
use App\Models\Round;
use App\Models\ScoreSheet;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ScoringController extends Controller
{
    /**
     * Redirect to the first pending participant (or the first participant).
     */
    public function index(Request $request): RedirectResponse
    {
        $judge = $request->user();
        $panel = $judge->panel()->with('participants')->first();
        $activeRound = Round::active();

        if (! $panel || ! $activeRound || $panel->participants->isEmpty()) {
            return redirect()->route('judge.dashboard');
        }

        $submittedIds = ScoreSheet::query()
            ->where('user_id', $judge->id)
            ->where('round_id', $activeRound->id)
            ->where('status', ScoreSheetStatus::Submitted)
            ->pluck('participant_id');

        $target = $panel->participants
            ->sortBy('participant_number')
            ->first(fn (Participant $participant) => ! $submittedIds->contains($participant->id))
            ?? $panel->participants->sortBy('participant_number')->first();

        return redirect()->route('judge.scoring.show', $target);
    }

    /**
     * The scoring workspace for one participant.
     */
    public function show(Request $request, Participant $participant): Response|RedirectResponse
    {
        $judge = $request->user();
        $activeRound = Round::active();

        if (! $activeRound) {
            return redirect()->route('judge.dashboard');
        }

        Gate::authorize('score', [ScoreSheet::class, $participant, $activeRound]);

        $activeRound->load('criteria');

        $sheets = ScoreSheet::query()
            ->where('user_id', $judge->id)
            ->where('round_id', $activeRound->id)
            ->get()
            ->keyBy('participant_id');

        $panel = $judge->panel()->with('participants')->first();

        $queue = $panel->participants
            ->sortBy('participant_number')
            ->values()
            ->map(fn (Participant $item) => [
                'id' => $item->id,
                'participant_number' => $item->participant_number,
                'name' => $item->name,
                'status' => $sheets->get($item->id)?->status->value ?? 'pending',
            ]);

        $sheet = $sheets->get($participant->id);

        return Inertia::render('judge/scoring', [
            'panel' => $panel->only(['id', 'name']),
            'activeRound' => $activeRound->only(['id', 'name', 'sequence', 'weight']),
            'rounds' => Round::query()->orderBy('sequence')->get(['id', 'name', 'sequence', 'status']),
            'criteria' => $activeRound->criteria,
            'queue' => $queue,
            'participant' => $participant->only(['id', 'participant_number', 'name', 'institution', 'category']),
            'sheet' => $sheet ? [
                'status' => $sheet->status->value,
                'values' => $sheet->scores()->pluck('value', 'criterion_id')
                    ->map(fn ($value) => (float) $value),
            ] : null,
        ]);
    }

    /**
     * Save the judge's draft scores for a participant.
     */
    public function update(Request $request, Participant $participant): RedirectResponse
    {
        $judge = $request->user();
        $activeRound = Round::active();

        abort_unless($activeRound !== null, 404);

        Gate::authorize('score', [ScoreSheet::class, $participant, $activeRound]);

        $criteria = $activeRound->criteria()->get()->keyBy('id');

        $rules = ['scores' => ['required', 'array']];

        foreach ($criteria as $criterion) {
            $rules['scores.'.$criterion->id] = [
                'nullable',
                'numeric',
                'min:'.$criterion->min_score,
                'max:'.$criterion->max_score,
            ];
        }

        $validated = $request->validate($rules, [], ['scores.*' => 'nilai']);

        DB::transaction(function () use ($judge, $participant, $activeRound, $validated, $criteria) {
            $sheet = ScoreSheet::query()->firstOrCreate([
                'user_id' => $judge->id,
                'participant_id' => $participant->id,
                'round_id' => $activeRound->id,
            ], [
                'status' => ScoreSheetStatus::Draft,
            ]);

            abort_unless($sheet->isDraft(), 403, 'Nilai sudah dikirim dan tidak dapat diubah.');

            foreach ($validated['scores'] as $criterionId => $value) {
                if (! $criteria->has((int) $criterionId)) {
                    continue;
                }

                if ($value === null) {
                    $sheet->scores()->where('criterion_id', $criterionId)->delete();

                    continue;
                }

                $sheet->scores()->updateOrCreate(
                    ['criterion_id' => $criterionId],
                    ['value' => $value],
                );
            }

            AuditLogger::log($judge, 'score.draft_saved', $sheet, [
                'scores' => $validated['scores'],
            ]);
        });

        return back()->with('success', 'Draf nilai tersimpan.');
    }
}
