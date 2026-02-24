<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class AuthController extends Controller
{
    /**
     * Handle an authentication attempt.
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'username' => ['required'], // Can be email or name
            'password' => ['required'],
        ]);

        // Determine if input is email or username
        $loginField = filter_var($credentials['username'], FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

        if (Auth::attempt([$loginField => $credentials['username'], 'password' => $credentials['password']])) {
            $user = Auth::user();

            if (!$user->is_approved) {
                Auth::logout();
                return response()->json([
                    'success' => false,
                    'message' => 'Tu cuenta está pendiente de aprobación.',
                ], 403);
            }
            
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'email' => $user->email,
                    'role' => $user->role, // Now from DB
                ]
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'The provided credentials do not match our records.',
        ], 401);
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required|string|max:100',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'name' => $validated['username'], // Using username as name for now
            'username' => $validated['username'],
            'email' => $validated['email'],
            'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
            'role' => 'user',
            'is_approved' => false, // Default to false
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Usuario registrado correctamente. Espera la aprobación de un administrador.',
            'user' => $user
        ], 201);
    }
}
