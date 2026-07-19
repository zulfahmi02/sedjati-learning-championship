<?php

namespace Database\Factories;

use App\Models\Panel;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Panel>
 */
class PanelFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => 'Panel '.fake()->unique()->word(),
            'description' => fake()->sentence(),
            'judge_id' => null,
        ];
    }

    /**
     * Assign a (new) judge to the panel.
     */
    public function withJudge(?User $judge = null): static
    {
        return $this->state(fn (array $attributes) => [
            'judge_id' => $judge->id ?? User::factory()->judge(),
        ]);
    }
}
