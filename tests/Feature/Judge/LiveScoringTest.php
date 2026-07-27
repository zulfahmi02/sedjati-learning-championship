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

test('judges can save multiple live scores as drafts in one request', function () {
    [$judge, $panel, $participant, $round, $criterion] = setUpLiveScoringContext();
    $secondParticipant = Participant::factory()->create();
    $secondParticipant->panels()->attach($panel);

    $this->actingAs($judge)
        ->patch(route('judge.live-scoring.batch-update'), [
            'scores' => [
                ['participant_id' => $participant->id, 'value' => 7],
                ['participant_id' => $secondParticipant->id, 'value' => 8],
            ],
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $sheets = ScoreSheet::query()
        ->where('user_id', $judge->id)
        ->where('round_id', $round->id)
        ->with('scores')
        ->get()
        ->keyBy('participant_id');

    expect($sheets)->toHaveCount(2)
        ->and($sheets[$participant->id]->isDraft())->toBeTrue()
        ->and((float) $sheets[$participant->id]->scores->sole()->value)->toBe(7.0)
        ->and($sheets[$secondParticipant->id]->isDraft())->toBeTrue()
        ->and((float) $sheets[$secondParticipant->id]->scores->sole()->value)->toBe(8.0);

    $this->assertDatabaseCount('audit_logs', 2);
    $this->assertDatabaseHas('scores', ['criterion_id' => $criterion->id, 'value' => 7]);
});

test('judges can save and submit multiple live scores atomically', function () {
    [$judge, $panel, $participant, $round] = setUpLiveScoringContext();
    $secondParticipant = Participant::factory()->create();
    $secondParticipant->panels()->attach($panel);

    $this->actingAs($judge)
        ->post(route('judge.live-scoring.batch-submit'), [
            'scores' => [
                ['participant_id' => $participant->id, 'value' => 6],
                ['participant_id' => $secondParticipant->id, 'value' => 9],
            ],
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $sheets = ScoreSheet::query()
        ->where('user_id', $judge->id)
        ->where('round_id', $round->id)
        ->with('scores')
        ->get();

    expect($sheets)->toHaveCount(2)
        ->and($sheets->every->isSubmitted())->toBeTrue()
        ->and($sheets->every(fn (ScoreSheet $sheet) => $sheet->submitted_at !== null))->toBeTrue();

    $this->assertDatabaseCount('audit_logs', 4);
});

test('batch scoring validates unique participants and criterion bounds', function () {
    [$judge, , $participant] = setUpLiveScoringContext();

    $this->actingAs($judge)
        ->patch(route('judge.live-scoring.batch-update'), [
            'scores' => [
                ['participant_id' => $participant->id, 'value' => 11],
                ['participant_id' => $participant->id, 'value' => 5],
            ],
        ])
        ->assertSessionHasErrors([
            'scores.0.value',
            'scores.1.participant_id',
        ]);

    expect(ScoreSheet::query()->count())->toBe(0);
});

test('batch scoring rejects the whole request when a participant is outside the judge panel', function () {
    [$judge, , $participant] = setUpLiveScoringContext();
    $foreignParticipant = Participant::factory()->create();

    $this->actingAs($judge)
        ->patch(route('judge.live-scoring.batch-update'), [
            'scores' => [
                ['participant_id' => $participant->id, 'value' => 7],
                ['participant_id' => $foreignParticipant->id, 'value' => 8],
            ],
        ])
        ->assertForbidden();

    expect(ScoreSheet::query()->count())->toBe(0);
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

    $this->actingAs($judge)
        ->get(route('judge.live-scoring.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('participants.0.current_score', 1)
            ->where('participants.0.status', ScoreSheetStatus::Draft->value),
        );
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
