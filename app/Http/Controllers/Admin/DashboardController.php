<?php

namespace App\Http\Controllers\Admin;

use App\Enums\RoundStatus;
use App\Enums\ScoreSheetStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\EventSetting;
use App\Models\Panel;
use App\Models\Participant;
use App\Models\Round;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $activeRound = Round::active();

        $totalParticipants = Participant::count();
        $submittedInRound = $activeRound
            ? $activeRound->scoreSheets()->where('status', ScoreSheetStatus::Submitted)->count()
            : 0;

        $panelStatus = Panel::query()
            ->with('judge:id,name')
            ->withCount('participants')
            ->when($activeRound, fn ($query) => $query->withCount([
                'participants as scored_count' => fn ($q) => $q->whereHas(
                    'scoreSheets',
                    fn ($sheets) => $sheets
                        ->where('round_id', $activeRound->id)
                        ->where('status', ScoreSheetStatus::Submitted),
                ),
            ]))
            ->orderBy('name')
            ->get()
            ->map(fn (Panel $panel) => [
                'id' => $panel->id,
                'name' => $panel->name,
                'judge' => $panel->judge?->name,
                'participants_count' => $panel->participants_count,
                'scored_count' => $activeRound ? ($panel->scored_count ?? 0) : 0,
            ]);

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'participants' => $totalParticipants,
                'judges' => User::query()->where('role', UserRole::Juri)->count(),
                'activeJudges' => User::query()->where('role', UserRole::Juri)->where('is_active', true)->count(),
                'panels' => Panel::count(),
                'panelsWithJudge' => Panel::query()->whereNotNull('judge_id')->count(),
                'rounds' => Round::count(),
                'lockedRounds' => Round::query()->where('status', RoundStatus::Locked)->count(),
                'progress' => $totalParticipants > 0 && $activeRound
                    ? (int) round($submittedInRound / $totalParticipants * 100)
                    : 0,
                'submittedInRound' => $submittedInRound,
            ],
            'activeRound' => $activeRound?->only(['id', 'name', 'sequence', 'weight']),
            'panelStatus' => $panelStatus,
            'resultsPublished' => EventSetting::current()->results_published,
        ]);
    }
}
