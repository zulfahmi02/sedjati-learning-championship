<?php

namespace App\Models;

use App\Enums\RoundStatus;
use Database\Factories\RoundFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property int $sequence
 * @property int $weight
 * @property RoundStatus $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, Criterion> $criteria
 * @property-read \Illuminate\Database\Eloquent\Collection<int, ScoreSheet> $scoreSheets
 */
#[Fillable(['name', 'sequence', 'weight', 'status'])]
class Round extends Model
{
    /** @use HasFactory<RoundFactory> */
    use HasFactory;

    /**
     * @return HasMany<Criterion, $this>
     */
    public function criteria(): HasMany
    {
        return $this->hasMany(Criterion::class)->orderBy('sequence');
    }

    /**
     * @return HasMany<ScoreSheet, $this>
     */
    public function scoreSheets(): HasMany
    {
        return $this->hasMany(ScoreSheet::class);
    }

    public function isPending(): bool
    {
        return $this->status === RoundStatus::Pending;
    }

    public function isActive(): bool
    {
        return $this->status === RoundStatus::Active;
    }

    public function isLocked(): bool
    {
        return $this->status === RoundStatus::Locked;
    }

    /**
     * Get the currently active round, if any.
     */
    public static function active(): ?self
    {
        return self::query()->where('status', RoundStatus::Active)->first();
    }

    protected function casts(): array
    {
        return [
            'status' => RoundStatus::class,
        ];
    }
}
