<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * Ensure the authenticated user has the given role and is active.
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        $user = $request->user();

        abort_unless($user !== null, 403);

        if (! $user->is_active) {
            auth()->guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')
                ->withErrors(['email' => 'Akun Anda telah dinonaktifkan.']);
        }

        abort_unless($user->role === UserRole::from($role), 403);

        return $next($request);
    }
}
