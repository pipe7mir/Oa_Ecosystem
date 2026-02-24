<?php

use App\Models\User;

echo "=== Verificación de Base de Datos ===\n\n";

try {
    $totalUsers = User::count();
    echo "Total de usuarios en la base de datos: $totalUsers\n\n";

    $dmarin = User::where('username', 'dmarin')->first();
    
    if ($dmarin) {
        echo "✅ Usuario 'dmarin' encontrado:\n";
        echo "   - Nombre: {$dmarin->name}\n";
        echo "   - Email: {$dmarin->email}\n";
        echo "   - Rol: {$dmarin->role}\n";
        echo "   - Aprobado: " . ($dmarin->is_approved ? 'Sí' : 'No') . "\n";
        echo "   - Creado: {$dmarin->created_at}\n\n";
        echo "🎉 La base de datos está funcionando correctamente!\n";
    } else {
        echo "❌ Usuario 'dmarin' NO encontrado en la base de datos\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error al conectar con la base de datos:\n";
    echo "   " . $e->getMessage() . "\n";
}
