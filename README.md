# OASIS Ecosystem - Repositorio Unificado (Estructura Separada)

Este repositorio contiene el ecosistema completo de OASIS, dividido en dos proyectos independientes para facilitar el despliegue y la escalabilidad.

## 📱 Características

- **PWA**: Instalable como app nativa en móviles con el logo oficial
- **Responsive**: Diseño adaptativo para todos los dispositivos
- **Admin Panel**: Panel de administración completo para gestión de contenido

## Estructura

- **[/frontend](./frontend)**: Aplicación React construida con Vite. Diseñada para ser desplegada en **Vercel**.
- **[/backend](./backend)**: API robusta construida con NestJS y TypeORM. Diseñada para ser desplegada en plataformas como **Railway, Render o Fly.io**.

## 🚀 Despliegue Rápido

**Para que las funciones de admin funcionen, necesitas:**

1. **Base de datos PostgreSQL** (gratis en [Supabase](https://supabase.com) o [Neon](https://neon.tech))
2. **Backend en Railway/Render** (no funciona bien en Vercel)
3. **Frontend en Vercel** con `VITE_API_URL` configurada

📖 **[Ver Guía Completa de Despliegue](./DEPLOYMENT.md)**

## Desarrollo Local

### 1. Requisitos
- Node.js (v18+)
- npm

### 2. Iniciar Backend
```bash
cd backend
npm install
npm run start:dev
```
El servidor correrá en `http://localhost:3000`.

### 3. Crear Usuario Admin
```bash
cd backend
npm run seed
```
Credenciales: `admin@oasis.com` / `oasis123`

### 4. Iniciar Frontend
```bash
cd frontend
npm install
npm run dev
```
La aplicación correrá en `http://localhost:5173`.

## Variables de Entorno

Ver archivos `.env.example` en cada carpeta:
- `backend/.env.example`
- `frontend/.env.example`

