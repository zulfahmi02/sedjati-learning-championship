<?php

use App\Models\Criterion;
use App\Models\Panel;
use App\Models\Participant;
use App\Models\Round;
use App\Models\Score;
use App\Models\ScoreSheet;
use App\Models\User;
use App\Services\ScoreCalculationService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(Tests\TestCase::class, RefreshDatabase::class);

function makeScoredParticipant(Round $round, array $criterionValues, ?User $judge = null): Participant
{
    $judge ??= User::factory()->judge()->create();
    $panel = Panel::factory()->create(['judge_id' => $judge->id]);
    $participant = Participant::factory()->create();
    $participant->panels()->attach($panel);

    $sheet = ScoreSheet::factory()->submitted()->create([
        'user_id' => $judge->id,
        'participant_id' => $participant->id,
        'round_id' => $round->id,
    ]);

    foreach ($criterionValues as $criterionId => $value) {
        Score::factory()->create([
            'score_sheet_id' => $sheet->id,
            'criterion_id' => $criterionId,
            'value' => $value,
        ]);
    }

    return $participant;
}

test('round score is the weighted sum of criteria scores', function () {
    $round = Round::factory()->active()->create(['weight' => 100]);
    $technique = Criterion::factory()->for($round)->create(['weight' => 60]);
    $creativity = Criterion::factory()->for($round)->create(['weight' => 40, 'sequence' => 2]);

    $participant = makeScoredParticipant($round, [
        $technique->id => 80,
        $creativity->id => 90,
    ]);

    $scores = app(ScoreCalculationService::class)->roundScores($round);

    // 80 * 0.6 + 90 * 0.4 = 48 + 36 = 84
    expect($scores[$participant->id])->toBe(84.0);
});

test('scores are normalized when max score is not 100', function () {
    $round = Round::factory()->active()->create(['weight' => 100]);
    $criterion = Criterion::factory()->for($round)->create([
        'weight' => 100,
        'max_score' => 10,
    ]);

    $participant = makeScoredParticipant($round, [$criterion->id => 8]);

    $scores = app(ScoreCalculationService::class)->roundScores($round);

    // 8/10 * 100 = 80
    expect($scores[$participant->id])->toBe(80.0);
});

test('participant round score equals the panel judge submitted score exactly', function () {
    $round = Round::factory()->active()->create(['weight' => 100]);
    $criterion = Criterion::factory()->for($round)->create(['weight' => 100]);

    $participant = makeScoredParticipant($round, [$criterion->id => 77.5]);

    $scores = app(ScoreCalculationService::class)->roundScores($round);

    // Single judge per panel: no averaging, exact passthrough.
    expect($scores[$participant->id])->toBe(77.5);
});

test('draft sheets are excluded from calculation', function () {
    $round = Round::factory()->active()->create(['weight' => 100]);
    $criterion = Criterion::factory()->for($round)->create(['weight' => 100]);

    $judge = User::factory()->judge()->create();
    $panel = Panel::factory()->create(['judge_id' => $judge->id]);
    $participant = Participant::factory()->create();
    $participant->panels()->attach($panel);

    $sheet = ScoreSheet::factory()->create([
        'user_id' => $judge->id,
        'participant_id' => $participant->id,
        'round_id' => $round->id,
    ]);
    Score::factory()->create([
        'score_sheet_id' => $sheet->id,
        'criterion_id' => $criterion->id,
        'value' => 95,
    ]);

    $scores = app(ScoreCalculationService::class)->roundScores($round);

    expect($scores->has($participant->id))->toBeFalse();
});

test('overall score combines round scores by round weight', function () {
    $roundA = Round::factory()->locked()->create(['weight' => 40, 'sequence' => 1]);
    $roundB = Round::factory()->locked()->create(['weight' => 60, 'sequence' => 2]);
    $criterionA = Criterion::factory()->for($roundA)->create(['weight' => 100]);
    $criterionB = Criterion::factory()->for($roundB)->create(['weight' => 100]);

    $judge = User::factory()->judge()->create();
    $participant = makeScoredParticipant($roundA, [$criterionA->id => 80], $judge);

    $sheetB = ScoreSheet::factory()->submitted()->create([
        'user_id' => $judge->id,
        'participant_id' => $participant->id,
        'round_id' => $roundB->id,
    ]);
    Score::factory()->create([
        'score_sheet_id' => $sheetB->id,
        'criterion_id' => $criterionB->id,
        'value' => 90,
    ]);

    $standings = app(ScoreCalculationService::class)->overallStandings();

    // 80 * 0.4 + 90 * 0.6 = 32 + 54 = 86
    expect($standings[0]['total'])->toBe(86.0);
    expect($standings[0]['rank'])->toBe(1);
});

test('rounds without submitted scores contribute zero', function () {
    $roundA = Round::factory()->locked()->create(['weight' => 50, 'sequence' => 1]);
    Round::factory()->create(['weight' => 50, 'sequence' => 2]);
    $criterion = Criterion::factory()->for($roundA)->create(['weight' => 100]);

    $participant = makeScoredParticipant($roundA, [$criterion->id => 80]);

    $standings = app(ScoreCalculationService::class)->overallStandings();
    $entry = collect($standings)->firstWhere(fn ($e) => $e['participant']->id === $participant->id);

    // 80 * 0.5 + 0 = 40
    expect($entry['total'])->toBe(40.0);
});

test('tied totals share the same dense rank', function () {
    $round = Round::factory()->locked()->create(['weight' => 100]);
    $criterion = Criterion::factory()->for($round)->create(['weight' => 100]);

    makeScoredParticipant($round, [$criterion->id => 90]);
    makeScoredParticipant($round, [$criterion->id => 90]);
    makeScoredParticipant($round, [$criterion->id => 70]);

    $ranks = collect(app(ScoreCalculationService::class)->overallStandings())->pluck('rank');

    expect($ranks->all())->toBe([1, 1, 2]);
});
