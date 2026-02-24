#!/bin/bash

# 🚀 SCRIPT DE DEPLOYMENT AUTOMATIZADO
# Este script prepara todo para deployment desde cero

set -e  # Detener en caso de error

echo "🚀 INICIANDO DEPLOYMENT DESDE CERO..."
echo ""

# FASE 1: BACKEND
echo "📦 FASE 1: Preparando Backend..."
cd backend

echo "  → Instalando dependencias de Composer..."
composer install --optimize-autoloader --no-dev --quiet

echo "  → Verificando APP_KEY..."
if ! grep -q "APP_KEY=base64:" .env; then
    echo "  ⚠️  Generando APP_KEY..."
    php artisan key:generate --force
else
    echo "  ✅ APP_KEY ya existe"
fi

echo "  → Limpiando cachés..."
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear

echo "  → Verificando conexión a base de datos..."
if php scripts/check_db.php; then
    echo "  ✅ Base de datos conectada"
else
    echo "  ❌ Error al conectar con la base de datos"
    exit 1
fi

echo "  → Ejecutando migraciones..."
php artisan migrate:fresh --force

echo "  → Creando usuario administrador..."
php artisan tinker <<EOF
\App\Models\User::create([
    'name' => 'Admin',
    'username' => 'admin',
    'email' => 'admin@oasis.com',
    'password' => \Hash::make('admin123'),
    'role' => 'admin',
    'is_approved' => 1
]);
echo "Usuario admin creado!\n";
exit
EOF

echo "  → Optimizando para producción..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

cd ..

# FASE 2: FRONTEND
echo ""
echo "🎨 FASE 2: Preparando Frontend..."
cd frontend

echo "  → Instalando dependencias de npm..."
npm ci --silent

echo "  → Construyendo para producción..."
npm run build

cd ..

# FASE 3: GIT
echo ""
echo "📝 FASE 3: Preparando para deployment..."

echo "  → Agregando archivos al stage..."
git add .

echo "  → Creando commit..."
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
git commit -m "🚀 Deployment desde cero - $TIMESTAMP" || echo "  ℹ️  No hay cambios para commitear"

echo "  → Pusheando a GitHub..."
git push origin main

echo ""
echo "✅ ¡PREPARACIÓN COMPLETA!"
echo ""
echo "📋 PRÓXIMOS PASOS MANUALES:"
echo ""
echo "1️⃣  RAILWAY (Backend):"
echo "   → Ve a: https://railway.app/dashboard"
echo "   → Verifica que el deployment esté en progreso"
echo "   → Copia la URL del servicio"
echo ""
echo "2️⃣  VERCEL (Frontend):"
echo "   → Ve a: https://vercel.com/dashboard"
echo "   → Settings → Environment Variables"
echo "   → Actualiza VITE_API_URL con la URL de Railway"
echo "   → Redeploy desde el dashboard"
echo ""
echo "3️⃣  VERIFICACIÓN:"
echo "   → Test backend: https://TU-RAILWAY-URL/api/test-cors"
echo "   → Login: usuario=admin, password=admin123"
echo ""
echo "📄 Consulta DEPLOYMENT_DESDE_CERO.md para detalles completos"
echo ""
