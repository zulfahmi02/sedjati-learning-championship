<?php

namespace App\Http\Controllers;

use App\Enums\RoundStatus;
use App\Models\EventSetting;
use App\Models\Participant;
use App\Models\Round;
use App\Services\ScoreCalculationService;
use Inertia\Inertia;
use Inertia\Response;

class LeaderboardController extends Controller
{
    public function __construct(private ScoreCalculationService $calculator)
    {
    }

    public function index(): Response
    {
        $settings = EventSetting::current();

        if (! $settings->results_published) {
            return Inertia::render('leaderboard/unpublished', [
                'eventName' => $settings->event_name,
            ]);
        }

        $standings = collect($this->calculator->cachedStandings())
            ->map(fn (array $entry) => [
                'rank' => $entry['rank'],
                'total' => $entry['total'],
                'participant' => [
                    'id' => $entry['participant']->id,
                    'participant_number' => $entry['participant']->participant_number,
                    'name' => $entry['participant']->name,
                    'institution' => $entry['participant']->institution,
                    'panel' => $entry['participant']->panels->first()?->name,
                ],
                'rounds' => $entry['rounds'],
            ])
            ->values();

        return Inertia::render('leaderboard/index', [
            'eventName' => $settings->event_name,
            'standings' => $standings,
            'rounds' => Round::query()->orderBy('sequence')->get(['id', 'name', 'sequence', 'weight', 'status']),
            'isFinal' => Round::query()->where('status', '!=', RoundStatus::Locked)->doesntExist(),
            'publishedAt' => $settings->published_at?->toIso8601String(),
        ]);
    }

    public function show(Participant $participant): Response
    {
        $settings = EventSetting::current();

        abort_unless($settings->results_published, 404);

        $breakdown = collect($this->calculator->participantBreakdown($participant))
            ->map(fn (array $entry) => [
                'round' => $entry['round']->only(['id', 'name', 'sequence', 'weight', 'status']),
                'score' => $entry['score'],
                'criteria' => $entry['criteria'],
            ]);

        $standing = collect($this->calculator->cachedStandings())
            ->firstWhere(fn (array $entry) => $entry['participant']->id === $participant->id);

        return Inertia::render('leaderboard/show', [
            'eventName' => $settings->event_name,
            'participant' => [
                'id' => $participant->id,
                'participant_number' => $participant->participant_number,
                'name' => $participant->name,
                'institution' => $participant->institution,
                'panel' => $participant->panels->first()?->name,
            ],
            'rank' => $standing['rank'] ?? null,
            'total' => $standing['total'] ?? 0,
            'breakdown' => $breakdown,
        ]);
    }
}
