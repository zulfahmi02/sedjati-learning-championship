<?php

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;

afterEach(function () {
    putenv('SLC_TEST_ADMIN_PASSWORD');
});

it('provisions an administrator from an environment variable', function () {
    Http::fake();
    putenv('SLC_TEST_ADMIN_PASSWORD=Secure!Admin2026#Password');

    $this->artisan('app:provision-admin', [
        '--name' => 'Admin SLC',
        '--email' => 'ADMIN@TAMANBELAJARSEDJATI.COM',
        '--password-env' => 'SLC_TEST_ADMIN_PASSWORD',
    ])->assertSuccessful();

    $administrator = User::query()->where('email', 'admin@tamanbelajarsedjati.com')->firstOrFail();

    expect($administrator->name)->toBe('Admin SLC')
        ->and($administrator->role)->toBe(UserRole::Admin)
        ->and($administrator->is_active)->toBeTrue()
        ->and($administrator->email_verified_at)->not->toBeNull()
        ->and(Hash::check('Secure!Admin2026#Password', $administrator->password))->toBeTrue();
});

it('fails without exposing a missing password environment variable', function () {
    $this->artisan('app:provision-admin', [
        '--password-env' => 'SLC_TEST_ADMIN_PASSWORD',
    ])->assertFailed();

    expect(User::query()->where('email', 'admin@tamanbelajarsedjati.com')->exists())->toBeFalse();
});
