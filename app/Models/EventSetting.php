<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * Single-row settings for the (single) event.
 *
 * @property int $id
 * @property string $event_name
 * @property bool $results_published
 * @property Carbon|null $published_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['event_name', 'results_published', 'published_at'])]
class EventSetting extends Model
{
    public static function current(): self
    {
        return self::query()->firstOrCreate([]);
    }

    protected function casts(): array
    {
        return [
            'results_published' => 'boolean',
            'published_at' => 'datetime',
        ];
    }
}
