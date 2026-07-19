<?php

use App\Models\User;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));

    $response->assertRedirect(route('login'));
});

test('the generic dashboard redirects admins to the admin dashboard', function () {
    $user = User::factory()->admin()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertRedirect(route('admin.dashboard'));
});

test('the generic dashboard redirects judges to the judge dashboard', function () {
    $user = User::factory()->judge()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertRedirect(route('judge.dashboard'));
});

test('admins can visit the admin dashboard', function () {
    $user = User::factory()->admin()->create();

    $this->actingAs($user)
        ->get(route('admin.dashboard'))
        ->assertOk();
});

test('judges can visit the judge dashboard', function () {
    $user = User::factory()->judge()->create();

    $this->actingAs($user)
        ->get(route('judge.dashboard'))
        ->assertOk();
});

test('judges can not visit the admin dashboard', function () {
    $user = User::factory()->judge()->create();

    $this->actingAs($user)
        ->get(route('admin.dashboard'))
        ->assertForbidden();
});

test('admins can not visit the judge dashboard', function () {
    $user = User::factory()->admin()->create();

    $this->actingAs($user)
        ->get(route('judge.dashboard'))
        ->assertForbidden();
});

test('deactivated judges are logged out when accessing protected pages', function () {
    $user = User::factory()->judge()->inactive()->create();

    $this->actingAs($user)
        ->get(route('judge.dashboard'))
        ->assertRedirect(route('login'));

    $this->assertGuest();
});
