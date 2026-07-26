<?php

namespace App\Actions\Judge;

use App\Enums\ScoreSheetStatus;
use App\Models\Criterion;
use App\Models\Participant;
use App\Models\Round;
use App\Models\ScoreSheet;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class SaveLiveScoreBatch
{
    /**
     * @param  array<int, array{participant_id: int, value: int|float|string}>  $entries
     *
     * @throws AuthorizationException
     */
    public function handle(
        User $judge,
        Round $round,
        Criterion $criterion,
        array $entries,
        bool $submit,
    ): int {
        $participants = Participant::query()
            ->whereKey(collect($entries)->pluck('participant_id'))
            ->get()
            ->keyBy('id');

        foreach ($participants as $participant) {
            Gate::forUser($judge)->authorize('score', [ScoreSheet::class, $participant, $round]);
        }

        return DB::transaction(function () use ($judge, $round, $criterion, $entries, $participants, $submit): int {
            $lockedRound = Round::query()->lockForUpdate()->findOrFail($round->id);
            abort_unless($lockedRound->isActive(), 404);

            foreach (collect($entries)->sortBy('participant_id') as $entry) {
                $participant = $participants->get($entry['participant_id']);
                abort_unless($participant instanceof Participant, 404);

                $sheet = ScoreSheet::query()->firstOrCreate([
                    'user_id' => $judge->id,
                    'participant_id' => $participant->id,
                    'round_id' => $lockedRound->id,
                ], [
                    'status' => ScoreSheetStatus::Draft,
                ]);

                $sheet = ScoreSheet::query()
                    ->whereKey($sheet->id)
                    ->lockForUpdate()
                    ->firstOrFail()
                    ->setRelation('round', $lockedRound);

                Gate::forUser($judge)->authorize('update', $sheet);

                $score = $sheet->scores()->firstOrCreate(
                    ['criterion_id' => $criterion->id],
                    ['value' => 0],
                );
                $oldValue = (float) $score->value;
                $newValue = (float) $entry['value'];

                if ($newValue !== $oldValue) {
                    $score->update(['value' => $newValue]);

                    AuditLogger::log($judge, 'score.live_updated', $sheet, [
                        'round_id' => $lockedRound->id,
                        'participant_id' => $participant->id,
                        'criterion_id' => $criterion->id,
                        'old_value' => $oldValue,
                        'new_value' => $newValue,
                    ]);
                }

                if ($submit) {
                    $sheet->update([
                        'status' => ScoreSheetStatus::Submitted,
                        'submitted_at' => now(),
                    ]);

                    AuditLogger::log($judge, 'score.submitted', $sheet, [
                        'round_id' => $lockedRound->id,
                        'participant_id' => $participant->id,
                        'criterion_id' => $criterion->id,
                        'score' => $newValue,
                    ]);
                }
            }

            return count($entries);
        }, attempts: 3);
    }
}
