# OASIS Project - Fullstack Structure

Este proyecto ha sido reestructurado en dos directorios independientes: `backend` (Laravel) y `frontend` (React + Vite).

## Prerrequisitos
- PHP 8.2+
- Node.js 18+
- Composer
- MySQL

## Instalación

### 1. Backend (Laravel)
Navega al directorio `backend`:
```bash
cd backend
```

Instala las dependencias de PHP:
```bash
composer install
```

Configura el archivo `.env`:
```bash
cp .env.example .env
# Configura DB_DATABASE, DB_USERNAME, DB_PASSWORD en .env
```

Genera la clave de aplicación y ejecuta migraciones:
```bash
php artisan key:generate
php artisan migrate
```

Inicia el servidor de desarrollo (Puero 8000):
```bash
php artisan serve
```

### 2. Frontend (React + Vite)
Navega al directorio `frontend`:
```bash
cd ../frontend
```

Instala las dependencias de Node:
```bash
npm install
```

Configura el entorno:
El archivo `.env` ya debe existir con:
`VITE_API_URL=http://localhost:8000/api`

Inicia el servidor de desarrollo (Puerto 5173):
```bash
npm run dev
```

## Despliegue (Deployment)

### Backend (Heroku/Railway/DigitalOcean)
- Asegúrate de configurar la variable de entorno `APP_KEY` y las credenciales de base de datos en el panel de tu proveedor.
- Configura el `Build Pack` para PHP.
- El comando de inicio suele ser `php artisan serve --host=0.0.0.0 --port=$PORT` o configurar un servidor Nginx/Apache (recomendado para producción).

### Frontend (Vercel/Netlify)
- Conecta tu repositorio.
- Configura el `Root Directory` como `frontend`.
- Vercel detectará automáticamente Vite.
- Comando de Build: `npm run build`
- Output Directory: `dist`
- **Importante**: Agrega la variable de entorno `VITE_API_URL` en el panel de Vercel/Netlify apuntando a la URL de producción de tu backend (ej. `https://oasis-backend.railway.app/api`).

## Estructura
- `/backend`: API RESTful Laravel.
- `/frontend`: SPA React con Glassmorphism.

## CI / Deployment - Secrets

Los workflows en `.github/workflows` requieren configurar secretos en GitHub (Settings → Secrets).
- `DOCKERHUB_USERNAME` y `DOCKERHUB_TOKEN` (si vas a publicar imágenes en Docker Hub).
- `SSH_PRIVATE_KEY` y `SSH_HOST` (si vas a desplegar vía SSH).
- `PRODUCTION_DB_*` variables según tu proveedor.

El workflow `ci.yml` ejecuta lint, tests y build. Para despliegue automático añade las credenciales anteriores en el repositorio.
# IgEcosystem
