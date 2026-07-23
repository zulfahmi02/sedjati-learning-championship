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

        $criteriaWeight = (int) $round->criteria()->sum('weight');

        if ($criteriaWeight !== 100) {
            return back()->withErrors(['status' => 'Total bobot kriteria ronde ini harus tepat 100% sebelum diaktifkan (saat ini '.$criteriaWeight.'%).']);
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
