# OASIS Ecosystem - Repositorio Unificado (Estructura Separada)

Este repositorio contiene el ecosistema completo de OASIS, dividido en dos proyectos independientes para facilitar el despliegue y la escalabilidad.

## Estructura

- **[/frontend](./frontend)**: Aplicación React construida con Vite. Diseñada para ser desplegada en **Vercel**.
- **[/backend](./backend)**: API robusta construida con NestJS y TypeORM. Diseñada para ser desplegada en plataformas de contenedores como **Railway, Render o Fly.io** para soportar persistencia de SQLite o PostgreSQL.

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

### 3. Iniciar Frontend
```bash
cd frontend
npm install
npm run dev
```
La aplicación correrá en `http://localhost:5173`. Gracias al proxy configurado en `vite.config.js`, las peticiones a `/api` se redirigirán automáticamente al puerto 3000.

## Despliegue

Consulte la [Guía de Despliegue](./walkthrough.md) para más detalles sobre cómo subir cada parte a su respectiva plataforma.
