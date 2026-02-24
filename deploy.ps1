# DEPLOYMENT DESDE CERO - PowerShell Script

Write-Host "INICIANDO DEPLOYMENT DESDE CERO..." -ForegroundColor Cyan
Write-Host ""

# FASE 1: BACKEND
Write-Host "FASE 1: Preparando Backend..." -ForegroundColor Yellow
Set-Location backend

Write-Host "  > Instalando dependencias de Composer..."
composer install --optimize-autoloader --no-dev --quiet

Write-Host "  > Verificando APP_KEY..."
$envContent = Get-Content .env -Raw
if ($envContent -notmatch "APP_KEY=base64:") {
    Write-Host "  > Generando APP_KEY..." -ForegroundColor Yellow
    php artisan key:generate --force
} else {
    Write-Host "  > APP_KEY ya existe" -ForegroundColor Green
}

Write-Host "  > Limpiando caches..."
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear

Write-Host "  > Verificando conexion a base de datos..."
$dbTest = php scripts/check_db.php
if ($LASTEXITCODE -eq 0) {
    Write-Host "  > Base de datos conectada" -ForegroundColor Green
} else {
    Write-Host "  > Error al conectar con la base de datos" -ForegroundColor Red
    exit 1
}

Write-Host "  > Ejecutando migraciones..."
php artisan migrate:fresh --force

Write-Host "  > Creando usuario administrador..."
php artisan tinker --execute="User::create(['name'=>'Admin','username'=>'admin','email'=>'admin@oasis.com','password'=>Hash::make('admin123'),'role'=>'admin','is_approved'=>1]); echo 'Usuario creado';"

Write-Host "  > Optimizando para produccion..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

Set-Location ..

# FASE 2: FRONTEND
Write-Host ""
Write-Host "FASE 2: Preparando Frontend..." -ForegroundColor Yellow
Set-Location frontend

Write-Host "  > Instalando dependencias de npm..."
npm ci --silent

Write-Host "  > Construyendo para produccion..."
npm run build

Set-Location ..

# FASE 3: GIT
Write-Host ""
Write-Host "FASE 3: Preparando para deployment..." -ForegroundColor Yellow

Write-Host "  > Agregando archivos al stage..."
git add .

Write-Host "  > Creando commit..."
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
git commit -m "Deployment desde cero - $timestamp" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "  > No hay cambios para commitear" -ForegroundColor Gray
}

Write-Host "  > Pusheando a GitHub..."
git push origin main

Write-Host ""
Write-Host "PREPARACION COMPLETA!" -ForegroundColor Green
Write-Host ""
Write-Host "PROXIMOS PASOS MANUALES:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. RAILWAY (Backend):" -ForegroundColor White
Write-Host "   > Ve a: https://railway.app/dashboard"
Write-Host "   > Verifica que el deployment este en progreso"
Write-Host "   > Copia la URL del servicio"
Write-Host ""
Write-Host "2. VERCEL (Frontend):" -ForegroundColor White
Write-Host "   > Ve a: https://vercel.com/dashboard"
Write-Host "   > Settings -> Environment Variables"
Write-Host "   > Actualiza VITE_API_URL con la URL de Railway"
Write-Host "   > Redeploy desde el dashboard"
Write-Host ""
Write-Host "3. VERIFICACION:" -ForegroundColor White
Write-Host "   > Test backend: https://TU-RAILWAY-URL/api/test-cors"
Write-Host "   > Login: usuario=admin, password=admin123"
Write-Host ""
Write-Host "Consulta DEPLOYMENT_DESDE_CERO.md para detalles completos" -ForegroundColor Gray
Write-Host ""
