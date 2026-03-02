# 🚀 Solución Integral Error 413 - Ecosystem Oasis

## Problema Diagnosticado
**Error 413 (Request Entity Too Large)**: Cuando subes imágenes para Hero carousel desde React, el servidor rechaza la petición porque el payload excede los límites configurados en múltiples capas de la infraestructura.

---

## 🏗️ Arquitectura (4 Capas)

```
┌─────────────────────────────┐
│  Frontend React             │ Layer 1: Browser Image Compression
│  (browser-image-compression)│
└──────────────┬──────────────┘
               │ Base64 < 900KB
               │ Content-Type: application/json
               ▼
┌─────────────────────────────┐
│  Axios + Client Validation  │ Layer 2: HTTP Client Headers
│  (apiClient.post)           │
└──────────────┬──────────────┘
               │ Authorization + Content-Type verified
               │
               ▼
┌─────────────────────────────┐
│  Railway Nginx Proxy        │ Layer 3: Reverse Proxy Limits
│  (Reverse SSL Proxy)        │
└──────────────┬──────────────┘
               │ client_max_body_size: 20M
               │
               ▼
┌─────────────────────────────┐
│  NestJS + Express Middleware│ Layer 4: Backend Payload Parsing
│  (Express json limit)       │
└──────────────┬──────────────┘
               │ Recibe base64 en JSON
               │
               ▼
┌─────────────────────────────┐
│  Cloudinary Upload Service  │ Result: Image stored securely
│  (oasis-billboards folder)  │
└─────────────────────────────┘
```

---

## ✅ Soluciones Aplicadas por Capa

### CAPA 1: Frontend React - Compresión en Navegador

**Ubicación**: `frontend/src/hooks/useImageCompression.js`

**Libería**: `browser-image-compression` (instalada)

**Estrategia**:
- Compresión agresiva automática: máximo 900KB en Base64
- Redimensión a 1280x720 (suficiente para Hero)
- JPEG 75% quality (balance visual/peso)
- Web Worker (no bloquea UI)
- Validación previa antes de enviar

**Uso**:
```javascript
import useImageCompression from '../hooks/useImageCompression';

const { compressImage, validateCompressedImage } = useImageCompression();

// En handleSubmit:
const result = await compressImage(file, {
    maxSizeMB: 0.9,           // < 900KB
    maxWidthOrHeight: 1280,   // Dimensión máxima
    initialQuality: 0.75,     // JPEG quality
    useWebWorker: true,        // No bloquea
});

console.log(`✅ Reducción: ${result.reductionPercent}%`);
```

**Beneficio**: Reduce imágenes típicas de 2-5MB a 200-400KB ANTES de enviar

---

### CAPA 2: Axios - Validación de Headers

**Ubicación**: `frontend/src/api/client.js`

**Configuración Correcta**:
```javascript
const apiClient = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',  // ✅ Correcto para JSON + Base64
        'Accept': 'application/json'
    },
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;  // ✅ JWT Auth
    }
    return config;
});
```

**Nota Importante**:
- `Content-Type: application/json` es correcto para `{ imageBase64: "..." }`
- `multipart/form-data` es solo si usas FormData + File objects (más pesado)
- Base64 en JSON es más eficiente para esta arquitectura

**Validación**:
```javascript
// En AdminBillboard.jsx:
const { data } = await apiClient.post('/billboards/upload-image', { imageBase64 });
// ✅ Axios gestiona automáticamente Content-Type
// ✅ Interceptor agrega Authorization header
```

---

### CAPA 3: Railway Nginx - Configuración del Proxy

**Problema**: Railway usa Nginx como reverse proxy con límite por defecto: `client_max_body_size: 1m`

**Solución Opción A - Via Dockerfile (RECOMENDADO)**:

Si tenés acceso a Railway dashboard → Settings → Dockerfile, agrega:

```dockerfile
FROM node:18-alpine

# ... resto de build ...

# ⚠️ CRÍTICO: Override Nginx para no rechazar payloads grandes
RUN echo 'client_max_body_size 20m;' >> /etc/nginx/conf.d/default.conf || true

EXPOSE 3000
CMD ["node", "dist/main"]
```

**Solución Opción B - Via Environment Variable en Railway**:

1. Ve a Railway Dashboard → Tu proyecto
2. Ve a Settings → Environment Variables
3. Agrega:
```
NGINX_CLIENT_MAX_BODY_SIZE=20m
```

**Solución Opción C - Via railway.json** (si existe):

Archivo: `railway.json` en raíz:
```json
{
  "build": {
    "command": "npm run build",
    "builder": "dockerfile"
  },
  "deploy": {
    "startCommand": "npm run start:prod",
    "environment": {
      "NGINX_CLIENT_MAX_BODY_SIZE": "20m"
    }
  }
}
```

**Validación**: Cuando Railway redeploy finalice, verifica:
```bash
# En prod (si tienes acceso SSH):
curl -I https://oaecosystem-production.up.railway.app/api
# Debe responder 200/401, NO 413
```

---

### CAPA 4: NestJS Backend - Express Payload Limits

**Ubicación**: `backend/src/main.ts`

**Configuración Actual (CORRECTA)**:
```typescript
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ✅ CRÍTICO: Configurar límites INMEDIATAMENTE después de crear app
  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ extended: true, limit: '100mb' }));
  app.use(express.raw({ limit: '100mb' }));

  console.log('📦 Payload limit configured: 100MB');

  app.setGlobalPrefix('api');
  // ... resto de config ...
}
```

**Por qué 100MB**: 
- Base64 encoding aumenta 33% el tamaño original
- 900KB comprimido × 1.33 = 1.2MB
- Margen de seguridad: 100MB permite mucho overhead

**NO NECESITAS**:
- `.htaccess` (eso es Apache, no NestJS)
- `php.ini` (eso es PHP, no NestJS)
- Cambias en `post_max_size` (es PHP)

**Validación en código**:
```typescript
// En billboards.controller.ts:
@Post('upload-image')
@UseGuards(JwtAuthGuard)
async uploadImage(@Body() body: any) {
    const imageBase64 = body?.imageBase64 || body;
    console.log('📸 Billboard image size:', (imageBase64.length / 1024).toFixed(1) + 'KB');
    
    // ✅ Si llegó aquí sin 413, Express aceptó el payload
    if (process.env.CLOUDINARY_URL) {
        const result = await cloudinary.uploader.upload(imageBase64, {
            folder: 'oasis-billboards',
            resource_type: 'image',
        });
        return { success: true, imageUrl: result.secure_url };
    }
}
```

---

## 🔍 Diagnóstico & Troubleshooting

### Error 413 persiste después de cambios:

1. **Verifica capa Nginx primero** (es la primera que rechaza):
```javascript
// En frontend, desde console del navegador:
fetch('https://oaecosystem-production.up.railway.app/api/billboards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64: 'data:image/jpeg;base64,/9j/4...' })
})
.then(r => r.status)
.catch(e => console.log('Error:', e.message))
// Si 413 → problema Nginx
// Si 401 → pasó Nginx ✅
```

2. **Verifica tamaño real del payload**:
```javascript
// En AdminBillboard.jsx:
const result = await compressImage(file);
const estimatedSize = result.base64.length / 1024;
console.log(`📊 Tamaño estimado del payload: ${estimatedSize.toFixed(1)}KB`);
// Debe estar < 1MB
```

3. **Si aún falla, revisa logs de Railway**:
```bash
# En Railway Dashboard:
# - Ve a tu project
# - Logs tab
# - Busca "413" o "payload"
# - Si ves "client max body size exceeded" → es Nginx
```

---

## 📋 Checklist Final

- [x] Frontend: `browser-image-compression` instalada
- [x] Hook: `useImageCompression.js` creado
- [x] AdminBillboard: usando `compressImage()` 
- [x] Axios: headers correctos (`Content-Type: application/json`)
- [x] Backend: Express limits en `main.ts` (100MB)
- [x] Backend: Endpoint `/billboards/upload-image` con JWT + Cloudinary
- [ ] Railway: Configurar `client_max_body_size: 20m` en Nginx
- [ ] Railway: Trigger redeploy después de Dockerfile/env cambios
- [ ] Test: Subir imagen en Admin → Verificar en Cloudinary

---

## 🚀 Próximos Pasos

1. **Railway Nginx Configuration**: Aplica Opción A, B, o C según tengas acceso
2. **Redeploy**: Commit + push para triggear nuevo build en Railway
3. **Test**: Sube una imagen en Admin Billboard
4. **Verify**: Revisa que aparezca en Cloudinary (carpeta `oasis-billboards`)

---

## 📚 Referencias de Configuración

| Capa | Componente | Límite Actual | Recomendado | Archivo |
|------|-----------|---------------|-------------|---------|
| 1 | Browser Compression | 900KB | 900KB | `useImageCompression.js` |
| 2 | Axios Headers | JSON | application/json | `client.js` |
| 3 | Nginx Proxy | 1M ⚠️ | 20M | Railway env/Dockerfile |
| 4 | Express Payload | 100MB ✅ | 100MB | `main.ts` |
| 5 | Cloudinary | Unlimited | N/A | `.env` |

---

**Versión**: 1.0 - Generado el 2026-03-01  
**Stack**: NestJS + React + Railway + Cloudinary  
**Estado**: Listo para Deploy
