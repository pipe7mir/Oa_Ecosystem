<?php

use Illuminate\Support\Facades\Hash;
use App\Models\User;

// Crear usuario administrador dmarin
User::create([
    'name' => 'David Marin',
    'username' => 'dmarin',
    'email' => 'dmarin@oasis.com',
    'password' => Hash::make('123456789'),
    'role' => 'admin',
    'is_approved' => 1,
]);

echo "Usuario dmarin creado exitosamente\n";
