<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class AuditLogger
{
    /**
     * Log a domain activity event.
     *
     * @param  User|null  $actor  The user performing the action
     * @param  string  $event  The stable event name (e.g. 'score.draft_saved')
     * @param  Model|null  $subject  The primary model affected by this event
     * @param  array<string, mixed>  $context  Snapshot of relevant state or diffs
     */
    public static function log(?Model $actor, string $event, ?Model $subject = null, array $context = []): void
    {
        AuditLog::query()->create([
            'actor_id' => $actor?->id,
            'event' => $event,
            'subject_type' => $subject?->getMorphClass(),
            'subject_id' => $subject?->getKey(),
            'context' => empty($context) ? null : $context,
        ]);
    }
}
