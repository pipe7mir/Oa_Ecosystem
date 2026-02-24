<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Limpiar tabla users
        DB::table('users')->truncate();

        // Crear usuario Admin
        User::create([
            'name' => 'Admin User',
            'username' => 'admin',
            'email' => 'admin@oasis.com',
            'password' => Hash::make('12345678'),
            'role' => 'admin',
            'is_approved' => true,
        ]);

        // Crear usuario Pipe_Mila
        User::create([
            'name' => 'Felipe Miranda',
            'username' => 'Pipe_Mila',
            'email' => 'felipemiranda959@gmail.com',
            'password' => Hash::make('12345678'),
            'role' => 'user',
            'is_approved' => true,
        ]);
        
        $this->command->info('User admin created successfully (password: 12345678).');
    }
}
