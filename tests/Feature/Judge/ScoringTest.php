<?php

use App\Models\Panel;
use App\Models\Participant;
use App\Models\User;

test('legacy scoring pages redirect judges to live scoring', function () {
    $judge = User::factory()->judge()->create();
    $panel = Panel::factory()->create(['judge_id' => $judge->id]);
    $participant = Participant::factory()->create();
    $participant->panels()->attach($panel);

    $this->actingAs($judge)
        ->get('/juri/penilaian')
        ->assertRedirect('/juri/live-scoring');

    $this->actingAs($judge)
        ->get('/juri/penilaian/'.$participant->id)
        ->assertRedirect('/juri/live-scoring');
});

test('legacy scoring write endpoints are unavailable', function () {
    $judge = User::factory()->judge()->create();
    $participant = Participant::factory()->create();

    $this->actingAs($judge)
        ->put('/juri/penilaian/'.$participant->id, ['scores' => []])
        ->assertMethodNotAllowed();

    $this->actingAs($judge)
        ->post('/juri/penilaian/'.$participant->id.'/submit')
        ->assertNotFound();
});
