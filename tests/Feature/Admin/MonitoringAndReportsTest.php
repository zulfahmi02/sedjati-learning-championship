<?php

use App\Enums\RoundStatus;
use App\Enums\ScoreSheetStatus;
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

    return [$round, $panel, $scored, $unscored, $judge, $criterion, $sheet];
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

test('monitoring includes submitted participants and their score sheet IDs', function () {
    [, , $scored, , , , $sheet] = seedMonitoringData();
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get(route('admin.monitoring.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('matrix.0.submittedParticipants.0.id', $scored->id)
            ->where('matrix.0.submittedParticipants.0.score_sheet_id', $sheet->id),
        );
});

test('admins can reopen submitted score sheets without removing their scores', function () {
    [, , $scored, , , $criterion, $sheet] = seedMonitoringData();
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->put(route('admin.monitoring.score-sheets.reopen', $sheet))
        ->assertRedirect();

    $sheet->refresh();

    expect($sheet->isDraft())->toBeTrue();
    expect($sheet->submitted_at)->toBeNull();
    $this->assertDatabaseHas('scores', [
        'score_sheet_id' => $sheet->id,
        'criterion_id' => $criterion->id,
        'value' => 90,
    ]);
    expect($sheet->participant->is($scored))->toBeTrue();
});

test('a judge can correct and resubmit a reopened score sheet', function () {
    [, , $scored, , $judge, $criterion, $sheet] = seedMonitoringData();
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->put(route('admin.monitoring.score-sheets.reopen', $sheet));

    $this->actingAs($judge)
        ->put(route('judge.scoring.update', $scored), [
            'scores' => [$criterion->id => 85],
        ])
        ->assertRedirect();

    $this->actingAs($judge)
        ->post(route('judge.scoring.submit', $scored))
        ->assertRedirect(route('judge.scoring.index'));

    expect($sheet->refresh()->isSubmitted())->toBeTrue();
    $this->assertDatabaseHas('scores', [
        'score_sheet_id' => $sheet->id,
        'criterion_id' => $criterion->id,
        'value' => 85,
    ]);
});

test('judges can not reopen submitted score sheets', function () {
    [, , , , $judge, , $sheet] = seedMonitoringData();

    $this->actingAs($judge)
        ->put(route('admin.monitoring.score-sheets.reopen', $sheet))
        ->assertForbidden();

    expect($sheet->refresh()->isSubmitted())->toBeTrue();
});

test('admins can not reopen score sheets from locked rounds', function () {
    [$round, , , , , , $sheet] = seedMonitoringData();
    $admin = User::factory()->admin()->create();
    $round->update(['status' => RoundStatus::Locked]);

    $this->actingAs($admin)
        ->put(route('admin.monitoring.score-sheets.reopen', $sheet))
        ->assertForbidden();

    expect($sheet->refresh()->isSubmitted())->toBeTrue();
});

test('admins can not reopen draft score sheets', function () {
    [, , , , , , $sheet] = seedMonitoringData();
    $admin = User::factory()->admin()->create();
    $sheet->update([
        'status' => ScoreSheetStatus::Draft,
        'submitted_at' => null,
    ]);

    $this->actingAs($admin)
        ->put(route('admin.monitoring.score-sheets.reopen', $sheet))
        ->assertForbidden();

    expect($sheet->refresh()->isDraft())->toBeTrue();
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
