<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePanelRequest;
use App\Http\Requests\Admin\UpdatePanelRequest;
use App\Models\Panel;
use App\Models\Participant;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PanelController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/panels/index', [
            'panels' => Panel::query()
                ->with(['judge:id,name,email', 'participants:id,participant_number,name'])
                ->orderBy('name')
                ->get(),
            'availableJudges' => User::query()
                ->where('role', UserRole::Juri)
                ->where('is_active', true)
                ->whereDoesntHave('panel')
                ->orderBy('name')
                ->get(['id', 'name', 'email']),
            'unassignedParticipants' => Participant::query()
                ->whereDoesntHave('panels')
                ->orderBy('participant_number')
                ->get(['id', 'participant_number', 'name']),
        ]);
    }

    public function store(StorePanelRequest $request): RedirectResponse
    {
        Panel::create($request->validated());

        return back()->with('success', 'Panel berhasil dibuat.');
    }

    public function update(UpdatePanelRequest $request, Panel $panel): RedirectResponse
    {
        $judgeId = $request->validated('judge_id');

        if ($panel->judge_id !== $judgeId && $panel->hasScoringHistory()) {
            return back()->withErrors([
                'judge_id' => 'Juri panel tidak dapat diubah karena panel sudah memiliki histori penilaian.',
            ]);
        }

        $panel->update($request->validated());

        return back()->with('success', 'Panel berhasil diperbarui.');
    }

    public function destroy(Panel $panel): RedirectResponse
    {
        if ($panel->hasScoringHistory()) {
            return back()->withErrors([
                'panel' => 'Panel tidak dapat dihapus karena sudah memiliki histori penilaian.',
            ]);
        }

        $panel->delete();

        return back()->with('success', 'Panel berhasil dihapus.');
    }
}
