<?php

use App\Models\Panel;
use App\Models\Participant;
use App\Models\Round;
use App\Models\ScoreSheet;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));

    $response->assertRedirect(route('login'));
});

test('the generic dashboard redirects admins to the admin dashboard', function () {
    $user = User::factory()->admin()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertRedirect(route('admin.dashboard'));
});

test('the generic dashboard redirects judges to the judge dashboard', function () {
    $user = User::factory()->judge()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertRedirect(route('judge.dashboard'));
});

test('admins can visit the admin dashboard', function () {
    $user = User::factory()->admin()->create();

    $this->actingAs($user)
        ->get(route('admin.dashboard'))
        ->assertOk();
});

test('judges can visit the judge dashboard', function () {
    $user = User::factory()->judge()->create();

    $this->actingAs($user)
        ->get(route('judge.dashboard'))
        ->assertOk();
});

test('admin dashboard progress excludes participants without a panel assignment', function () {
    $admin = User::factory()->admin()->create();
    $judge = User::factory()->judge()->create();
    $panel = Panel::factory()->create(['judge_id' => $judge->id]);
    $round = Round::factory()->active()->create();

    $scoredParticipant = Participant::factory()->create();
    $unscoredParticipant = Participant::factory()->create();
    Participant::factory()->create();

    $scoredParticipant->panels()->attach($panel);
    $unscoredParticipant->panels()->attach($panel);

    ScoreSheet::factory()->submitted()->create([
        'user_id' => $judge->id,
        'participant_id' => $scoredParticipant->id,
        'round_id' => $round->id,
    ]);

    $this->actingAs($admin)
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/dashboard')
            ->where('stats.participants', 3)
            ->where('stats.expectedInRound', 2)
            ->where('stats.submittedInRound', 1)
            ->where('stats.progress', 50),
        );
});

test('judges can not visit the admin dashboard', function () {
    $user = User::factory()->judge()->create();

    $this->actingAs($user)
        ->get(route('admin.dashboard'))
        ->assertForbidden();
});

test('admins can not visit the judge dashboard', function () {
    $user = User::factory()->admin()->create();

    $this->actingAs($user)
        ->get(route('judge.dashboard'))
        ->assertForbidden();
});

test('deactivated judges are logged out when accessing protected pages', function () {
    $user = User::factory()->judge()->inactive()->create();

    $this->actingAs($user)
        ->get(route('judge.dashboard'))
        ->assertRedirect(route('login'));

    $this->assertGuest();
});
