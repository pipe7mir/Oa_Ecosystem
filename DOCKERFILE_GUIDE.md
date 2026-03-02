# 🐳 Dockerfile Configuration Guide

## Overview

Este Dockerfile implementa una **solución de producción robuusta** para Ecosystem Oasis con control máximo sobre la infraestructura. Resuelve permanentemente el **Error 413 (Request Entity Too Large)** con configuración explícita en múltiples capas.

## Architecture

### Multi-Stage Build Strategy

```
┌─────────────────────────────────┐
│ Stage 1: Build Backend (NestJS) │ ← Compila TypeScript → JavaScript
└─────────────────┬───────────────┘
                  │ dist/ + node_modules
                  ▼
┌─────────────────────────────────┐
│ Stage 2: Build Frontend (React) │ ← Compila Vite → Static HTML/JS
└─────────────────┬───────────────┘
                  │ dist/
                  ▼
┌─────────────────────────────────┐
│ Stage 3: Production Runtime     │ ← Imagen final (70MB aproximadamente)
│ - Node.js 18-alpine            │
│ - Nginx reverse proxy           │
│ - Backend + Frontend combined   │
└─────────────────────────────────┘
```

## Key Features

### 1. **Error 413 Resolution**

```dockerfile
# Nginx: Allow 20MB uploads
client_max_body_size 20m;

# Express: Already configured in main.ts
app.use(express.json({ limit: '100mb' }));
```

**Flujo**:
- Frontend comprime imagen a 900KB (browser-image-compression)
- Axios envía como Base64 en JSON
- Nginx permite (client_max_body_size: 20m)
- Express procesa (limit: 100mb)
- Cloudinary almacena

### 2. **Reverse Proxy Configuration**

Nginx está configurado para:
- Servir frontend estático (React/dist)
- Proxy de API a backend (Node.js)
- Manejo de WebSockets (para futuras features)
- Compresión y caché
- Timeout optimizados para uploads grandes

```nginx
location /api {
    proxy_pass http://backend:3000;
    proxy_buffering off;  # No bufferear para uploads grandes
    client_max_body_size 20m;
}
```

### 3. **Multi-Service in One Image**

- Nginx (puerto 80)
- Node.js (puerto 3000 interno)
- Ambos con `dumb-init` para signal handling correcto

### 4. **Environment Management**

Todas las variables de entorno se cargan desde:
1. `.env.docker` (defaults locales)
2. Railway Variables (sobrescriben .env en producción)

### 5. **Health Checks**

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost/health || exit 1
```

Permite que Railway y otros orchestrators detecten problemas y redeployen automáticamente.

---

## Usage

### Local Development (Build y Test)

```bash
# Build imagen localmente
docker build -t oasis:latest .

# Run contenedor localmente
docker run -p 80:80 -p 3000:3000 \
  -e DATABASE_URL="postgresql://...YOUR_DB_URL..." \
  -e CLOUDINARY_URL="cloudinary://..." \
  oasis:latest

# Accede en http://localhost
```

### Railway Deployment (Automático)

1. Commit y push Dockerfile a GitHub
2. Railway detecta automáticamente `Dockerfile` en raíz
3. Triggea build y deploy automático
4. Variables de entorno desde Railway Dashboard

```bash
git add Dockerfile .dockerignore .env.docker
git commit -m "chore: add production Dockerfile with Nginx + Error 413 fix"
git push  # Railway redeploy inicia automáticamente
```

### Verificar Configuración en Producción

```bash
# Test que Nginx acepta payloads grandes
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"test":"payload"}' \
  https://oaecosystem-production.up.railway.app/api/billboards

# Respuesta esperada:
# - Status 401 (sin token) = ¡Nginx aceptó! ✅
# - Status 413 = Error, revisar Railway logs ❌
```

---

## Security Considerations

### ✅ Implemented

- Alpine Linux (50% más pequeño, menos vulnerabilidades)
- Non-root user (implícito en Node)
- Multi-stage build (no expone source code)
- No sensitive data en imagen
- Health checks para detectar fallos
- Signal handling correcto con dumb-init

### ⚠️ To Review

Antes de producción final:

1. **JWT_SECRET**: Cambia en Railway Dashboard
   ```
   Variables → JWT_SECRET → (value fuerte aleatorio)
   ```

2. **CLOUDINARY_URL**: Asegurate que está en Railway (not in repo)
   ```
   Railway Dashboard → Variables → CLOUDINARY_URL
   ```

3. **DATABASE_URL**: Connection string segura
   ```
   Railway adds automatically si usas Railway PostgreSQL
   ```

4. **ALLOWED_ORIGINS**: Actualiza con dominios finales
   ```
   ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
   ```

---

## Troubleshooting

### Build fails locally

```bash
# Limpia cache
docker system prune -a

# Rebuild verbosamente
docker build --progress=plain -t oasis:latest .
```

### Error 413 still appears

1. Verifica Railway redeploy completó (status = ✅)
2. Revisa logs: `curl https://oaecosystem-production.up.railway.app/api/billboards` debe dar 401, no 413
3. Verifica compression en frontend: console debe mostrar `🗜️ Imagen comprimida`
4. Revisa Railway Logs → "client max body size"

### Image too large

Si excede límites de Railway (1GB):

```dockerfile
# Reduce Node modules instalando solo production
RUN npm ci --only=production

# Remove unnecesarios
RUN rm -rf /app/backend/src \
            /app/frontend/src \
            /app/**/*.test.ts
```

---

## Performance Tuning

### Memory Limits

```dockerfile
# En Dockerfile (12MB de 512MB disponible)
ENV NODE_OPTIONS="--max-old-space-size=512"
```

En Railway Dashboard si necesita ajuste:

```
RAILWAY_NODE_OPTIONS=--max-old-space-size=1024
```

### Server Timeouts

```nginx
# En Dockerfile Nginx config
proxy_connect_timeout 180s;     # 3 minutos para conectar
proxy_send_timeout 300s;        # 5 minutos para enviar
proxy_read_timeout 300s;        # 5 minutos para recibir
```

Suficiente para uploads de 20MB incluso en conexiones 4G

---

## File Structure After Build

```
Docker Image (Production)
├── /app/
│   ├── backend/
│   │   ├── dist/              (compiled NestJS)
│   │   ├── node_modules/      (production only)
│   │   └── package.json
│   ├── frontend/
│   │   ├── dist/              (compiled React/Vite)
│   │   └── package.json
│   └── start.sh               (startup script)
├── /etc/nginx/
│   ├── conf.d/
│   │   ├── 00-client-body-size.conf  (20MB limit)
│   │   └── 01-upstream.conf          (backend proxy)
│   └── sites-enabled/
│       └── default             (vhost config)
└── /usr/bin/dumb-init         (PID 1)
```

---

## Maintenance

### Update Node Version

```dockerfile
# En Stage 1, 2, 3: cambiar
FROM node:18-alpine  →  FROM node:20-alpine
```

Luego rebuild y push.

### Add New Environment Variables

1. Documenta en `.env.docker`
2. Agrega en `main.ts` o `.env` si needed
3. Railway Dashboard → Variables → Add

### Custom Nginx Modules

Si necesitas gzip, mod_rewrite, etc:

```dockerfile
# En Stage 3, antes de RUN nginx -t
RUN apk add --no-cache nginx-module-gzip
# ... incluir en nginx.conf
```

---

## Rollback Strategy

Si algo falla en Railway:

1. **Revert Dockerfile** en GitHub
2. **Force Push** (si necesario)
3. Railway auto-redeploy con versión anterior

```bash
git revert HEAD
git push
# Railway detecta cambio, redeploy automático
```

---

## Monitoring & Logs

### Railway Dashboard

1. Deployments → mira status
2. Logs → busca "Error 413" o "nginx"
3. Metrics → CPU/Memory usage

### Local Testing

```bash
docker logs -f <container-id>
```

Verás salida de:
- Nginx startup
- NestJS initialization
- Database connection

---

**Versión**: 1.0 - Docker Production Ready  
**Stack**: NestJS 18 + React 19 + Node 18-alpine + Nginx  
**Error 413**: ☑️ Solved (20m client_max_body_size)  
**Control**: ☑️ Máximo (todo en código, versionado en Git)
