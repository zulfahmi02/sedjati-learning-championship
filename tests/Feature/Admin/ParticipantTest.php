<?php

use App\Models\Panel;
use App\Models\Participant;
use App\Models\User;
use Illuminate\Http\UploadedFile;

test('admins can view the participants index', function () {
    $admin = User::factory()->admin()->create();
    Participant::factory()->count(3)->create();

    $this->actingAs($admin)
        ->get(route('admin.participants.index'))
        ->assertOk();
});

test('judges can not access participant management', function () {
    $judge = User::factory()->judge()->create();

    $this->actingAs($judge)
        ->get(route('admin.participants.index'))
        ->assertForbidden();
});

test('admins can create a participant', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post(route('admin.participants.store'), [
            'participant_number' => 'SLC-001',
            'name' => 'Budi Santoso',
            'institution' => 'Universitas Indonesia',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('participants', [
        'participant_number' => 'SLC-001',
        'name' => 'Budi Santoso',
    ]);

    $this->assertDatabaseHas('audit_logs', ['event' => 'participant.created']);
});

test('participant numbers must be unique', function () {
    $admin = User::factory()->admin()->create();
    Participant::factory()->create(['participant_number' => 'SLC-001']);

    $this->actingAs($admin)
        ->post(route('admin.participants.store'), [
            'participant_number' => 'SLC-001',
            'name' => 'Budi Santoso',
        ])
        ->assertSessionHasErrors('participant_number');
});

test('admins can create a participant with a panel assignment', function () {
    $admin = User::factory()->admin()->create();
    $panel = Panel::factory()->withJudge()->create();

    $this->actingAs($admin)
        ->post(route('admin.participants.store'), [
            'participant_number' => 'SLC-002',
            'name' => 'Siti Aminah',
            'panel_id' => $panel->id,
        ])
        ->assertRedirect();

    expect($panel->participants()->count())->toBe(1);
});

test('admins can update a participant and move panels', function () {
    $admin = User::factory()->admin()->create();
    $oldPanel = Panel::factory()->withJudge()->create();
    $newPanel = Panel::factory()->withJudge()->create();
    $participant = Participant::factory()->create();
    $participant->panels()->attach($oldPanel);

    $this->actingAs($admin)
        ->put(route('admin.participants.update', $participant), [
            'participant_number' => $participant->participant_number,
            'name' => 'Nama Baru',
            'panel_id' => $newPanel->id,
        ])
        ->assertRedirect();

    expect($participant->refresh()->name)->toBe('Nama Baru');
    expect($participant->panels()->first()->id)->toBe($newPanel->id);

    $this->assertDatabaseHas('audit_logs', ['event' => 'participant.updated']);
});

test('admins can delete a participant', function () {
    $admin = User::factory()->admin()->create();
    $participant = Participant::factory()->create();

    $this->actingAs($admin)
        ->delete(route('admin.participants.destroy', $participant))
        ->assertRedirect();

    $this->assertDatabaseMissing('participants', ['id' => $participant->id]);
    $this->assertDatabaseHas('audit_logs', ['event' => 'participant.deleted']);
});

test('admins can import participants from csv', function () {
    $admin = User::factory()->admin()->create();

    $csv = "nomor,nama,institusi,kategori\nSLC-101,Andi Wijaya,ITB,Public Speaking\nSLC-102,Rina Wati,UGM,";
    $file = UploadedFile::fake()->createWithContent('peserta.csv', $csv);

    $this->actingAs($admin)
        ->post(route('admin.participants.import'), ['file' => $file])
        ->assertRedirect();

    $this->assertDatabaseHas('participants', ['participant_number' => 'SLC-101', 'name' => 'Andi Wijaya']);
    $this->assertDatabaseHas('participants', ['participant_number' => 'SLC-102', 'name' => 'Rina Wati']);
});

test('import reports row errors for duplicates', function () {
    $admin = User::factory()->admin()->create();
    Participant::factory()->create(['participant_number' => 'SLC-101']);

    $csv = "nomor,nama\nSLC-101,Duplikat\nSLC-103,Valid";
    $file = UploadedFile::fake()->createWithContent('peserta.csv', $csv);

    $this->actingAs($admin)
        ->post(route('admin.participants.import'), ['file' => $file])
        ->assertRedirect()
        ->assertSessionHas('importErrors');

    $this->assertDatabaseHas('participants', ['participant_number' => 'SLC-103']);
});
