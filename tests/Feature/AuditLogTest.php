<?php

use App\Models\EventSetting;
use App\Models\Round;
use App\Models\ScoreSheet;
use App\Models\User;
use App\Services\AuditLogger;

test('it records audit logs with an actor and polymorphic subject', function () {
    $actor = User::factory()->admin()->create();
    $subject = Round::factory()->create();

    AuditLogger::log($actor, 'test.event', $subject, ['key' => 'value']);

    $this->assertDatabaseHas('audit_logs', [
        'actor_id' => $actor->id,
        'event' => 'test.event',
        'subject_type' => 'round',
        'subject_id' => $subject->id,
        'context' => json_encode(['key' => 'value']),
    ]);
});

test('it uses morph map aliases correctly', function () {
    $actor = User::factory()->judge()->create();

    $sheet = ScoreSheet::factory()->create();
    AuditLogger::log($actor, 'score.event', $sheet);

    $settings = EventSetting::current();
    AuditLogger::log($actor, 'settings.event', $settings);

    $this->assertDatabaseHas('audit_logs', [
        'event' => 'score.event',
        'subject_type' => 'score_sheet',
    ]);

    $this->assertDatabaseHas('audit_logs', [
        'event' => 'settings.event',
        'subject_type' => 'event_setting',
    ]);
});

test('monitoring dashboard displays latest activities', function () {
    $admin = User::factory()->admin()->create();
    $round = Round::factory()->active()->create();

    // Log directly on round
    AuditLogger::log($admin, 'round.activated', $round);

    // Log on score sheet with round in context
    $sheet = ScoreSheet::factory()->create(['round_id' => $round->id]);
    AuditLogger::log($admin, 'score.submitted', $sheet, ['round_id' => $round->id]);

    $this->actingAs($admin)
        ->get(route('admin.monitoring.index', ['round' => $round->id]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('activities', 2)
            ->where('activities.0.event', 'score.submitted')
            ->where('activities.1.event', 'round.activated'),
        );
});
