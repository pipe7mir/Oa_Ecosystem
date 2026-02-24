# 🚀 DEPLOYMENT DESDE CERO - GUÍA COMPLETA

## FASE 1: PREPARACIÓN LOCAL (5 min)

### 1.1 Verificar Archivos Críticos

#### Backend - `.env` debe tener:
```env
APP_NAME=Oasis
APP_ENV=production
APP_KEY=base64:GENERATE_THIS
APP_DEBUG=false
APP_TIMEZONE=UTC
APP_URL=https://igecosystem-production.up.railway.app

DB_CONNECTION=mysql
DB_HOST=gondola.proxy.rlwy.net
DB_PORT=32192
DB_DATABASE=railway
DB_USERNAME=root
DB_PASSWORD=OuxGyqhyFrfNOpRaIJmIRvfaJjexvOkx

CORS_ALLOWED_ORIGINS=*
```

#### Generar APP_KEY:
```bash
cd backend
php artisan key:generate
```

### 1.2 Limpiar y Optimizar

```bash
# Backend
cd backend
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Frontend
cd ../frontend
npm ci
npm run build
```

---

## FASE 2: BASE DE DATOS (3 min)

### 2.1 Verificar Conexión
```bash
cd backend
php scripts/check_db.php
```

### 2.2 Ejecutar Migraciones
```bash
php artisan migrate:fresh --force
```

### 2.3 Crear Usuario Admin
```bash
php artisan tinker
```

Dentro de tinker:
```php
\App\Models\User::create([
    'name' => 'Admin',
    'username' => 'admin',
    'email' => 'admin@oasis.com',
    'password' => \Hash::make('admin123'),
    'role' => 'admin',
    'is_approved' => 1
]);
exit
```

---

## FASE 3: RAILWAY DEPLOYMENT (Backend)

### 3.1 Crear Nuevo Servicio en Railway

1. Ve a https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Selecciona tu repositorio
4. Railway detectará automáticamente Laravel

### 3.2 Configurar Variables de Entorno en Railway

En Railway Dashboard → tu servicio → Variables:

```
APP_NAME=Oasis
APP_ENV=production
APP_KEY=base64:TU_KEY_GENERADA_ANTES
APP_DEBUG=false
APP_URL=${{RAILWAY_PUBLIC_DOMAIN}}

DB_CONNECTION=mysql
DB_HOST=gondola.proxy.rlwy.net
DB_PORT=32192
DB_DATABASE=railway
DB_USERNAME=root
DB_PASSWORD=OuxGyqhyFrfNOpRaIJmIRvfaJjexvOkx

CORS_ALLOWED_ORIGINS=*
```

### 3.3 Configurar Root Directory

En Railway → Settings → Root Directory:
```
backend
```

### 3.4 Configurar Build Command (si es necesario)

En Railway → Settings → Build Command:
```bash
composer install --optimize-autoloader --no-dev && php artisan config:cache
```

### 3.5 Configurar Start Command

En Railway → Settings → Start Command:
```bash
php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=$PORT
```

### 3.6 Deploy

Click "Deploy" y espera ~3 minutos.

### 3.7 Obtener URL del Backend

Railway te dará una URL como:
```
https://tu-proyecto.up.railway.app
```

Guarda esta URL para el siguiente paso.

---

## FASE 4: VERCEL DEPLOYMENT (Frontend)

### 4.1 Crear Nuevo Proyecto en Vercel

1. Ve a https://vercel.com/new
2. Importa tu repositorio de GitHub
3. Vercel detectará automáticamente Vite

### 4.2 Configurar Variables de Entorno

En Vercel → Settings → Environment Variables:

```
VITE_API_URL=https://TU-RAILWAY-URL-AQUI
```

Ejemplo:
```
VITE_API_URL=https://igecosystem-production.up.railway.app
```

### 4.3 Configurar Root Directory

En Vercel → Settings → Root Directory:
```
frontend
```

### 4.4 Configurar Build Settings

- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm ci`

### 4.5 Deploy

Click "Deploy" y espera ~2 minutos.

---

## FASE 5: VERIFICACIÓN (2 min)

### 5.1 Test Backend

Abre en navegador:
```
https://TU-RAILWAY-URL/api/test-cors
```

Deberías ver:
```json
{
  "success": true,
  "message": "CORS funcionando correctamente",
  "timestamp": "2026-02-24 23:00:00"
}
```

### 5.2 Test Frontend

Abre tu URL de Vercel y abre DevTools (F12).

En consola ejecuta:
```javascript
fetch('https://TU-RAILWAY-URL/api/test-cors')
  .then(r => r.json())
  .then(d => console.log('✅ Backend conectado:', d))
  .catch(e => console.error('❌ Error:', e));
```

### 5.3 Test Login

Credenciales:
- Usuario: `admin`
- Contraseña: `admin123`

---

## TROUBLESHOOTING

### Error: "APP_KEY not set"
```bash
cd backend
php artisan key:generate
# Copia el key generado a Railway variables
```

### Error: Database connection
```bash
# Verifica que Railway tenga acceso a la DB
# Ejecuta en Railway console:
php artisan migrate --force
```

### Error: CORS persiste
Verifica que `CORS_ALLOWED_ORIGINS=*` esté en Railway variables.

---

## ALTERNATIVA: DEPLOYMENT TODO EN RAILWAY

Si Vercel sigue dando problemas, despliega frontend también en Railway:

### Railway - Servicio Frontend

1. Crear nuevo servicio en Railway
2. Root Directory: `frontend`
3. Build Command: `npm ci && npm run build`
4. Start Command: `npx serve -s dist -l 3000`
5. Variables: `VITE_API_URL=https://TU-BACKEND-RAILWAY-URL`

---

## SCRIPTS DE AYUDA

### Script: Deploy Todo
```bash
#!/bin/bash
cd backend
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache

cd ../frontend
npm ci
npm run build

git add .
git commit -m "Deploy: $(date)"
git push origin main

echo "✅ Pusheado a GitHub. Verifica Railway y Vercel."
```

Guarda esto como `deploy.sh` y ejecútalo con `bash deploy.sh`

---

## CHECKLIST FINAL

- [ ] Backend .env configurado
- [ ] APP_KEY generado
- [ ] Base de datos conectada
- [ ] Migraciones ejecutadas
- [ ] Usuario admin creado
- [ ] Railway service creado
- [ ] Variables de Railway configuradas
- [ ] Backend desplegado en Railway
- [ ] Vercel project creado
- [ ] VITE_API_URL configurado en Vercel
- [ ] Frontend desplegado en Vercel
- [ ] Test /api/test-cors funciona
- [ ] Login funciona

---

¿Quieres que empiece ejecutando estos pasos contigo paso a paso?
