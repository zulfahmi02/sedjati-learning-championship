<?php

namespace Database\Factories;

use App\Enums\ScoreSheetStatus;
use App\Models\Participant;
use App\Models\Round;
use App\Models\ScoreSheet;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ScoreSheet>
 */
class ScoreSheetFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory()->judge(),
            'participant_id' => Participant::factory(),
            'round_id' => Round::factory(),
            'status' => ScoreSheetStatus::Draft,
            'submitted_at' => null,
        ];
    }

    public function submitted(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ScoreSheetStatus::Submitted,
            'submitted_at' => now(),
        ]);
    }
}
