<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int|null $actor_id
 * @property string $event
 * @property string|null $subject_type
 * @property int|null $subject_id
 * @property array|null $context
 * @property Carbon|null $created_at
 * @property-read User|null $actor
 * @property-read Model|null $subject
 */
#[Fillable(['actor_id', 'event', 'subject_type', 'subject_id', 'context'])]
class AuditLog extends Model
{
    public const UPDATED_AT = null;

    /**
     * @return BelongsTo<User, $this>
     */
    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    /**
     * @return MorphTo<Model, $this>
     */
    public function subject(): MorphTo
    {
        return $this->morphTo('subject');
    }

    protected function casts(): array
    {
        return [
            'context' => 'array',
        ];
    }
}
