<?php

namespace Database\Seeders;

use App\Models\EventSetting;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        if (! User::where('email', 'admin@slc.test')->exists()) {
            User::factory()->admin()->create([
                'name' => 'Administrator',
                'email' => 'admin@slc.test',
            ]);
        }

        EventSetting::current();
    }
}
