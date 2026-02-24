<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ForceCorsSecurity
{
    /**
     * Handle an incoming request and force CORS headers
     */
    public function handle(Request $request, Closure $next)
    {
        // Lista de orígenes permitidos
        $allowedOrigins = [
            'https://ig-ecosystem-git-main-pipe7mirs-projects.vercel.app',
            'https://igecosystem-production.up.railway.app',
            'http://localhost:5173',
            'http://127.0.0.1:5173',
        ];

        $origin = $request->header('Origin');

        // Verificar si el origen está permitido o coincide con el patrón
        $isAllowed = in_array($origin, $allowedOrigins) || 
                     preg_match('/^https:\/\/ig-ecosystem.*\.vercel\.app$/', $origin);

        if ($isAllowed) {
            // Si es una petición OPTIONS (preflight), responder inmediatamente
            if ($request->getMethod() === 'OPTIONS') {
                return response('', 200)
                    ->header('Access-Control-Allow-Origin', $origin)
                    ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
                    ->header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, Authorization, X-CSRF-TOKEN, Accept')
                    ->header('Access-Control-Allow-Credentials', 'true')
                    ->header('Access-Control-Max-Age', '86400');
            }

            // Para peticiones normales, continuar y añadir headers a la respuesta
            $response = $next($request);

            return $response
                ->header('Access-Control-Allow-Origin', $origin)
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, Authorization, X-CSRF-TOKEN, Accept')
                ->header('Access-Control-Allow-Credentials', 'true');
        }

        // Si el origen no está permitido, continuar sin headers CORS
        return $next($request);
    }
}
