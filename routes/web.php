<?php

use App\Http\Controllers\Admin\CriterionController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\JudgeController;
use App\Http\Controllers\Admin\JudgePasswordController;
use App\Http\Controllers\Admin\MonitoringController;
use App\Http\Controllers\Admin\PanelController;
use App\Http\Controllers\Admin\PanelParticipantController;
use App\Http\Controllers\Admin\ParticipantController;
use App\Http\Controllers\Admin\ParticipantImportController;
use App\Http\Controllers\Admin\PublicationController;
use App\Http\Controllers\Admin\ReopenScoreSheetController;
use App\Http\Controllers\Admin\Reports\RankingExportController;
use App\Http\Controllers\Admin\Reports\ScoreRecapExportController;
use App\Http\Controllers\Admin\RoundController;
use App\Http\Controllers\Admin\RoundStatusController;
use App\Http\Controllers\Judge\DashboardController as JudgeDashboardController;
use App\Http\Controllers\Judge\LiveScoringController;
use App\Http\Controllers\LeaderboardController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/leaderboard')->name('home');

/*
|--------------------------------------------------------------------------
| Public leaderboard (no auth)
|--------------------------------------------------------------------------
*/
Route::get('leaderboard', [LeaderboardController::class, 'index'])->name('leaderboard.index');
Route::get('leaderboard/peserta/{participant}', [LeaderboardController::class, 'show'])->name('leaderboard.show');

/*
|--------------------------------------------------------------------------
| Generic dashboard redirect (role-aware)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth'])->get('dashboard', function () {
    return auth()->user()->isAdmin()
        ? redirect()->route('admin.dashboard')
        : redirect()->route('judge.dashboard');
})->name('dashboard');

/*
|--------------------------------------------------------------------------
| Admin
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('dashboard', AdminDashboardController::class)->name('dashboard');

        Route::post('peserta/import', [ParticipantImportController::class, 'store'])->name('participants.import');
        Route::resource('peserta', ParticipantController::class)
            ->parameters(['peserta' => 'participant'])
            ->names('participants')
            ->only(['index', 'store', 'update', 'destroy']);

        Route::put('juri/{judge}/password', [JudgePasswordController::class, 'update'])->name('judges.password');
        Route::resource('juri', JudgeController::class)
            ->parameters(['juri' => 'judge'])
            ->names('judges')
            ->only(['index', 'store', 'update']);

        Route::post('panel/{panel}/peserta', [PanelParticipantController::class, 'store'])->name('panels.participants.store');
        Route::delete('panel/{panel}/peserta/{participant}', [PanelParticipantController::class, 'destroy'])->name('panels.participants.destroy');
        Route::resource('panel', PanelController::class)
            ->parameters(['panel' => 'panel'])
            ->names('panels')
            ->only(['index', 'store', 'update', 'destroy']);

        Route::put('ronde/{round}/status', [RoundStatusController::class, 'update'])->name('rounds.status');
        Route::resource('ronde', RoundController::class)
            ->parameters(['ronde' => 'round'])
            ->names('rounds')
            ->only(['index', 'store', 'update', 'destroy']);

        Route::resource('ronde.kriteria', CriterionController::class)
            ->parameters(['ronde' => 'round', 'kriteria' => 'criterion'])
            ->names('rounds.criteria')
            ->only(['store', 'update', 'destroy']);

        Route::put('publikasi', [PublicationController::class, 'update'])->name('publication.update');

        Route::get('monitoring', [MonitoringController::class, 'index'])->name('monitoring.index');
        Route::put('monitoring/lembar-nilai/{scoreSheet}/reopen', ReopenScoreSheetController::class)->name('monitoring.score-sheets.reopen');

        Route::get('laporan/rekap-nilai', ScoreRecapExportController::class)->name('reports.score-recap');
        Route::get('laporan/rekap-ranking', RankingExportController::class)->name('reports.ranking');
    });

/*
|--------------------------------------------------------------------------
| Juri
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:juri'])
    ->prefix('juri')
    ->name('judge.')
    ->group(function () {
        Route::get('dashboard', JudgeDashboardController::class)->name('dashboard');

        Route::get('penilaian', fn () => redirect()->route('judge.live-scoring.index'));
        Route::get('penilaian/{participant}', fn () => redirect()->route('judge.live-scoring.index'));

        Route::get('live-scoring', [LiveScoringController::class, 'index'])->name('live-scoring.index');
        Route::patch('live-scoring/{participant}', [LiveScoringController::class, 'adjust'])->name('live-scoring.adjust');
        Route::post('live-scoring/{participant}/submit', [LiveScoringController::class, 'submit'])->name('live-scoring.submit');
    });

require __DIR__.'/settings.php';
