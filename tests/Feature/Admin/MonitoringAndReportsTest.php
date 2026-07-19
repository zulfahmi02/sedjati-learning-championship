<?php

use App\Models\Criterion;
use App\Models\Panel;
use App\Models\Participant;
use App\Models\Round;
use App\Models\Score;
use App\Models\ScoreSheet;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function seedMonitoringData(): array
{
    $round = Round::factory()->active()->create(['weight' => 100]);
    $criterion = Criterion::factory()->for($round)->create(['weight' => 100]);

    $judge = User::factory()->judge()->create();
    $panel = Panel::factory()->create(['judge_id' => $judge->id]);

    $scored = Participant::factory()->create();
    $unscored = Participant::factory()->create();
    $scored->panels()->attach($panel);
    $unscored->panels()->attach($panel);

    $sheet = ScoreSheet::factory()->submitted()->create([
        'user_id' => $judge->id,
        'participant_id' => $scored->id,
        'round_id' => $round->id,
    ]);
    Score::factory()->create([
        'score_sheet_id' => $sheet->id,
        'criterion_id' => $criterion->id,
        'value' => 90,
    ]);

    return [$round, $panel, $scored, $unscored];
}

test('admins can view the monitoring page with per panel progress', function () {
    [, , , $unscored] = seedMonitoringData();
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get(route('admin.monitoring.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/monitoring')
            ->where('totals.expected', 2)
            ->where('totals.submitted', 1)
            ->where('totals.unscored', 1)
            ->where('matrix.0.pendingParticipants.0.name', $unscored->name),
        );
});

test('judges can not view monitoring', function () {
    $judge = User::factory()->judge()->create();

    $this->actingAs($judge)
        ->get(route('admin.monitoring.index'))
        ->assertForbidden();
});

test('the ranking recap downloads as xlsx', function () {
    seedMonitoringData();
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)
        ->get(route('admin.reports.ranking', ['format' => 'xlsx']));

    $response->assertOk();
    $response->assertHeader('content-disposition', 'attachment; filename="rekap-ranking-slc.xlsx"');
});

test('the ranking recap downloads as pdf', function () {
    seedMonitoringData();
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)
        ->get(route('admin.reports.ranking', ['format' => 'pdf']));

    $response->assertOk();
    $response->assertHeader('content-type', 'application/pdf');
});

test('the score recap downloads as xlsx', function () {
    seedMonitoringData();
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)
        ->get(route('admin.reports.score-recap', ['format' => 'xlsx']));

    $response->assertOk();
    $response->assertHeader('content-disposition', 'attachment; filename="rekap-nilai-slc.xlsx"');
});

test('the score recap downloads as pdf', function () {
    seedMonitoringData();
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)
        ->get(route('admin.reports.score-recap', ['format' => 'pdf']));

    $response->assertOk();
    $response->assertHeader('content-type', 'application/pdf');
});

test('reports are admin only', function () {
    $judge = User::factory()->judge()->create();

    $this->actingAs($judge)
        ->get(route('admin.reports.ranking'))
        ->assertForbidden();
});
