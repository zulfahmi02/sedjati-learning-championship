<?php

namespace Database\Factories;

use App\Models\Criterion;
use App\Models\Round;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Criterion>
 */
class CriterionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'round_id' => Round::factory(),
            'name' => fake()->unique()->words(2, true),
            'description' => fake()->sentence(),
            'weight' => 100,
            'min_score' => 0,
            'max_score' => 100,
            'sequence' => 1,
        ];
    }
}
