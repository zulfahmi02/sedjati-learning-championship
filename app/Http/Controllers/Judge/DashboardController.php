<?php

namespace App\Http\Controllers\Judge;

use App\Enums\ScoreSheetStatus;
use App\Http\Controllers\Controller;
use App\Models\Round;
use App\Models\ScoreSheet;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $judge = $request->user();
        $panel = $judge->panel()->with('participants')->first();
        $activeRound = Round::active();

        $participants = collect();

        if ($panel && $activeRound) {
            $sheets = ScoreSheet::query()
                ->where('user_id', $judge->id)
                ->where('round_id', $activeRound->id)
                ->get()
                ->keyBy('participant_id');

            $participants = $panel->participants
                ->sortBy('participant_number')
                ->values()
                ->map(fn ($participant) => [
                    'id' => $participant->id,
                    'participant_number' => $participant->participant_number,
                    'name' => $participant->name,
                    'institution' => $participant->institution,
                    'status' => $sheets->get($participant->id)?->status->value ?? 'pending',
                ]);
        }

        $submittedCount = $participants->where('status', ScoreSheetStatus::Submitted->value)->count();

        return Inertia::render('judge/dashboard', [
            'panel' => $panel?->only(['id', 'name', 'description']),
            'activeRound' => $activeRound?->only(['id', 'name', 'sequence', 'weight']),
            'participants' => $participants,
            'stats' => [
                'total' => $participants->count(),
                'submitted' => $submittedCount,
                'remaining' => $participants->count() - $submittedCount,
            ],
        ]);
    }
}
