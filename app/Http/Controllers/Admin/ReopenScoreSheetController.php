<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ScoreSheetStatus;
use App\Http\Controllers\Controller;
use App\Models\ScoreSheet;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;

class ReopenScoreSheetController extends Controller
{
    /**
     * Reopen a submitted score sheet so its assigned judge may correct it.
     */
    public function __invoke(ScoreSheet $scoreSheet): RedirectResponse
    {
        Gate::authorize('reopen', $scoreSheet);

        $scoreSheet->update([
            'status' => ScoreSheetStatus::Draft,
            'submitted_at' => null,
        ]);

        AuditLogger::log(auth()->user(), 'score.reopened', $scoreSheet);

        return back()->with(
            'success',
            'Nilai '.$scoreSheet->participant->name.' dibuka kembali untuk dikoreksi oleh '.$scoreSheet->judge->name.'.',
        );
    }
}
