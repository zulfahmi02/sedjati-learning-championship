<?php

namespace App\Models;

use Database\Factories\CriterionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $round_id
 * @property string $name
 * @property string|null $description
 * @property int $weight
 * @property int $min_score
 * @property int $max_score
 * @property int $sequence
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Round $round
 */
#[Fillable(['round_id', 'name', 'description', 'weight', 'min_score', 'max_score', 'sequence'])]
class Criterion extends Model
{
    /** @use HasFactory<CriterionFactory> */
    use HasFactory;

    protected $table = 'criteria';

    /**
     * @return BelongsTo<Round, $this>
     */
    public function round(): BelongsTo
    {
        return $this->belongsTo(Round::class);
    }
}
