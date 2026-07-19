<?php

namespace Database\Factories;

use App\Models\Criterion;
use App\Models\Score;
use App\Models\ScoreSheet;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Score>
 */
class ScoreFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'score_sheet_id' => ScoreSheet::factory(),
            'criterion_id' => Criterion::factory(),
            'value' => fake()->randomFloat(2, 0, 100),
        ];
    }
}
