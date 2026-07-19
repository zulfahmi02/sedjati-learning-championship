<?php

namespace App\Models;

use App\Enums\ScoreSheetStatus;
use Database\Factories\ScoreSheetFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property int $participant_id
 * @property int $round_id
 * @property ScoreSheetStatus $status
 * @property Carbon|null $submitted_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read User $judge
 * @property-read Participant $participant
 * @property-read Round $round
 * @property-read \Illuminate\Database\Eloquent\Collection<int, Score> $scores
 */
#[Fillable(['user_id', 'participant_id', 'round_id', 'status', 'submitted_at'])]
class ScoreSheet extends Model
{
    /** @use HasFactory<ScoreSheetFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<User, $this>
     */
    public function judge(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * @return BelongsTo<Participant, $this>
     */
    public function participant(): BelongsTo
    {
        return $this->belongsTo(Participant::class);
    }

    /**
     * @return BelongsTo<Round, $this>
     */
    public function round(): BelongsTo
    {
        return $this->belongsTo(Round::class);
    }

    /**
     * @return HasMany<Score, $this>
     */
    public function scores(): HasMany
    {
        return $this->hasMany(Score::class);
    }

    public function isDraft(): bool
    {
        return $this->status === ScoreSheetStatus::Draft;
    }

    public function isSubmitted(): bool
    {
        return $this->status === ScoreSheetStatus::Submitted;
    }

    /**
     * Determine whether every criterion of the round has a score.
     */
    public function isComplete(): bool
    {
        $criterionIds = $this->round->criteria()->pluck('id');

        return $criterionIds->isNotEmpty()
            && $criterionIds->diff($this->scores()->pluck('criterion_id'))->isEmpty();
    }

    protected function casts(): array
    {
        return [
            'status' => ScoreSheetStatus::class,
            'submitted_at' => 'datetime',
        ];
    }
}
