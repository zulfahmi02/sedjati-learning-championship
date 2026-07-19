<?php

namespace App\Models;

use Database\Factories\ParticipantFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $participant_number
 * @property string $name
 * @property string|null $institution
 * @property string|null $category
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Panel|null $panel
 * @property-read \Illuminate\Database\Eloquent\Collection<int, ScoreSheet> $scoreSheets
 */
#[Fillable(['participant_number', 'name', 'institution', 'category', 'notes'])]
class Participant extends Model
{
    /** @use HasFactory<ParticipantFactory> */
    use HasFactory;

    /**
     * @return BelongsToMany<Panel, $this>
     */
    public function panels(): BelongsToMany
    {
        return $this->belongsToMany(Panel::class);
    }

    /**
     * The single panel this participant is assigned to (global assignment).
     */
    public function getPanelAttribute(): ?Panel
    {
        return $this->panels->first();
    }

    /**
     * @return HasMany<ScoreSheet, $this>
     */
    public function scoreSheets(): HasMany
    {
        return $this->hasMany(ScoreSheet::class);
    }
}
