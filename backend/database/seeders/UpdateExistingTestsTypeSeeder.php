<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Test;

class UpdateExistingTestsTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Set all existing tests to 'likert' type
        Test::whereNull('test_type')->update(['test_type' => 'likert']);

        $this->command->info('Updated existing tests to likert type');
    }
}
