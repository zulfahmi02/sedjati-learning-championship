<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ScoreSheetStatus;
use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\EventSetting;
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
                $submittedSheets = $panel->judge_id
                    ? ($sheets->get($panel->judge_id) ?? collect())->keyBy('participant_id')
                    : collect();
                $submittedParticipants = $panel->participants
                    ->filter(fn ($participant) => $submittedSheets->has($participant->id))
                    ->map(fn ($participant) => [
                        'score_sheet_id' => $submittedSheets->get($participant->id)->id,
                        'id' => $participant->id,
                        'participant_number' => $participant->participant_number,
                        'name' => $participant->name,
                    ])
                    ->values();
                $submittedIds = $submittedParticipants->pluck('id');

                return [
                    'id' => $panel->id,
                    'name' => $panel->name,
                    'judge' => $panel->judge?->only(['id', 'name', 'is_active']),
                    'expected' => $expected,
                    'submitted' => $submittedParticipants->count(),
                    'done' => $expected > 0 && $submittedParticipants->count() >= $expected,
                    'pendingParticipants' => $panel->participants
                        ->reject(fn ($participant) => $submittedIds->contains($participant->id))
                        ->map(fn ($participant) => [
                            'id' => $participant->id,
                            'participant_number' => $participant->participant_number,
                            'name' => $participant->name,
                        ])
                        ->values(),
                    'submittedParticipants' => $submittedParticipants,
                ];
            });

            $unscored = $matrix->flatMap(fn (array $row) => $row['pendingParticipants']);
        }

        $activities = collect();

        if ($selectedRound) {
            $activities = AuditLog::with(['actor:id,name', 'subject'])
                ->where(function ($query) use ($selectedRound) {
                    // Match logs directly for this round model
                    $query->where(function ($q) use ($selectedRound) {
                        $q->where('subject_type', $selectedRound->getMorphClass())
                            ->where('subject_id', $selectedRound->id);
                    })
                    // Or match logs (like ScoreSheet) where the context includes this round_id
                        ->orWhereJsonContains('context->round_id', $selectedRound->id)
                    // Or implicitly join ScoreSheet to filter by round_id
                        ->orWhereHasMorph('subject', [ScoreSheet::class], function ($q) use ($selectedRound) {
                            $q->where('round_id', $selectedRound->id);
                        });
                })
                ->latest('created_at')
                ->take(15)
                ->get()
                ->map(fn (AuditLog $log) => [
                    'id' => $log->id,
                    'event' => $log->event,
                    'actor_name' => $log->actor?->name ?? 'Sistem',
                    'created_at' => $log->created_at?->diffForHumans(),
                    'context' => $log->context,
                    // Minimal subject snapshot for UI
                    'subject_name' => match ($log->subject_type) {
                        (new ScoreSheet)->getMorphClass() => $log->subject?->participant?->name ?? 'Peserta Terhapus',
                        (new Round)->getMorphClass() => $log->subject?->name ?? 'Ronde',
                        (new EventSetting)->getMorphClass() => 'Pengaturan Event',
                        default => 'Item',
                    },
                ]);
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
            'activities' => $activities,
        ]);
    }
}
