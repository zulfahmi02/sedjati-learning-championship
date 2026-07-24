<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ScoreSheetStatus;
use App\Http\Controllers\Controller;
use App\Models\ScoreSheet;
use App\Services\AuditLogger;
use App\Services\ScoreCalculationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class ReopenScoreSheetController extends Controller
{
    public function __construct(private ScoreCalculationService $calculator) {}

    /**
     * Reopen a submitted score sheet so its assigned judge may correct it.
     */
    public function __invoke(ScoreSheet $scoreSheet): RedirectResponse
    {
        DB::transaction(function () use ($scoreSheet): void {
            $lockedSheet = ScoreSheet::query()->lockForUpdate()->findOrFail($scoreSheet->id);

            Gate::authorize('reopen', $lockedSheet);

            $submittedAt = $lockedSheet->submitted_at?->toIso8601String();

            $lockedSheet->update([
                'status' => ScoreSheetStatus::Draft,
                'submitted_at' => null,
            ]);

            AuditLogger::log(auth()->user(), 'score.reopened', $lockedSheet, [
                'round_id' => $lockedSheet->round_id,
                'participant_id' => $lockedSheet->participant_id,
                'previous_submitted_at' => $submittedAt,
            ]);
        }, attempts: 3);

        $this->calculator->forgetCachedStandings();

        return back()->with(
            'success',
            'Nilai '.$scoreSheet->participant->name.' dibuka kembali untuk dikoreksi oleh '.$scoreSheet->judge->name.'.',
        );
    }
}
