<?php

namespace App\Models;

use Database\Factories\PanelFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property int|null $judge_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read User|null $judge
 * @property-read \Illuminate\Database\Eloquent\Collection<int, Participant> $participants
 */
#[Fillable(['name', 'description', 'judge_id'])]
class Panel extends Model
{
    /** @use HasFactory<PanelFactory> */
    use HasFactory;

    /**
     * The single judge assigned to this panel (1 panel = 1 judge).
     *
     * @return BelongsTo<User, $this>
     */
    public function judge(): BelongsTo
    {
        return $this->belongsTo(User::class, 'judge_id');
    }

    /**
     * @return BelongsToMany<Participant, $this>
     */
    public function participants(): BelongsToMany
    {
        return $this->belongsToMany(Participant::class);
    }

    public function hasJudge(): bool
    {
        return $this->judge_id !== null;
    }
}
