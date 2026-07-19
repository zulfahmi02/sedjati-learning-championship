<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreJudgeRequest;
use App\Http\Requests\Admin\UpdateJudgeRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class JudgeController extends Controller
{
    public function index(Request $request): Response
    {
        $judges = User::query()
            ->where('role', UserRole::Juri)
            ->with('panel:id,name,judge_id')
            ->when($request->string('search')->value(), function ($query, string $search) {
                $query->where(fn ($q) => $q
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%"));
            })
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/judges/index', [
            'judges' => $judges,
            'filters' => [
                'search' => $request->string('search')->value(),
            ],
        ]);
    }

    public function store(StoreJudgeRequest $request): RedirectResponse
    {
        User::create([
            ...$request->validated(),
            'role' => UserRole::Juri,
            'is_active' => true,
        ]);

        return back()->with('success', 'Akun juri berhasil dibuat.');
    }

    public function update(UpdateJudgeRequest $request, User $judge): RedirectResponse
    {
        abort_unless($judge->isJudge(), 404);

        $judge->update($request->validated());

        return back()->with('success', 'Data juri berhasil diperbarui.');
    }
}
