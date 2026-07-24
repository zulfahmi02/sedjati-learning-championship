<?php

namespace App\Services;

use App\Enums\ScoreSheetStatus;
use App\Models\Participant;
use App\Models\Round;
use App\Models\Score;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

/**
 * Calculates weighted scores for the single-judge-per-panel model.
 *
 * Formulas:
 *   normalized(value)       = value / criterion.max_score * 100
 *   judge_round_score       = Σ criteria ( normalized * criterion.weight / 100 )
 *   participant_round_score = judge_round_score of the SUBMITTED sheet from the
 *                             participant's panel judge (no cross-judge average)
 *   overall_score           = Σ rounds ( participant_round_score * round.weight / 100 )
 */
class ScoreCalculationService
{
    private const CACHE_SECONDS = 10;

    /**
     * Score per participant for one round, keyed by participant_id.
     *
     * @return Collection<int, float>
     */
    public function roundScores(Round $round): Collection
    {
        return Score::query()
            ->join('score_sheets', 'scores.score_sheet_id', '=', 'score_sheets.id')
            ->join('criteria', 'scores.criterion_id', '=', 'criteria.id')
            ->where('score_sheets.round_id', $round->id)
            ->where('score_sheets.status', ScoreSheetStatus::Submitted->value)
            ->groupBy('score_sheets.participant_id')
            ->selectRaw('score_sheets.participant_id as participant_id')
            ->selectRaw('SUM(scores.value / (criteria.max_score * 1.0) * 100 * criteria.weight / 100.0) as round_score')
            ->pluck('round_score', 'participant_id')
            ->map(fn ($score) => round((float) $score, 2));
    }

    /**
     * Overall standings across all rounds, ranked (dense rank; ties share rank).
     *
     * @return array<int, array{rank: int, participant: Participant, total: float, rounds: array<int, float|null>}>
     */
    public function overallStandings(): array
    {
        return $this->rankedStandings();
    }

    /**
     * @return array<int, array{rank: int, participant: Participant, total: float, rounds: array<int, float|null>}>
     */
    private function rankedStandings(): array
    {
        $rounds = Round::query()->orderBy('sequence')->get();

        $roundScores = $rounds->mapWithKeys(
            fn (Round $round) => [$round->id => $this->roundScores($round)],
        );

        $participants = Participant::query()
            ->with('panels:id,name')
            ->orderBy('participant_number')
            ->get();

        $entries = $participants->map(function (Participant $participant) use ($rounds, $roundScores) {
            $total = 0.0;
            $perRound = [];

            foreach ($rounds as $round) {
                $score = $roundScores[$round->id]->get($participant->id);
                $perRound[$round->id] = $score;
                $total += ($score ?? 0) * $round->weight / 100;
            }

            return [
                'participant' => $participant,
                'total' => round($total, 2),
                'rounds' => $perRound,
            ];
        })->sortByDesc('total')->values();

        // Dense rank: equal totals share a rank.
        $ranked = [];
        $rank = 0;
        $previousTotal = null;

        foreach ($entries as $entry) {
            if ($previousTotal === null || $entry['total'] < $previousTotal) {
                $rank++;
            }

            $previousTotal = $entry['total'];

            $ranked[] = [
                'rank' => $rank,
                'participant' => $entry['participant'],
                'total' => $entry['total'],
                'rounds' => $entry['rounds'],
            ];
        }

        return $ranked;
    }

    /**
     * Cached standings for the public leaderboard.
     *
     * @return array<int, array{rank: int, participant: Participant, total: float, rounds: array<int, float|null>}>
     */
    public function cachedStandings(): array
    {
        return Cache::remember(
            'leaderboard:standings',
            self::CACHE_SECONDS,
            fn (): array => $this->rankedStandings(),
        );
    }

    public function forgetCachedStandings(): void
    {
        Cache::forget('leaderboard:standings');
    }

    /**
     * Per-round, per-criterion breakdown for one participant.
     *
     * @return array<int, array{round: Round, score: float|null, criteria: array<int, array{name: string, weight: int, max_score: int, value: float|null}>}>
     */
    public function participantBreakdown(Participant $participant): array
    {
        $rounds = Round::query()->with('criteria')->orderBy('sequence')->get();

        $breakdown = [];

        foreach ($rounds as $round) {
            $sheet = $participant->scoreSheets()
                ->where('round_id', $round->id)
                ->where('status', ScoreSheetStatus::Submitted)
                ->with('scores')
                ->first();

            $values = $sheet?->scores->pluck('value', 'criterion_id');

            $criteria = [];

            foreach ($round->criteria as $criterion) {
                $criteria[] = [
                    'name' => $criterion->name,
                    'weight' => $criterion->weight,
                    'max_score' => $criterion->max_score,
                    'value' => $values?->has($criterion->id)
                        ? (float) $values[$criterion->id]
                        : null,
                ];
            }

            $breakdown[] = [
                'round' => $round,
                'score' => $this->roundScores($round)->get($participant->id),
                'criteria' => $criteria,
            ];
        }

        return $breakdown;
    }
}
