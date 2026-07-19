<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreRoundRequest;
use App\Http\Requests\Admin\UpdateRoundRequest;
use App\Models\Round;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class RoundController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/rounds/index', [
            'rounds' => Round::query()
                ->with('criteria')
                ->orderBy('sequence')
                ->get(),
            'totalWeight' => (int) Round::query()->sum('weight'),
        ]);
    }

    public function store(StoreRoundRequest $request): RedirectResponse
    {
        Round::create($request->validated());

        return back()->with('success', 'Ronde berhasil ditambahkan.');
    }

    public function update(UpdateRoundRequest $request, Round $round): RedirectResponse
    {
        $round->update($request->validated());

        return back()->with('success', 'Ronde berhasil diperbarui.');
    }

    public function destroy(Round $round): RedirectResponse
    {
        if (! $round->isPending()) {
            return back()->withErrors(['round' => 'Hanya ronde berstatus menunggu yang dapat dihapus.']);
        }

        $round->delete();

        return back()->with('success', 'Ronde berhasil dihapus.');
    }
}
