<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // Usamos '*' temporalmente para asegurar conexión total, 
    // o agregamos el patrón de Vercel para seguridad.
    'allowed_origins' => [
        'http://localhost:5173', 
        'http://127.0.0.1:5173',
        'https://ig-ecosystem-git-main-pipe7mirs-projects.vercel.app',
        '*', // <--- ESTO PERMITIRÁ QUE CUALQUIER URL DE VERCEL ENTRE
    ],

    'allowed_origins_patterns' => [
        // Esta es la forma más profesional: acepta cualquier subdominio de tu proyecto
        '/^https:\/\/ig-ecosystem-.*\.vercel\.app$/',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];