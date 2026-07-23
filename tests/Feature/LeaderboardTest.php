<?php

use App\Models\Criterion;
use App\Models\EventSetting;
use App\Models\Panel;
use App\Models\Participant;
use App\Models\Round;
use App\Models\Score;
use App\Models\ScoreSheet;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function publishResults(bool $published = true): void
{
    EventSetting::current()->update([
        'results_published' => $published,
        'published_at' => $published ? now() : null,
    ]);
}

function seedScoredEvent(): Participant
{
    $round = Round::factory()->locked()->create(['weight' => 100]);
    $criterion = Criterion::factory()->for($round)->create(['weight' => 100]);

    $judge = User::factory()->judge()->create();
    $panel = Panel::factory()->create(['judge_id' => $judge->id]);
    $participant = Participant::factory()->create();
    $participant->panels()->attach($panel);

    $sheet = ScoreSheet::factory()->submitted()->create([
        'user_id' => $judge->id,
        'participant_id' => $participant->id,
        'round_id' => $round->id,
    ]);
    Score::factory()->create([
        'score_sheet_id' => $sheet->id,
        'criterion_id' => $criterion->id,
        'value' => 88,
    ]);

    return $participant;
}

test('the leaderboard shows a holding page before publication', function () {
    seedScoredEvent();
    publishResults(false);

    $this->get(route('leaderboard.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('leaderboard/unpublished'));
});

test('the leaderboard is publicly visible after publication', function () {
    $participant = seedScoredEvent();
    publishResults();

    $this->get(route('leaderboard.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('leaderboard/index')
            ->where('standings.0.rank', 1)
            ->where('standings.0.total', 88)
            ->where('standings.0.participant.name', $participant->name),
        );
});

test('participant detail is hidden before publication', function () {
    $participant = seedScoredEvent();
    publishResults(false);

    $this->get(route('leaderboard.show', $participant))->assertNotFound();
});

test('participant detail shows the score breakdown after publication', function () {
    $participant = seedScoredEvent();
    publishResults();

    $this->get(route('leaderboard.show', $participant))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('leaderboard/show')
            ->where('rank', 1)
            ->where('total', 88)
            ->has('breakdown', 1),
        );
});

test('admins can publish and unpublish results', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->put(route('admin.publication.update'), ['publish' => true])
        ->assertRedirect();

    expect(EventSetting::current()->results_published)->toBeTrue();
    $this->assertDatabaseHas('audit_logs', ['event' => 'event.publication_changed']);

    $this->actingAs($admin)
        ->put(route('admin.publication.update'), ['publish' => false])
        ->assertRedirect();

    expect(EventSetting::current()->refresh()->results_published)->toBeFalse();
});

test('judges can not toggle publication', function () {
    $judge = User::factory()->judge()->create();

    $this->actingAs($judge)
        ->put(route('admin.publication.update'), ['publish' => true])
        ->assertForbidden();
});

test('the root url redirects to the leaderboard', function () {
    $this->get('/')->assertRedirect(route('leaderboard.index'));
});
