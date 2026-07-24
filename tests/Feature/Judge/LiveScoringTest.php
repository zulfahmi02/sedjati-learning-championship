<?php

use App\Enums\ScoreSheetStatus;
use App\Models\Criterion;
use App\Models\Panel;
use App\Models\Participant;
use App\Models\Round;
use App\Models\Score;
use App\Models\ScoreSheet;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

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

test('judges can view live scoring with criterion and participant status', function () {
    [$judge, , $participant] = setUpLiveScoringContext();

    $this->actingAs($judge)
        ->get(route('judge.live-scoring.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('judge/live-scoring')
            ->where('criterion.weight', 100)
            ->where('criterion.min_score', 0)
            ->where('participants.0.id', $participant->id)
            ->where('participants.0.current_score', 0)
            ->where('participants.0.status', 'pending'),
        );
});

test('live scoring redirects to dashboard when no round is active', function () {
    $judge = User::factory()->judge()->create();
    $panel = Panel::factory()->create(['judge_id' => $judge->id]);
    $participant = Participant::factory()->create();
    $participant->panels()->attach($panel);
    Round::factory()->create();

    $this->actingAs($judge)
        ->get(route('judge.live-scoring.index'))
        ->assertRedirect(route('judge.dashboard'));
});

test('adjustment creates a draft sheet and updates the score', function () {
    [$judge, , $participant, $round, $criterion] = setUpLiveScoringContext();

    $this->actingAs($judge)
        ->patch(route('judge.live-scoring.adjust', $participant), ['delta' => 1])
        ->assertRedirect();

    $sheet = ScoreSheet::query()->where([
        'user_id' => $judge->id,
        'participant_id' => $participant->id,
        'round_id' => $round->id,
    ])->firstOrFail();

    expect($sheet->status)->toBe(ScoreSheetStatus::Draft)
        ->and($sheet->submitted_at)->toBeNull()
        ->and((float) $sheet->scores()->where('criterion_id', $criterion->id)->value('value'))->toBe(1.0);

    $this->assertDatabaseHas('audit_logs', [
        'event' => 'score.live_adjusted',
        'subject_id' => $sheet->id,
    ]);
});

test('score can be incremented and decremented within criterion bounds', function () {
    [$judge, , $participant, , $criterion] = setUpLiveScoringContext();

    for ($i = 0; $i < 12; $i++) {
        $this->actingAs($judge)
            ->patch(route('judge.live-scoring.adjust', $participant), ['delta' => 1]);
    }

    for ($i = 0; $i < 3; $i++) {
        $this->actingAs($judge)
            ->patch(route('judge.live-scoring.adjust', $participant), ['delta' => -1]);
    }

    $score = Score::query()->where('criterion_id', $criterion->id)->firstOrFail();
    expect((float) $score->value)->toBe(7.0);
});

test('a bound no-op does not create an audit entry', function () {
    [$judge, , $participant] = setUpLiveScoringContext();

    $this->actingAs($judge)
        ->patch(route('judge.live-scoring.adjust', $participant), ['delta' => -1])
        ->assertRedirect();

    expect(ScoreSheet::query()->firstOrFail()->isDraft())->toBeTrue();
    $this->assertDatabaseMissing('audit_logs', ['event' => 'score.live_adjusted']);
});

test('invalid score deltas are rejected', function (mixed $delta) {
    [$judge, , $participant] = setUpLiveScoringContext();

    $this->actingAs($judge)
        ->patch(route('judge.live-scoring.adjust', $participant), ['delta' => $delta])
        ->assertSessionHasErrors('delta');
})->with([2, -2, 0, 1.5, 'one']);

test('judges can submit a zero score as final', function () {
    [$judge, , $participant, $round, $criterion] = setUpLiveScoringContext();

    $this->actingAs($judge)
        ->post(route('judge.live-scoring.submit', $participant))
        ->assertRedirect();

    $sheet = ScoreSheet::query()->where([
        'user_id' => $judge->id,
        'participant_id' => $participant->id,
        'round_id' => $round->id,
    ])->firstOrFail();

    expect($sheet->isSubmitted())->toBeTrue()
        ->and($sheet->submitted_at)->not->toBeNull()
        ->and((float) $sheet->scores()->where('criterion_id', $criterion->id)->value('value'))->toBe(0.0);

    $this->assertDatabaseHas('audit_logs', ['event' => 'score.submitted']);
});

test('submitted scores are immutable and duplicate submission is rejected', function () {
    [$judge, , $participant] = setUpLiveScoringContext();

    $this->actingAs($judge)->post(route('judge.live-scoring.submit', $participant));

    $this->actingAs($judge)
        ->patch(route('judge.live-scoring.adjust', $participant), ['delta' => 1])
        ->assertForbidden();

    $this->actingAs($judge)
        ->post(route('judge.live-scoring.submit', $participant))
        ->assertForbidden();
});

test('judges can not adjust participants outside their panel', function () {
    setUpLiveScoringContext();
    $otherJudge = User::factory()->judge()->create();
    Panel::factory()->create(['judge_id' => $otherJudge->id]);
    $foreignParticipant = Participant::factory()->create();

    $this->actingAs($otherJudge)
        ->patch(route('judge.live-scoring.adjust', $foreignParticipant), ['delta' => 1])
        ->assertForbidden();
});

test('adjustment is rejected when no round is active', function () {
    $judge = User::factory()->judge()->create();
    $panel = Panel::factory()->create(['judge_id' => $judge->id]);
    $participant = Participant::factory()->create();
    $participant->panels()->attach($panel);
    Round::factory()->create();

    $this->actingAs($judge)
        ->patch(route('judge.live-scoring.adjust', $participant), ['delta' => 1])
        ->assertNotFound();
});

test('live scoring fails closed when active round has multiple criteria', function () {
    [$judge, , , $round] = setUpLiveScoringContext();
    Criterion::factory()->for($round)->create(['sequence' => 2]);

    $this->actingAs($judge)
        ->get(route('judge.live-scoring.index'))
        ->assertRedirect(route('judge.dashboard'))
        ->assertSessionHasErrors('round');
});

test('admins can not access live scoring routes', function () {
    setUpLiveScoringContext();
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get(route('judge.live-scoring.index'))
        ->assertForbidden();
});
