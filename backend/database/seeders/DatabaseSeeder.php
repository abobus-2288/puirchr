<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
        ]);

        $admin = User::query()->firstOrCreate(
            ['email' => 'admin@example.com'],
            ['name' => 'Admin', 'password' => 'password']
        );
        $admin->assignRole('admin');

        $user = User::query()->firstOrCreate(
            ['email' => 'user@example.com'],
            ['name' => 'User', 'password' => 'password']
        );
        $user->assignRole('user');
    }
}
