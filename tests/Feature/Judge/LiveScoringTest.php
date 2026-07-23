<?php

use App\Enums\ScoreSheetStatus;
use App\Models\Criterion;
use App\Models\Panel;
use App\Models\Participant;
use App\Models\Round;
use App\Models\Score;
use App\Models\ScoreSheet;
use App\Models\User;

function setUpLiveScoringContext(): array
{
    $judge = User::factory()->judge()->create();
    $panel = Panel::factory()->create(['judge_id' => $judge->id]);
    $participant = Participant::factory()->create();
    $participant->panels()->attach($panel);
    $round = Round::factory()->active()->create();
    $criterion = Criterion::factory()->for($round)->create([
        'weight' => 100,
        'min_score' => 0,
        'max_score' => 10,
        'sequence' => 1,
    ]);

    return [$judge, $panel, $participant, $round, $criterion];
}

test('judges can view the live scoring page', function () {
    [$judge] = setUpLiveScoringContext();

    $this->actingAs($judge)
        ->get(route('judge.live-scoring.index'))
        ->assertOk();
});

test('live scoring redirects to dashboard when no round is active', function () {
    $judge = User::factory()->judge()->create();
    $panel = Panel::factory()->create(['judge_id' => $judge->id]);
    $participant = Participant::factory()->create();
    $participant->panels()->attach($panel);
    Round::factory()->create(); // pending only

    $this->actingAs($judge)
        ->get(route('judge.live-scoring.index'))
        ->assertRedirect(route('judge.dashboard'));
});

test('judges can increment a score for their panel participant', function () {
    [$judge, , $participant, $round, $criterion] = setUpLiveScoringContext();

    $this->actingAs($judge)
        ->post(route('judge.live-scoring.increment', $participant))
        ->assertRedirect();

    $sheet = ScoreSheet::query()->where([
        'user_id' => $judge->id,
        'participant_id' => $participant->id,
        'round_id' => $round->id,
    ])->first();

    expect($sheet)->not->toBeNull();
    expect($sheet->status)->toBe(ScoreSheetStatus::Submitted);

    $score = $sheet->scores()->where('criterion_id', $criterion->id)->first();
    expect($score)->not->toBeNull();
    expect((float) $score->value)->toBe(1.0);
});

test('multiple increments accumulate correctly', function () {
    [$judge, , $participant, , $criterion] = setUpLiveScoringContext();

    for ($i = 0; $i < 5; $i++) {
        $this->actingAs($judge)
            ->post(route('judge.live-scoring.increment', $participant));
    }

    $score = Score::query()
        ->whereHas('scoreSheet', fn ($q) => $q->where('user_id', $judge->id)->where('participant_id', $participant->id))
        ->where('criterion_id', $criterion->id)
        ->first();

    expect((float) $score->value)->toBe(5.0);
});

test('score does not exceed the criterion max_score', function () {
    [$judge, , $participant, , $criterion] = setUpLiveScoringContext();

    // max_score is 10, increment 12 times
    for ($i = 0; $i < 12; $i++) {
        $this->actingAs($judge)
            ->post(route('judge.live-scoring.increment', $participant));
    }

    $score = Score::query()
        ->whereHas('scoreSheet', fn ($q) => $q->where('user_id', $judge->id)->where('participant_id', $participant->id))
        ->where('criterion_id', $criterion->id)
        ->first();

    expect((float) $score->value)->toBe(10.0);
});

test('judges can not increment scores for participants outside their panel', function () {
    setUpLiveScoringContext();
    $otherJudge = User::factory()->judge()->create();
    Panel::factory()->create(['judge_id' => $otherJudge->id]);
    $foreignParticipant = Participant::factory()->create();

    $this->actingAs($otherJudge)
        ->post(route('judge.live-scoring.increment', $foreignParticipant))
        ->assertForbidden();
});

test('increment is rejected when no round is active', function () {
    $judge = User::factory()->judge()->create();
    $panel = Panel::factory()->create(['judge_id' => $judge->id]);
    $participant = Participant::factory()->create();
    $participant->panels()->attach($panel);
    Round::factory()->create(); // pending only

    $this->actingAs($judge)
        ->post(route('judge.live-scoring.increment', $participant))
        ->assertNotFound();
});

test('admins can not access live scoring routes', function () {
    setUpLiveScoringContext();
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get(route('judge.live-scoring.index'))
        ->assertForbidden();
});
