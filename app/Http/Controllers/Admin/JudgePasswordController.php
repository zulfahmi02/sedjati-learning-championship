<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ResetJudgePasswordRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;

class JudgePasswordController extends Controller
{
    public function update(ResetJudgePasswordRequest $request, User $judge): RedirectResponse
    {
        abort_unless($judge->isJudge(), 404);

        $judge->update([
            'password' => $request->validated('password'),
        ]);

        return back()->with('success', 'Kata sandi juri berhasil direset.');
    }
}
