<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCriterionRequest;
use App\Http\Requests\Admin\UpdateCriterionRequest;
use App\Models\Criterion;
use App\Models\Round;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;

class CriterionController extends Controller
{
    public function store(StoreCriterionRequest $request, Round $round): RedirectResponse
    {
        DB::transaction(function () use ($request, $round): void {
            $lockedRound = Round::query()->lockForUpdate()->findOrFail($round->id);

            abort_unless($lockedRound->isPending(), 422, 'Kriteria hanya dapat ditambahkan saat ronde masih menunggu.');
            abort_if($lockedRound->criteria()->exists(), 422, 'Setiap ronde hanya boleh memiliki satu kriteria Live Scoring.');

            $lockedRound->criteria()->create($request->validated());
        }, attempts: 3);

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
