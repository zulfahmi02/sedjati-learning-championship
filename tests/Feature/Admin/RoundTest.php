<?php

use App\Enums\RoundStatus;
use App\Models\Criterion;
use App\Models\Round;
use App\Models\User;

test('admins can create rounds within the 100 percent weight ceiling', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post(route('admin.rounds.store'), [
            'name' => 'Penyisihan',
            'sequence' => 1,
            'weight' => 30,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('rounds', ['name' => 'Penyisihan', 'weight' => 30]);
});

test('total round weight can not exceed 100 percent', function () {
    $admin = User::factory()->admin()->create();
    Round::factory()->create(['weight' => 80]);

    $this->actingAs($admin)
        ->post(route('admin.rounds.store'), [
            'name' => 'Final',
            'sequence' => 2,
            'weight' => 30,
        ])
        ->assertSessionHasErrors('weight');
});

test('locked rounds can not be edited', function () {
    $admin = User::factory()->admin()->create();
    $round = Round::factory()->locked()->create(['weight' => 50]);

    $this->actingAs($admin)
        ->put(route('admin.rounds.update', $round), [
            'name' => 'Ubah Nama',
            'sequence' => $round->sequence,
            'weight' => 50,
        ])
        ->assertSessionHasErrors();
});

test('a round can only be activated when criteria weights total 100 percent', function () {
    $admin = User::factory()->admin()->create();
    $round = Round::factory()->create(['weight' => 100]);
    Criterion::factory()->for($round)->create(['weight' => 60]);

    $this->actingAs($admin)
        ->put(route('admin.rounds.status', $round), ['status' => 'active'])
        ->assertSessionHasErrors('status');

    Criterion::factory()->for($round)->create(['weight' => 40, 'sequence' => 2]);

    $this->actingAs($admin)
        ->put(route('admin.rounds.status', $round), ['status' => 'active'])
        ->assertRedirect();

    expect($round->refresh()->status)->toBe(RoundStatus::Active);
    $this->assertDatabaseHas('audit_logs', ['event' => 'round.activated']);
});

test('only one round can be active at a time', function () {
    $admin = User::factory()->admin()->create();
    Round::factory()->active()->create(['weight' => 50]);
    $round = Round::factory()->create(['weight' => 50]);
    Criterion::factory()->for($round)->create(['weight' => 100]);

    $this->actingAs($admin)
        ->put(route('admin.rounds.status', $round), ['status' => 'active'])
        ->assertSessionHasErrors('status');
});

test('an active round can be locked', function () {
    $admin = User::factory()->admin()->create();
    $round = Round::factory()->active()->create();

    $this->actingAs($admin)
        ->put(route('admin.rounds.status', $round), ['status' => 'locked'])
        ->assertRedirect();

    expect($round->refresh()->status)->toBe(RoundStatus::Locked);
    $this->assertDatabaseHas('audit_logs', ['event' => 'round.locked']);
});

test('a locked round can not be reactivated', function () {
    $admin = User::factory()->admin()->create();
    $round = Round::factory()->locked()->create();

    $this->actingAs($admin)
        ->put(route('admin.rounds.status', $round), ['status' => 'active'])
        ->assertSessionHasErrors('status');
});

test('criteria weight per round can not exceed 100 percent', function () {
    $admin = User::factory()->admin()->create();
    $round = Round::factory()->create();
    Criterion::factory()->for($round)->create(['weight' => 70]);

    $this->actingAs($admin)
        ->post(route('admin.rounds.criteria.store', $round), [
            'name' => 'Creativity',
            'weight' => 40,
            'min_score' => 0,
            'max_score' => 100,
            'sequence' => 2,
        ])
        ->assertSessionHasErrors('weight');
});

test('criteria can not be modified once the round is active', function () {
    $admin = User::factory()->admin()->create();
    $round = Round::factory()->active()->create();

    $this->actingAs($admin)
        ->post(route('admin.rounds.criteria.store', $round), [
            'name' => 'Technique',
            'weight' => 50,
            'min_score' => 0,
            'max_score' => 100,
            'sequence' => 1,
        ])
        ->assertSessionHasErrors();
});

test('non pending rounds can not be deleted', function () {
    $admin = User::factory()->admin()->create();
    $round = Round::factory()->active()->create();

    $this->actingAs($admin)
        ->delete(route('admin.rounds.destroy', $round))
        ->assertSessionHasErrors();

    $this->assertDatabaseHas('rounds', ['id' => $round->id]);
});
