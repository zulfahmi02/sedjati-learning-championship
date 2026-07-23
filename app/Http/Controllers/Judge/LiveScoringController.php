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

class LiveScoringController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        $judge = $request->user();
        $panel = $judge->panel()->with('participants')->first();
        $activeRound = Round::active();

        if (! $panel || ! $activeRound || $panel->participants->isEmpty()) {
            return redirect()->route('judge.dashboard');
        }

        $activeRound->load('criteria');
        $criterion = $activeRound->criteria->first();

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
                $scoreValue = 0;

                if ($sheet && $criterion) {
                    $score = $sheet->scores->firstWhere('criterion_id', $criterion->id);
                    $scoreValue = $score ? (float) $score->value : 0;
                }

                return [
                    'id' => $participant->id,
                    'participant_number' => $participant->participant_number,
                    'name' => $participant->name,
                    'current_score' => $scoreValue,
                ];
            })->values();

        return Inertia::render('judge/live-scoring', [
            'panel' => $panel->only(['id', 'name']),
            'activeRound' => [
                'id' => $activeRound->id,
                'name' => $activeRound->name,
                'sequence' => $activeRound->sequence,
            ],
            'maxScore' => $criterion?->max_score,
            'participants' => $participants,
        ]);
    }

    public function increment(Request $request, Participant $participant): RedirectResponse
    {
        $judge = $request->user();
        $activeRound = Round::active();

        abort_unless($activeRound !== null, 404);

        Gate::authorize('score', [ScoreSheet::class, $participant, $activeRound]);

        $activeRound->load('criteria');
        $criterion = $activeRound->criteria->first();

        if (! $criterion) {
            return back()->with('error', 'Kriteria penilaian tidak ditemukan untuk ronde ini.');
        }

        DB::transaction(function () use ($judge, $participant, $activeRound, $criterion) {
            $sheet = ScoreSheet::query()->firstOrCreate(
                [
                    'user_id' => $judge->id,
                    'participant_id' => $participant->id,
                    'round_id' => $activeRound->id,
                ],
                [
                    'status' => ScoreSheetStatus::Submitted,
                    'submitted_at' => now(),
                ],
            );

            if ($sheet->isDraft()) {
                $sheet->update([
                    'status' => ScoreSheetStatus::Submitted,
                    'submitted_at' => now(),
                ]);
            }

            $score = $sheet->scores()->firstOrCreate(
                ['criterion_id' => $criterion->id],
                ['value' => 0],
            );

            $oldValue = (float) $score->value;
            $newValue = min($oldValue + 1, $criterion->max_score);

            if ($newValue !== $oldValue) {
                $score->update(['value' => $newValue]);

                AuditLogger::log($judge, 'score.live_incremented', $sheet, [
                    'criterion_id' => $criterion->id,
                    'increment' => 1,
                ]);
            }
        });

        return back();
    }
}
