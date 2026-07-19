<?php

namespace Database\Factories;

use App\Enums\RoundStatus;
use App\Models\Round;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Round>
 */
class RoundFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => 'Ronde '.fake()->unique()->word(),
            'sequence' => fake()->unique()->numberBetween(1, 1000),
            'weight' => 100,
            'status' => RoundStatus::Pending,
        ];
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => RoundStatus::Active,
        ]);
    }

    public function locked(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => RoundStatus::Locked,
        ]);
    }
}
