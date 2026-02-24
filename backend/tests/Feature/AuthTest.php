<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_and_login()
    {
        $payload = [
            'name' => 'Test User',
            'username' => 'testuser',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ];

        $this->postJson('/api/register', $payload)
            ->assertStatus(201)
            ->assertJsonStructure(['user']);

        // Approve user so login is allowed
        $user = \App\Models\User::where('email', 'test@example.com')->first();
        $user->is_approved = true;
        $user->save();

        $login = ['username' => 'testuser', 'password' => 'password'];

        $this->postJson('/api/login', $login)
            ->assertStatus(200)
            ->assertJsonStructure(['user', 'token']);
    }
}
