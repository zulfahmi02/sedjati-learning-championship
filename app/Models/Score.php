<?php

namespace App\Models;

use Database\Factories\ScoreFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $score_sheet_id
 * @property int $criterion_id
 * @property numeric-string $value
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read ScoreSheet $scoreSheet
 * @property-read Criterion $criterion
 */
#[Fillable(['score_sheet_id', 'criterion_id', 'value'])]
class Score extends Model
{
    /** @use HasFactory<ScoreFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<ScoreSheet, $this>
     */
    public function scoreSheet(): BelongsTo
    {
        return $this->belongsTo(ScoreSheet::class);
    }

    /**
     * @return BelongsTo<Criterion, $this>
     */
    public function criterion(): BelongsTo
    {
        return $this->belongsTo(Criterion::class);
    }

    protected function casts(): array
    {
        return [
            'value' => 'decimal:2',
        ];
    }
}
