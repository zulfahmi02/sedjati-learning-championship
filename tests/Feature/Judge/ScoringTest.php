<?php

use App\Enums\RoundStatus;
use App\Enums\ScoreSheetStatus;
use App\Models\Criterion;
use App\Models\Panel;
use App\Models\Participant;
use App\Models\Round;
use App\Models\ScoreSheet;
use App\Models\User;

function setUpScoringContext(): array
{
    $judge = User::factory()->judge()->create();
    $panel = Panel::factory()->create(['judge_id' => $judge->id]);
    $participant = Participant::factory()->create();
    $participant->panels()->attach($panel);
    $round = Round::factory()->active()->create();
    $criteria = Criterion::factory()->for($round)->count(2)->sequence(
        ['weight' => 60, 'sequence' => 1],
        ['weight' => 40, 'sequence' => 2],
    )->create();

    return [$judge, $panel, $participant, $round, $criteria];
}

test('judges can open the scoring page for their panel participants', function () {
    [$judge, , $participant] = setUpScoringContext();

    $this->actingAs($judge)
        ->get(route('judge.scoring.show', $participant))
        ->assertOk();
});

test('judges can not score participants outside their panel', function () {
    setUpScoringContext();
    $otherJudge = User::factory()->judge()->create();
    Panel::factory()->create(['judge_id' => $otherJudge->id]);
    $foreignParticipant = Participant::factory()->create();

    $this->actingAs($otherJudge)
        ->get(route('judge.scoring.show', $foreignParticipant))
        ->assertForbidden();
});

test('judges can save a draft of scores', function () {
    [$judge, , $participant, $round, $criteria] = setUpScoringContext();

    $this->actingAs($judge)
        ->put(route('judge.scoring.update', $participant), [
            'scores' => [
                $criteria[0]->id => 85,
                $criteria[1]->id => 90,
            ],
        ])
        ->assertRedirect();

    $sheet = ScoreSheet::query()->where([
        'user_id' => $judge->id,
        'participant_id' => $participant->id,
        'round_id' => $round->id,
    ])->first();

    expect($sheet)->not->toBeNull();
    expect($sheet->isDraft())->toBeTrue();
    expect($sheet->scores()->count())->toBe(2);

    $this->assertDatabaseHas('audit_logs', ['event' => 'score.draft_saved']);
});

test('score values outside the criterion range are rejected', function () {
    [$judge, , $participant, , $criteria] = setUpScoringContext();

    $this->actingAs($judge)
        ->put(route('judge.scoring.update', $participant), [
            'scores' => [
                $criteria[0]->id => 150,
                $criteria[1]->id => 90,
            ],
        ])
        ->assertSessionHasErrors('scores.'.$criteria[0]->id);
});

test('scoring is rejected when no round is active', function () {
    $judge = User::factory()->judge()->create();
    $panel = Panel::factory()->create(['judge_id' => $judge->id]);
    $participant = Participant::factory()->create();
    $participant->panels()->attach($panel);
    Round::factory()->create(); // pending only

    $this->actingAs($judge)
        ->put(route('judge.scoring.update', $participant), [
            'scores' => [],
        ])
        ->assertNotFound();
});

test('a complete sheet can be submitted and becomes immutable', function () {
    [$judge, , $participant, $round, $criteria] = setUpScoringContext();

    $this->actingAs($judge)->put(route('judge.scoring.update', $participant), [
        'scores' => [
            $criteria[0]->id => 85,
            $criteria[1]->id => 90,
        ],
    ]);

    $this->actingAs($judge)
        ->post(route('judge.scoring.submit', $participant))
        ->assertRedirect(route('judge.scoring.index'));

    $sheet = ScoreSheet::query()->first();
    expect($sheet->status)->toBe(ScoreSheetStatus::Submitted);

    $this->assertDatabaseHas('audit_logs', ['event' => 'score.submitted']);

    // Further edits are rejected.
    $this->actingAs($judge)
        ->put(route('judge.scoring.update', $participant), [
            'scores' => [
                $criteria[0]->id => 50,
                $criteria[1]->id => 50,
            ],
        ])
        ->assertForbidden();
});

test('an incomplete sheet can not be submitted', function () {
    [$judge, , $participant, , $criteria] = setUpScoringContext();

    $this->actingAs($judge)->put(route('judge.scoring.update', $participant), [
        'scores' => [
            $criteria[0]->id => 85,
        ],
    ]);

    $this->actingAs($judge)
        ->post(route('judge.scoring.submit', $participant))
        ->assertSessionHasErrors('scores');

    expect(ScoreSheet::query()->first()->isDraft())->toBeTrue();
});

test('submission requires saved scores', function () {
    [$judge, , $participant] = setUpScoringContext();

    $this->actingAs($judge)
        ->post(route('judge.scoring.submit', $participant))
        ->assertSessionHasErrors('scores');
});

test('scoring is closed once the round is locked', function () {
    [$judge, , $participant, $round, $criteria] = setUpScoringContext();

    $round->update(['status' => RoundStatus::Locked]);

    $this->actingAs($judge)
        ->put(route('judge.scoring.update', $participant), [
            'scores' => [
                $criteria[0]->id => 85,
                $criteria[1]->id => 90,
            ],
        ])
        ->assertNotFound(); // no active round anymore
});

test('admins can not access judge scoring routes', function () {
    [, , $participant] = setUpScoringContext();
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get(route('judge.scoring.show', $participant))
        ->assertForbidden();
});
