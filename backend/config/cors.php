<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'api/login', 'api/register', 'api/logout'],

    'allowed_methods' => ['*'],

    // Use environment variable to configure allowed origins for security.
    // Example in backend/.env: CORS_ALLOWED_ORIGINS="https://myfrontend.app,https://admin.myfrontend.app"
    'allowed_origins' => array_filter(array_map('trim', explode(',', env('CORS_ALLOWED_ORIGINS', 'http://localhost:5173,https://ig-ecosystem-git-main-pipe7mirs-projects.vercel.app')))),

    // Accept common Vercel preview subdomains if needed. Keep patterns minimal.
    'allowed_origins_patterns' => [
        env('CORS_ALLOWED_ORIGINS_PATTERNS', '/^https:\/\/ig-ecosystem(-.*)?\\.vercel\\.app$/'),
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // If your frontend sends cookies/credentials, set to true and ensure
    // CORS_ALLOWED_ORIGINS does NOT contain '*'.
    'supports_credentials' => env('CORS_SUPPORTS_CREDENTIALS', true),

];