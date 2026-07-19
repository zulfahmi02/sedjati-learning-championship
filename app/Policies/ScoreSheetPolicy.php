<?php

namespace App\Policies;

use App\Models\Participant;
use App\Models\Round;
use App\Models\ScoreSheet;
use App\Models\User;

class ScoreSheetPolicy
{
    /**
     * Determine whether the judge may score the given participant in the given round.
     *
     * Rules: only judges, only for participants in the panel they hold
     * (panels.judge_id), and only while the round is active.
     */
    public function score(User $user, Participant $participant, Round $round): bool
    {
        if (! $user->isJudge() || ! $user->is_active) {
            return false;
        }

        if (! $round->isActive()) {
            return false;
        }

        return $participant->panels()
            ->where('judge_id', $user->id)
            ->exists();
    }

    /**
     * Determine whether the sheet itself may still be modified.
     */
    public function update(User $user, ScoreSheet $scoreSheet): bool
    {
        return $scoreSheet->user_id === $user->id
            && $scoreSheet->isDraft()
            && $scoreSheet->round->isActive();
    }
}
