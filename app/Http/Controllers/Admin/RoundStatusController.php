<?php

namespace App\Http\Controllers\Admin;

use App\Enums\RoundStatus;
use App\Http\Controllers\Controller;
use App\Models\Round;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RoundStatusController extends Controller
{
    /**
     * Transition a round between pending → active → locked.
     */
    public function update(Request $request, Round $round): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::enum(RoundStatus::class)],
        ]);

        $target = RoundStatus::from($validated['status']);

        return match ($target) {
            RoundStatus::Active => $this->activate($round),
            RoundStatus::Locked => $this->lock($round),
            RoundStatus::Pending => back()->withErrors(['status' => 'Ronde tidak dapat dikembalikan ke status menunggu.']),
        };
    }

    private function activate(Round $round): RedirectResponse
    {
        if ($round->isLocked()) {
            return back()->withErrors(['status' => 'Ronde yang terkunci tidak dapat diaktifkan kembali.']);
        }

        if (Round::query()->where('status', RoundStatus::Active)->whereKeyNot($round->id)->exists()) {
            return back()->withErrors(['status' => 'Masih ada ronde lain yang sedang berlangsung. Kunci ronde tersebut terlebih dahulu.']);
        }

        $criteria = $round->criteria()->get();

        if ($criteria->count() !== 1) {
            return back()->withErrors(['status' => 'Ronde harus memiliki tepat satu kriteria Live Scoring sebelum diaktifkan.']);
        }

        $criterion = $criteria->sole();

        if ($criterion->weight !== 100 || $criterion->min_score !== 0) {
            return back()->withErrors(['status' => 'Kriteria Live Scoring harus berbobot 100% dan memiliki nilai minimum 0.']);
        }

        $round->update(['status' => RoundStatus::Active]);

        AuditLogger::log(auth()->user(), 'round.activated', $round);

        return back()->with('success', 'Ronde '.$round->name.' diaktifkan.');
    }

    private function lock(Round $round): RedirectResponse
    {
        if (! $round->isActive()) {
            return back()->withErrors(['status' => 'Hanya ronde yang sedang berlangsung yang dapat dikunci.']);
        }

        $round->update(['status' => RoundStatus::Locked]);

        AuditLogger::log(auth()->user(), 'round.locked', $round);

        return back()->with('success', 'Ronde '.$round->name.' dikunci. Nilai tidak dapat diubah lagi.');
    }
}
