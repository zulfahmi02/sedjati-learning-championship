<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCriterionRequest;
use App\Http\Requests\Admin\UpdateCriterionRequest;
use App\Models\Criterion;
use App\Models\Round;
use Illuminate\Http\RedirectResponse;

class CriterionController extends Controller
{
    public function store(StoreCriterionRequest $request, Round $round): RedirectResponse
    {
        $round->criteria()->create($request->validated());

        return back()->with('success', 'Kriteria berhasil ditambahkan.');
    }

    public function update(UpdateCriterionRequest $request, Round $round, Criterion $criterion): RedirectResponse
    {
        abort_unless($criterion->round_id === $round->id, 404);

        $criterion->update($request->validated());

        return back()->with('success', 'Kriteria berhasil diperbarui.');
    }

    public function destroy(Round $round, Criterion $criterion): RedirectResponse
    {
        abort_unless($criterion->round_id === $round->id, 404);

        if (! $round->isPending()) {
            return back()->withErrors(['criterion' => 'Kriteria hanya dapat dihapus saat ronde masih berstatus menunggu.']);
        }

        $criterion->delete();

        return back()->with('success', 'Kriteria berhasil dihapus.');
    }
}
