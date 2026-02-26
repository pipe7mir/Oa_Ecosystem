# 🚀 Guía de Despliegue OASIS

Esta guía te ayudará a configurar la base de datos y desplegar OASIS para que todas las funciones de administrador funcionen correctamente.

## 📋 Requisitos Previos

- Cuenta de GitHub (ya tienes el repositorio)
- Cuenta de Vercel (para el frontend)
- Cuenta de Railway, Render o Fly.io (para el backend)
- Base de datos PostgreSQL (Supabase o Neon - ambos tienen tier gratuito)

---

## 🗄️ Paso 1: Configurar Base de Datos PostgreSQL

### Opción A: Supabase (Recomendado - Gratis)

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Ve a **Project Settings > Database**
4. Copia la **Connection String** (URI)
   - Formato: `postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres`
5. Guarda esta URL, la necesitarás para el backend

### Opción B: Neon (Alternativa Gratuita)

1. Ve a [neon.tech](https://neon.tech) y crea una cuenta
2. Crea un nuevo proyecto
3. Copia la **Connection String**
4. Guarda esta URL

---

## 🔧 Paso 2: Desplegar Backend en Railway

Railway es la opción más sencilla para desplegar el backend NestJS.

### Configuración:

1. Ve a [railway.app](https://railway.app) y conecta tu cuenta de GitHub
2. Click en **"New Project"** > **"Deploy from GitHub Repo"**
3. Selecciona tu repositorio `Oa_Ecosystem`
4. Configura el **Root Directory**: `backend`
5. Agrega las **Variables de Entorno**:

```env
PORT=3000
DATABASE_URL=postgresql://... (tu URL de Supabase/Neon)
JWT_SECRET=genera-una-clave-segura-aqui-12345
NODE_ENV=production
```

6. Railway desplegará automáticamente
7. Copia la URL del backend (ej: `https://oasis-backend.railway.app`)

### Alternativa: Render.com

1. Ve a [render.com](https://render.com)
2. Crea un nuevo **Web Service**
3. Conecta tu repositorio
4. Configura:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
5. Agrega las variables de entorno igual que arriba

---

## 🌐 Paso 3: Configurar Frontend en Vercel

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Ve a **Settings > Environment Variables**
3. Agrega:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://tu-backend.railway.app` (URL del paso 2) |

4. Click en **Redeploy** para aplicar los cambios

---

## 🔐 Paso 4: Crear Usuario Administrador

Una vez desplegado, necesitas crear el primer usuario admin:

### Opción 1: Usando la API directamente

```bash
curl -X POST https://tu-backend.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@oasis.com", "password": "tu-password-seguro", "name": "Admin", "role": "admin"}'
```

### Opción 2: Usando el seed (si existe)

```bash
# En Railway, ve a tu servicio > Settings > Run Command
npm run seed
```

---

## ✅ Verificación

1. Abre tu frontend en Vercel
2. Ve a `/login`
3. Inicia sesión con tu usuario admin
4. Prueba crear un anuncio en `/admin/announcements`
5. Verifica que aparezca en la página principal

---

## 📱 PWA - Instalar como App

La aplicación ya está configurada como PWA con el logo oficial:

### En Android:
1. Abre la web en Chrome
2. Toca el menú (⋮) > "Agregar a pantalla de inicio"
3. La app aparecerá con el logo OASIS

### En iOS:
1. Abre la web en Safari
2. Toca el botón Compartir > "Agregar a inicio"
3. La app aparecerá con el logo OASIS

---

## 🔧 Solución de Problemas

### "Las funciones admin no funcionan"
- Verifica que `VITE_API_URL` esté configurada en Vercel
- Verifica que el backend esté corriendo en Railway
- Revisa los logs del backend en Railway

### "Los anuncios no se guardan"
- Verifica la conexión a la base de datos (`DATABASE_URL`)
- Revisa los logs del backend para errores de conexión
- Asegúrate que la base de datos PostgreSQL esté activa

### "Error de CORS"
- Actualiza el archivo `backend/src/main.ts` para incluir tu dominio de Vercel
- Redespliega el backend

### "La app no se instala como PWA"
- Asegúrate de acceder por HTTPS
- Borra caché del navegador y recarga
- En iOS, solo funciona desde Safari

---

## 📊 Arquitectura Final

```
┌─────────────────────────────────────────────────────────────┐
│                     USUARIOS                                 │
│                   (Móvil / Desktop)                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   VERCEL (Frontend)                          │
│               oasis-brown.vercel.app                         │
│                  React + Vite + PWA                          │
└─────────────────────┬───────────────────────────────────────┘
                      │ API Calls (HTTPS)
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              RAILWAY/RENDER (Backend)                        │
│              your-app.railway.app                            │
│                    NestJS API                                │
└─────────────────────┬───────────────────────────────────────┘
                      │ SQL Queries
                      ▼
┌─────────────────────────────────────────────────────────────┐
│               SUPABASE/NEON (Database)                       │
│                    PostgreSQL                                │
│        Almacena: Usuarios, Anuncios, Recursos, etc.         │
└─────────────────────────────────────────────────────────────┘
```

---

## 💡 Costos Estimados

| Servicio | Plan Gratuito | Limitaciones |
|----------|---------------|--------------|
| Vercel | Gratis | 100GB bandwidth/mes |
| Railway | $5 crédito/mes | Suficiente para apps pequeñas |
| Supabase | Gratis | 500MB DB, 2GB storage |
| Neon | Gratis | 512MB DB |

**Total para empezar: $0/mes** ✅

---

## 🆘 Soporte

Si tienes problemas:
1. Revisa los logs en Railway/Vercel
2. Verifica las variables de entorno
3. Asegúrate que la base de datos esté activa
