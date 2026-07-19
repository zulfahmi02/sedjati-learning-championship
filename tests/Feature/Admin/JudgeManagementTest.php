<?php

use App\Enums\UserRole;
use App\Models\User;

test('admins can view the judges index', function () {
    $admin = User::factory()->admin()->create();
    User::factory()->judge()->count(3)->create();

    $this->actingAs($admin)
        ->get(route('admin.judges.index'))
        ->assertOk();
});

test('admins can create a judge account', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post(route('admin.judges.store'), [
            'name' => 'Juri Utama',
            'email' => 'juri@slc.test',
            'password' => 'password-juri-123',
            'password_confirmation' => 'password-juri-123',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('users', [
        'email' => 'juri@slc.test',
        'role' => UserRole::Juri->value,
        'is_active' => true,
    ]);
});

test('admins can deactivate a judge', function () {
    $admin = User::factory()->admin()->create();
    $judge = User::factory()->judge()->create();

    $this->actingAs($admin)
        ->put(route('admin.judges.update', $judge), [
            'name' => $judge->name,
            'email' => $judge->email,
            'is_active' => false,
        ])
        ->assertRedirect();

    expect($judge->refresh()->is_active)->toBeFalse();
});

test('admins can reset a judge password', function () {
    $admin = User::factory()->admin()->create();
    $judge = User::factory()->judge()->create();

    $this->actingAs($admin)
        ->put(route('admin.judges.password', $judge), [
            'password' => 'kata-sandi-baru-123',
            'password_confirmation' => 'kata-sandi-baru-123',
        ])
        ->assertRedirect();

    expect(Illuminate\Support\Facades\Hash::check('kata-sandi-baru-123', $judge->refresh()->password))->toBeTrue();
});

test('judge management endpoints reject admin targets', function () {
    $admin = User::factory()->admin()->create();
    $otherAdmin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->put(route('admin.judges.password', $otherAdmin), [
            'password' => 'kata-sandi-baru-123',
            'password_confirmation' => 'kata-sandi-baru-123',
        ])
        ->assertNotFound();
});
