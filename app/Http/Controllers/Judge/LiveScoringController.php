<?php

namespace App\Http\Controllers\Judge;

use App\Enums\ScoreSheetStatus;
use App\Http\Controllers\Controller;
use App\Models\Participant;
use App\Models\Round;
use App\Models\ScoreSheet;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class LiveScoringController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        $judge = $request->user();
        $panel = $judge->panel()->with('participants')->first();
        $activeRound = Round::active()->load('criteria');

        // fallback to dummy data
        $useDummy = false;
        if (! $panel || ! $activeRound || $panel->participants->isEmpty()) {
            $useDummy = true;
            $panel = (object)[
                'id' => 1,
                'name' => 'Panel 1',
                'participants' => collect([
                    (object)['id' => 1, 'participant_number' => '001', 'name' => 'Anak A', 'current_score' => 0],
                    (object)['id' => 2, 'participant_number' => '002', 'name' => 'Anak B', 'current_score' => 0],
                    (object)['id' => 3, 'participant_number' => '003', 'name' => 'Anak C', 'current_score' => 0],
                    (object)['id' => 4, 'participant_number' => '004', 'name' => 'Anak D', 'current_score' => 0],
                    (object)['id' => 5, 'participant_number' => '005', 'name' => 'Anak E', 'current_score' => 0],
                ]),
            ];
            $activeRound = (object)[
                'id' => 1,
                'name' => 'Ronde 1',
                'sequence' => 1,
                'criteria' => collect(),
            ];
        }

        if ($useDummy) {
            $participants = $panel->participants->map(function ($p) {
                return [
                    'id' => $p->id,
                    'participant_number' => $p->participant_number,
                    'name' => $p->name,
                    'current_score' => $p->current_score ?? 0,
                ];
            })->values();
        } else {
            $criterion = $activeRound->criteria->first();

            $sheets = ScoreSheet::where('user_id', $judge->id)
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
                        $scoreValue = $score ? $score->value : 0;
                    }
                    return [
                        'id' => $participant->id,
                        'participant_number' => $participant->participant_number,
                        'name' => $participant->name,
                        'current_score' => $scoreValue,
                    ];
                })->values();
        }

        return Inertia::render('judge/live-scoring', [
            'panel' => $panel->only(['id', 'name']),
            'activeRound' => [
                'id' => $activeRound->id,
                'name' => $activeRound->name,
                'sequence' => $activeRound->sequence,
            ],
            'participants' => $participants,
        ]);
    }

    public function increment(Request $request, Participant $participant): RedirectResponse
    {
        $judge = $request->user();
        $activeRound = Round::active();
        if ($activeRound) {
            $activeRound->load('criteria');
        }

        if (! $activeRound) {
            return back()->with('error', 'Tidak ada ronde aktif.');
        }

        $incrementValue = $activeRound->sequence;
        $criterion = $activeRound->criteria->first();

        if (! $criterion) {
            return back()->with('error', 'Kriteria penilaian tidak ditemukan untuk ronde ini.');
        }

        DB::transaction(function () use ($judge, $participant, $activeRound, $criterion, $incrementValue) {
            $sheet = ScoreSheet::firstOrCreate(
                [
                    'user_id' => $judge->id,
                    'participant_id' => $participant->id,
                    'round_id' => $activeRound->id,
                ],
                [
                    'status' => ScoreSheetStatus::Submitted,
                    'submitted_at' => now(),
                ]
            );

            if ($sheet->isDraft()) {
                $sheet->update([
                    'status' => ScoreSheetStatus::Submitted,
                    'submitted_at' => now(),
                ]);
            }

            $score = $sheet->scores()->firstOrCreate(
                ['criterion_id' => $criterion->id],
                ['value' => 0]
            );

            $score->increment('value', $incrementValue);
        });

        return back();
    }
}
