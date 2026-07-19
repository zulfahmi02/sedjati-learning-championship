<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ImportParticipantsRequest;
use App\Services\ParticipantImportService;
use Illuminate\Http\RedirectResponse;

class ParticipantImportController extends Controller
{
    public function store(ImportParticipantsRequest $request, ParticipantImportService $importService): RedirectResponse
    {
        $result = $importService->import($request->file('file'));

        $message = $result['imported'].' peserta berhasil diimpor.';

        if ($result['errors'] !== []) {
            return back()
                ->with('success', $message)
                ->with('importErrors', $result['errors']);
        }

        return back()->with('success', $message);
    }
}
