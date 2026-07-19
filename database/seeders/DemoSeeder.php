<?php

namespace Database\Seeders;

use App\Enums\RoundStatus;
use App\Enums\ScoreSheetStatus;
use App\Models\Criterion;
use App\Models\Panel;
use App\Models\Participant;
use App\Models\Round;
use App\Models\Score;
use App\Models\ScoreSheet;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

/**
 * Demo data: 3 rounds (30/30/40), 4 panels × 1 judge, 40 participants,
 * partially submitted scores for the active round. Run explicitly:
 *
 *   php artisan db:seed --class=DemoSeeder
 */
class DemoSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $rounds = collect([
            ['name' => 'Penyisihan', 'sequence' => 1, 'weight' => 30, 'status' => RoundStatus::Active],
            ['name' => 'Semifinal', 'sequence' => 2, 'weight' => 30, 'status' => RoundStatus::Pending],
            ['name' => 'Final', 'sequence' => 3, 'weight' => 40, 'status' => RoundStatus::Pending],
        ])->map(fn (array $data) => Round::factory()->create($data));

        $criteriaTemplate = [
            ['name' => 'Technique', 'description' => 'Struktur materi dan penggunaan alat bantu.', 'weight' => 40],
            ['name' => 'Presentation', 'description' => 'Intonasi, artikulasi, dan bahasa tubuh.', 'weight' => 30],
            ['name' => 'Creativity', 'description' => 'Keaslian ide dan cara penyampaian yang unik.', 'weight' => 30],
        ];

        foreach ($rounds as $round) {
            foreach ($criteriaTemplate as $index => $criterion) {
                Criterion::factory()->for($round)->create([
                    ...$criterion,
                    'sequence' => $index + 1,
                ]);
            }
        }

        $panels = collect(['Alpha', 'Bravo', 'Charlie', 'Delta'])->map(function (string $name, int $index) {
            $judge = User::factory()->judge()->create([
                'name' => 'Juri '.($index + 1),
                'email' => 'juri'.($index + 1).'@slc.test',
            ]);

            return Panel::factory()->create([
                'name' => 'Panel '.$name,
                'judge_id' => $judge->id,
            ]);
        });

        $activeRound = $rounds->first();
        $activeCriteria = $activeRound->criteria;

        Participant::factory()->count(40)->create()->each(function (Participant $participant, int $index) use ($panels, $activeRound, $activeCriteria) {
            $panel = $panels[$index % $panels->count()];
            $participant->panels()->attach($panel);

            // ~65% of participants already scored in the active round.
            if ($index % 3 === 2) {
                return;
            }

            $sheet = ScoreSheet::factory()->submitted()->create([
                'user_id' => $panel->judge_id,
                'participant_id' => $participant->id,
                'round_id' => $activeRound->id,
                'submitted_at' => now()->subMinutes(random_int(1, 120)),
            ]);

            foreach ($activeCriteria as $criterion) {
                Score::factory()->create([
                    'score_sheet_id' => $sheet->id,
                    'criterion_id' => $criterion->id,
                    'value' => random_int(60, 98),
                ]);
            }
        });
    }
}
