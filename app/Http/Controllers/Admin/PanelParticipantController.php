<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AssignParticipantRequest;
use App\Models\Panel;
use App\Models\Participant;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;

class PanelParticipantController extends Controller
{
    /**
     * Assign (or move) a participant to the panel.
     */
    public function store(AssignParticipantRequest $request, Panel $panel): RedirectResponse
    {
        /** @var Participant $participant */
        $participant = Participant::findOrFail($request->validated('participant_id'));
        $oldPanelId = $participant->panels()->first()?->id;

        $participant->panels()->sync([$panel->id]);

        AuditLogger::log(auth()->user(), 'participant.panel_assigned', $participant, [
            'from_panel_id' => $oldPanelId,
            'to_panel_id' => $panel->id,
        ]);

        return back()->with('success', 'Peserta berhasil ditugaskan ke '.$panel->name.'.');
    }

    /**
     * Remove a participant from the panel.
     */
    public function destroy(Panel $panel, Participant $participant): RedirectResponse
    {
        $panel->participants()->detach($participant);

        AuditLogger::log(auth()->user(), 'participant.panel_unassigned', $participant, [
            'from_panel_id' => $panel->id,
        ]);

        return back()->with('success', 'Peserta dikeluarkan dari '.$panel->name.'.');
    }
}
