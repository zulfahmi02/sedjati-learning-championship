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
            {--email=admin@tamanbelajarsedjati.com : Email administrator}
            {--password-env= : Nama environment variable yang berisi kata sandi}')]
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

        $passwordEnvironmentVariable = (string) $this->option('password-env');
        $plainPassword = $this->resolvePassword($passwordEnvironmentVariable);

        if ($plainPassword === null) {
            return self::FAILURE;
        }

        $administrator = User::query()->create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($plainPassword),
            'role' => UserRole::Admin,
            'is_active' => true,
        ]);

        $administrator->forceFill(['email_verified_at' => now()])->save();

        $this->components->info("Administrator {$email} berhasil dibuat.");

        return self::SUCCESS;
    }

    private function resolvePassword(string $passwordEnvironmentVariable): ?string
    {
        if ($passwordEnvironmentVariable === '') {
            return password(
                label: 'Kata sandi administrator',
                required: true,
                validate: fn (string $value) => $this->passwordValidationError($value),
            );
        }

        $plainPassword = getenv($passwordEnvironmentVariable);

        if ($plainPassword === false || $plainPassword === '') {
            $this->components->error("Environment variable {$passwordEnvironmentVariable} tidak tersedia.");

            return null;
        }

        $validationError = $this->passwordValidationError($plainPassword);

        if ($validationError !== null) {
            $this->components->error($validationError);

            return null;
        }

        return $plainPassword;
    }

    private function passwordValidationError(string $plainPassword): ?string
    {
        return validator(
            ['password' => $plainPassword],
            ['password' => [PasswordRule::min(12)->mixedCase()->numbers()->symbols()->uncompromised()]],
        )->errors()->first('password') ?: null;
    }
}
