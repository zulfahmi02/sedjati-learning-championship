<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ScoreSheetStatus;
use App\Http\Controllers\Controller;
use App\Models\Panel;
use App\Models\Round;
use App\Models\ScoreSheet;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MonitoringController extends Controller
{
    public function index(Request $request): Response
    {
        $rounds = Round::query()->orderBy('sequence')->get(['id', 'name', 'sequence', 'status']);

        $selectedRound = $request->integer('round')
            ? $rounds->firstWhere('id', $request->integer('round'))
            : ($rounds->firstWhere('status', 'active') ?? $rounds->first());

        $panels = Panel::query()
            ->with(['judge:id,name,is_active', 'participants:id,participant_number,name'])
            ->orderBy('name')
            ->get();

        $matrix = collect();
        $unscored = collect();

        if ($selectedRound) {
            $sheets = ScoreSheet::query()
                ->where('round_id', $selectedRound->id)
                ->where('status', ScoreSheetStatus::Submitted)
                ->get()
                ->groupBy('user_id');

            $matrix = $panels->map(function (Panel $panel) use ($sheets) {
                $expected = $panel->participants->count();
                $submittedIds = $panel->judge_id
                    ? ($sheets->get($panel->judge_id)?->pluck('participant_id') ?? collect())
                    : collect();

                return [
                    'id' => $panel->id,
                    'name' => $panel->name,
                    'judge' => $panel->judge?->only(['id', 'name', 'is_active']),
                    'expected' => $expected,
                    'submitted' => $submittedIds->count(),
                    'done' => $expected > 0 && $submittedIds->count() >= $expected,
                    'pendingParticipants' => $panel->participants
                        ->reject(fn ($participant) => $submittedIds->contains($participant->id))
                        ->map(fn ($participant) => [
                            'id' => $participant->id,
                            'participant_number' => $participant->participant_number,
                            'name' => $participant->name,
                        ])
                        ->values(),
                ];
            });

            $unscored = $matrix->flatMap(fn (array $row) => $row['pendingParticipants']);
        }

        return Inertia::render('admin/monitoring', [
            'rounds' => $rounds,
            'selectedRound' => $selectedRound?->only(['id', 'name', 'sequence', 'status']),
            'matrix' => $matrix,
            'totals' => [
                'expected' => $matrix->sum('expected'),
                'submitted' => $matrix->sum('submitted'),
                'unscored' => $unscored->count(),
                'judgesPending' => $matrix->where('done', false)->whereNotNull('judge')->count(),
            ],
        ]);
    }
}
