<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreParticipantRequest;
use App\Http\Requests\Admin\UpdateParticipantRequest;
use App\Models\Panel;
use App\Models\Participant;
use App\Models\Round;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ParticipantController extends Controller
{
    public function index(Request $request): Response
    {
        $activeRound = Round::active();

        $participants = Participant::query()
            ->with('panels:id,name')
            ->withExists([
                'scoreSheets as scored' => fn ($query) => $query
                    ->where('status', 'submitted')
                    ->when($activeRound, fn ($q) => $q->where('round_id', $activeRound->id)),
            ])
            ->when($request->string('search')->value(), function ($query, string $search) {
                $query->where(fn ($q) => $q
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('participant_number', 'like', "%{$search}%")
                    ->orWhere('institution', 'like', "%{$search}%"));
            })
            ->when($request->integer('panel'), function ($query, int $panelId) {
                $query->whereHas('panels', fn ($q) => $q->where('panels.id', $panelId));
            })
            ->when($request->string('status')->value(), function ($query, string $status) {
                match ($status) {
                    'scored' => $query->whereHas('scoreSheets', fn ($q) => $q->where('status', 'submitted')),
                    'registered' => $query->whereDoesntHave('scoreSheets', fn ($q) => $q->where('status', 'submitted')),
                    default => null,
                };
            })
            ->orderBy('participant_number')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/participants/index', [
            'participants' => $participants,
            'panels' => Panel::query()->orderBy('name')->get(['id', 'name', 'judge_id']),
            'filters' => [
                'search' => $request->string('search')->value(),
                'panel' => $request->integer('panel') ?: null,
                'status' => $request->string('status')->value() ?: null,
            ],
            'stats' => [
                'total' => Participant::count(),
                'scored' => Participant::query()->whereHas('scoreSheets', fn ($q) => $q->where('status', 'submitted'))->count(),
            ],
        ]);
    }

    public function store(StoreParticipantRequest $request): RedirectResponse
    {
        $participant = Participant::create($request->safe()->except('panel_id'));

        if ($panelId = $request->validated('panel_id')) {
            $participant->panels()->sync([$panelId]);
        }

        return back()->with('success', 'Peserta berhasil ditambahkan.');
    }

    public function update(UpdateParticipantRequest $request, Participant $participant): RedirectResponse
    {
        $participant->update($request->safe()->except('panel_id'));

        $panelId = $request->validated('panel_id');
        $participant->panels()->sync($panelId ? [$panelId] : []);

        return back()->with('success', 'Peserta berhasil diperbarui.');
    }

    public function destroy(Participant $participant): RedirectResponse
    {
        $participant->delete();

        return back()->with('success', 'Peserta berhasil dihapus.');
    }
}
