<?php

namespace App\Console\Commands;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password as PasswordRule;

use function Laravel\Prompts\password;

#[Signature('app:provision-admin
            {--name=Admin SLC : Nama administrator}
            {--email=admin@tamanbelajarsedjati.com : Email administrator}')]
#[Description('Membuat akun administrator production secara aman')]
class ProvisionAdmin extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $name = (string) $this->option('name');
        $email = mb_strtolower((string) $this->option('email'));

        if (User::query()->where('email', $email)->exists()) {
            $this->components->error("Akun dengan email {$email} sudah ada.");

            return self::FAILURE;
        }

        $plainPassword = password(
            label: 'Kata sandi administrator',
            required: true,
            validate: fn (string $value) => validator(
                ['password' => $value],
                ['password' => [PasswordRule::min(12)->mixedCase()->numbers()->symbols()->uncompromised()]],
            )->errors()->first('password') ?: null,
        );

        User::query()->create([
            'name' => $name,
            'email' => $email,
            'email_verified_at' => now(),
            'password' => Hash::make($plainPassword),
            'role' => UserRole::Admin,
            'is_active' => true,
        ]);

        $this->components->info("Administrator {$email} berhasil dibuat.");

        return self::SUCCESS;
    }
}
