<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EventSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PublicationController extends Controller
{
    /**
     * Toggle public visibility of the leaderboard.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'publish' => ['required', 'boolean'],
        ]);

        $settings = EventSetting::current();

        $settings->update([
            'results_published' => $validated['publish'],
            'published_at' => $validated['publish'] ? now() : null,
        ]);

        return back()->with(
            'success',
            $validated['publish']
                ? 'Hasil perlombaan dipublikasikan. Leaderboard kini dapat diakses publik.'
                : 'Publikasi hasil dibatalkan. Leaderboard tidak lagi dapat diakses publik.',
        );
    }
}
