<?php

use App\Models\Panel;
use App\Models\Participant;
use App\Models\User;

test('admins can create a panel with a judge', function () {
    $admin = User::factory()->admin()->create();
    $judge = User::factory()->judge()->create();

    $this->actingAs($admin)
        ->post(route('admin.panels.store'), [
            'name' => 'Panel Alpha',
            'judge_id' => $judge->id,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('panels', [
        'name' => 'Panel Alpha',
        'judge_id' => $judge->id,
    ]);
});

test('a judge can not be assigned to two panels', function () {
    $admin = User::factory()->admin()->create();
    $judge = User::factory()->judge()->create();
    Panel::factory()->create(['judge_id' => $judge->id]);

    $this->actingAs($admin)
        ->post(route('admin.panels.store'), [
            'name' => 'Panel Kedua',
            'judge_id' => $judge->id,
        ])
        ->assertSessionHasErrors('judge_id');
});

test('an admin can not be assigned as a panel judge', function () {
    $admin = User::factory()->admin()->create();
    $otherAdmin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post(route('admin.panels.store'), [
            'name' => 'Panel Salah',
            'judge_id' => $otherAdmin->id,
        ])
        ->assertSessionHasErrors('judge_id');
});

test('participants can not be assigned to a panel without a judge', function () {
    $admin = User::factory()->admin()->create();
    $panel = Panel::factory()->create(['judge_id' => null]);
    $participant = Participant::factory()->create();

    $this->actingAs($admin)
        ->post(route('admin.panels.participants.store', $panel), [
            'participant_id' => $participant->id,
        ])
        ->assertSessionHasErrors('participant_id');

    expect($panel->participants()->count())->toBe(0);
});

test('participants can be assigned and moved between panels', function () {
    $admin = User::factory()->admin()->create();
    $panelA = Panel::factory()->withJudge()->create();
    $panelB = Panel::factory()->withJudge()->create();
    $participant = Participant::factory()->create();

    $this->actingAs($admin)
        ->post(route('admin.panels.participants.store', $panelA), [
            'participant_id' => $participant->id,
        ])
        ->assertRedirect();

    expect($panelA->participants()->count())->toBe(1);

    // Moving to another panel replaces the previous assignment.
    $this->actingAs($admin)
        ->post(route('admin.panels.participants.store', $panelB), [
            'participant_id' => $participant->id,
        ])
        ->assertRedirect();

    expect($panelA->participants()->count())->toBe(0);
    expect($panelB->participants()->count())->toBe(1);

    $this->assertDatabaseHas('audit_logs', ['event' => 'participant.panel_assigned']);
});

test('participants can be removed from a panel', function () {
    $admin = User::factory()->admin()->create();
    $panel = Panel::factory()->withJudge()->create();
    $participant = Participant::factory()->create();
    $participant->panels()->attach($panel);

    $this->actingAs($admin)
        ->delete(route('admin.panels.participants.destroy', [$panel, $participant]))
        ->assertRedirect();

    expect($panel->participants()->count())->toBe(0);

    $this->assertDatabaseHas('audit_logs', ['event' => 'participant.panel_unassigned']);
});

test('admins can update the panel judge', function () {
    $admin = User::factory()->admin()->create();
    $panel = Panel::factory()->withJudge()->create();
    $newJudge = User::factory()->judge()->create();

    $this->actingAs($admin)
        ->put(route('admin.panels.update', $panel), [
            'name' => $panel->name,
            'judge_id' => $newJudge->id,
        ])
        ->assertRedirect();

    expect($panel->refresh()->judge_id)->toBe($newJudge->id);
});
