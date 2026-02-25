# OASIS Ecosystem - Unified Architecture

Este proyecto representa el ecosistema digital para la comunidad Oasis, construido bajo una arquitectura unificada que integra el **Frontend (React + Vite)** y el **Backend (NestJS + SQLite/PostgreSQL)** en un solo repositorio listo para despliegues Serverless (ej. Vercel).

## Tecnología Principal

- **Cliente (`/client`)**: React 19, Vite, y Bootstrap 5 enfocado en Glassmorphism y UI modernas.
- **Servidor (`/server`)**: NestJS gestionando la lógica de negocio, autenticación JWT, Controladores REST, y conexión TypeORM (configurado nativamente para SQLite local con compatibilidad PostgreSQL).
- **API Entrypoint (`/api`)**: Adaptador Serverless-Express que permite que NestJS rule como Serverless Functions en Vercel.

## Requisitos Previos

- Node.js 18+
- npm gestionando dependencias

## Entorno Local (Desarrollo)

### 1. Instalación de dependencias

Al estar unificado, solo necesitas instalar en la raíz del proyecto:

```bash
npm install
```

### 2. Variables de Entorno

Configura las variables (el `.env` base puede omitirse para pruebas locales gracias a SQLite preconfigurado):

- Copia `.env.example` en la raíz (si existe) y ajusta las claves de JWT u otros servicios externos (como SMTP para correos o Webhooks de WhatsApp).

### 3. Ejecutar Ambos Entornos Simultáneamente

Levanta Vite (Frontend) y NestJS (Backend API) con un solo comando:

```bash
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8000/api

## Despliegue en Vercel (Producción)

El proyecto incluye el archivo de configuración en la raíz (`vercel.json`) que orquesta el build para ambos ambientes:

1. Importa este repositorio raíz a Vercel.
2. Vercel automatically runs `npm run build`. 
3. El frontend de React se genera en la carpeta `dist/client`. 
4. El backend se asigna al endpoint dinámico `/api/*` y usa `@vercel/node`.

## Notas Importantes sobre la Migración
- El proyecto fue liberado de cualquier dependencia previa del proveedor BaaS "Supabase" u otras infraestructuras monolíticas ("Laravel"). Toda la validación lógica reside exclusivamente en NestJS. 
- Las tablas iniciales se generan automáticamente a través del flag `synchronize: true` de TypeORM durante la fase de desarrollo local.
