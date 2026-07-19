<?php

namespace App\Http\Controllers\Judge;

use App\Enums\ScoreSheetStatus;
use App\Http\Controllers\Controller;
use App\Models\Participant;
use App\Models\Round;
use App\Models\ScoreSheet;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class SubmitScoreSheetController extends Controller
{
    /**
     * Submit the judge's scores as final. Requires a complete sheet.
     */
    public function store(Request $request, Participant $participant): RedirectResponse
    {
        $judge = $request->user();
        $activeRound = Round::active();

        abort_unless($activeRound !== null, 404);

        Gate::authorize('score', [ScoreSheet::class, $participant, $activeRound]);

        $sheet = ScoreSheet::query()
            ->where('user_id', $judge->id)
            ->where('participant_id', $participant->id)
            ->where('round_id', $activeRound->id)
            ->first();

        if (! $sheet) {
            return back()->withErrors(['scores' => 'Simpan nilai terlebih dahulu sebelum mengirim.']);
        }

        abort_unless($sheet->isDraft(), 403, 'Nilai sudah dikirim sebelumnya.');

        if (! $sheet->isComplete()) {
            return back()->withErrors(['scores' => 'Seluruh kriteria harus diberi nilai sebelum mengirim.']);
        }

        $sheet->update([
            'status' => ScoreSheetStatus::Submitted,
            'submitted_at' => now(),
        ]);

        return redirect()
            ->route('judge.scoring.index')
            ->with('success', 'Nilai '.$participant->name.' berhasil dikirim.');
    }
}
