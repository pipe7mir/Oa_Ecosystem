# 🔍 Guía de Depuración: Imágenes de Cartelera No Se Muestran

## 📋 Problema
Las imágenes subidas desde el administrador de cartelera no se muestran en el Hero, aunque el texto se muestra correctamente.

## 🛠️ Sistema de Logs Agregado

He agregado logs detallados en todo el flujo de carga y visualización de imágenes para diagnosticar el problema:

### Backend (NestJS)
- ✅ Logs al iniciar el servidor indicando si Cloudinary está configurado
- ✅ Logs cuando se recibe una solicitud de upload
- ✅ Logs del tamaño de la imagen en KB
- ✅ Logs cuando se sube a Cloudinary (éxito o error)
- ✅ Logs cuando se guarda localmente con la URL completa
- ✅ Logs de la URL final que se devuelve al frontend

### Frontend (React)
**AdminBillboard.jsx:**
- ✅ Logs del nombre del archivo seleccionado
- ✅ Logs del tamaño del Base64 generado
- ✅ Logs de la respuesta completa del servidor
- ✅ Logs de la URL de la imagen subida
- ✅ Logs del objeto completo que se guardará en la base de datos

**Hero.jsx:**
- ✅ Logs de todos los billboards recibidos del API
- ✅ Logs de cada slide con su título y URL
- ✅ Logs del proceso de normalización de URLs
- ✅ Logs indicando si la URL es completa, relativa, o desconocida

## 🔍 Cómo Diagnosticar el Problema

### Paso 1: Verificar Configuración del Backend

1. **Abre un terminal en la carpeta `backend/`**
2. **Verifica las variables de entorno:**
   ```bash
   cat .env
   ```
3. **Busca estas variables críticas:**
   - `CLOUDINARY_URL` - Si existe, las imágenes se subirán a Cloudinary
   - `API_BASE_URL` - Debe ser la URL de producción del backend (ej: `https://tu-backend.railway.app`)

4. **Inicia el backend y observa los logs iniciales:**
   ```bash
   npm run start:dev
   ```
   
   Deberías ver uno de estos mensajes:
   - ✅ `☁️ Cloudinary configured for billboards` → Cloudinary está configurado
   - ⚠️ `⚠️ CLOUDINARY_URL not set, billboards will use local storage` → No está configurado

### Paso 2: Verificar Proceso de Subida

1. **Abre el navegador y ve al Panel de Admin de Cartelera**
2. **Abre la Consola del Navegador (F12 → Consola)**
3. **Sube una nueva imagen y observa los logs:**

   **En el Frontend (Consola del Navegador):**
   ```
   📤 Subiendo imagen: mi-imagen.jpg
   📸 Base64 generado, tamaño: 1234.5KB
   📥 Respuesta del servidor: {success: true, imageUrl: "..."}
   ✅ Imagen subida con éxito: https://res.cloudinary.com/...
   💾 Guardando billboard en DB: {title: "...", media_url: "...", ...}
   ```

   **En el Backend (Terminal donde corre el servidor):**
   ```
   📥 Billboard upload request received
   📸 Billboard image size: 1234.5KB
   ☁️ Uploading billboard to Cloudinary...
   ✅ Cloudinary billboard upload success: https://res.cloudinary.com/...
   ```

   **O si Cloudinary NO está configurado:**
   ```
   📥 Billboard upload request received
   📸 Billboard image size: 1234.5KB
   📸 Local billboard upload: billboard-1234567890.jpg (123456 bytes)
   ✅ Local billboard saved, returning URL: http://localhost:3000/uploads/billboard-1234567890.jpg
   ```

### Paso 3: Verificar Visualización en Hero

1. **Ve a la página principal (Home) donde está el Hero**
2. **Abre la Consola del Navegador (F12 → Consola)**
3. **Observa los logs de carga:**

   ```
   🎬 Billboards recibidos: [{...}, {...}]
      Slide 1: "Mi Título" - URL: https://res.cloudinary.com/...
      Slide 2: "Otro Título" - URL: https://tu-backend.railway.app/uploads/...
   ```

4. **Observa los logs de normalización:**
   ```
   🔍 Normalizando URL: https://res.cloudinary.com/...
      ✅ URL completa detectada: https://res.cloudinary.com/...
   ```

   **O si hay un problema:**
   ```
   🔍 Normalizando URL: /uploads/imagen.jpg
      🔧 URL relativa convertida a: https://tu-backend.railway.app/uploads/imagen.jpg
   ```

### Paso 4: Verificar Network Tab

1. **En el navegador, ve a la pestaña Network (Red)**
2. **Filtra por "Img" o "imagen"**
3. **Recarga la página y observa:**
   - ✅ **Status 200**: La imagen se cargó correctamente
   - ❌ **Status 404**: La imagen no existe en esa URL
   - ❌ **Status 403**: Problema de permisos (CORS)
   - ❌ **Failed**: Error de conexión

## 🔧 Soluciones Comunes

### Problema 1: Cloudinary No Configurado en Producción

**Síntomas:**
- Backend muestra: `⚠️ CLOUDINARY_URL not set`
- URLs devueltas son: `http://localhost:3000/uploads/...`
- En producción las imágenes no cargan (404)

**Solución:**
1. Configura `CLOUDINARY_URL` en Railway:
   - Ve a tu proyecto en Railway
   - Settings → Variables
   - Agrega: `CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name`
   
2. Obtén tus credenciales de Cloudinary:
   - Ve a [cloudinary.com](https://cloudinary.com)
   - Dashboard → API Keys
   - Copia el "API environment variable"

### Problema 2: API_BASE_URL No Configurada

**Síntomas:**
- URLs locales son: `http://localhost:3000/uploads/...`
- En producción deberían ser: `https://tu-backend.railway.app/uploads/...`

**Solución:**
1. Configura `API_BASE_URL` en Railway:
   - Settings → Variables
   - Agrega: `API_BASE_URL=https://tu-backend.railway.app`

### Problema 3: Base de Datos Tiene URLs Antiguas

**Síntomas:**
- Nuevas imágenes cargan bien
- Imágenes antiguas no cargan (tienen URLs relativas del sistema anterior)

**Solución:**
1. **Opción A - Re-subir las imágenes:**
   - Edita cada billboard en el administrador
   - Selecciona y sube la imagen nuevamente
   - Guarda

2. **Opción B - Script de migración (requiere acceso a DB):**
   ```sql
   -- Ver todas las URLs actuales
   SELECT id, title, media_url FROM billboard;
   
   -- Actualizar URLs manualmente si es necesario
   UPDATE billboard 
   SET media_url = 'https://tu-backend.railway.app' || media_url 
   WHERE media_url LIKE '/uploads/%';
   ```

### Problema 4: CORS en Cloudinary

**Síntomas:**
- Console muestra: `CORS policy: No 'Access-Control-Allow-Origin' header`
- Status: `blocked` en Network tab

**Solución:**
Este problema no debería ocurrir con Cloudinary, pero si ocurre:
1. Ve a Cloudinary Dashboard → Settings → Security
2. Verifica que "Allowed fetch domains" incluya tu dominio de Vercel

### Problema 5: Límite de Payload Excedido

**Síntomas:**
- Error: `PayloadTooLargeError: request entity too large`
- Ocurre con imágenes grandes (>5MB)

**Solución:**
1. Edita `backend/src/main.ts`:
   ```typescript
   app.use(json({ limit: '50mb' }));
   app.use(urlencoded({ extended: true, limit: '50mb' }));
   ```

## 📊 Checklist de Verificación

Usa este checklist para diagnosticar sistemáticamente:

### Configuración del Backend
- [ ] `CLOUDINARY_URL` está configurado en Railway
- [ ] `API_BASE_URL` está configurado en Railway (debe ser la URL del backend)
- [ ] Backend muestra `☁️ Cloudinary configured for billboards` al iniciar
- [ ] Directorio `uploads/` existe en el backend (si usa almacenamiento local)

### Configuración del Frontend
- [ ] `VITE_API_URL` apunta al backend correcto (`https://tu-backend.railway.app/api`)
- [ ] No hay errores en la consola del navegador
- [ ] Axios puede conectarse al backend (verificar en Network tab)

### Proceso de Subida
- [ ] Base64 se genera correctamente (ver tamaño en logs)
- [ ] Servidor recibe el request (ver logs del backend)
- [ ] Cloudinary devuelve URL exitosamente (o se guarda localmente)
- [ ] Frontend recibe `{success: true, imageUrl: "..."}`
- [ ] URL se guarda correctamente en la base de datos

### Visualización en Hero
- [ ] Hero recibe billboards del API (ver logs en consola)
- [ ] Cada billboard tiene una URL válida en `media_url`
- [ ] `normalizeMediaUrl()` procesa las URLs correctamente
- [ ] Network tab muestra que las imágenes cargan con Status 200
- [ ] No hay errores de CORS en la consola

## 🆘 Si Nada Funciona

Si después de verificar todo lo anterior el problema persiste:

1. **Verifica que el problema sea solo de imágenes:**
   - ¿El texto se muestra correctamente? → SÍ ✅
   - ¿Los demás módulos funcionan? → Verificar

2. **Prueba con una imagen de URL externa temporal:**
   - Edita un billboard en el admin
   - En lugar de subir archivo, pega directamente en `media_url`: `https://picsum.photos/1920/1080`
   - Guarda y verifica si se muestra en Hero
   - Si se muestra → El problema es con el sistema de upload
   - Si no se muestra → El problema es con Hero.jsx

3. **Compara con el módulo de Anuncios (que funciona):**
   - Ve a Anuncios y sube una imagen
   - Observa los logs
   - Compara con los logs de Billboards
   - Identifica diferencias

## 📞 Información para Soporte

Si necesitas ayuda, proporciona esta información:

1. **Logs del Backend al subir una imagen**
2. **Logs de la Consola del Frontend al subir**
3. **Logs de la Consola del Frontend al cargar Hero**
4. **Screenshot de la Network tab mostrando las requests de imágenes**
5. **Variables de entorno configuradas (sin mostrar valores sensibles):**
   - CLOUDINARY_URL: ✅ configurado / ❌ no configurado
   - API_BASE_URL: `valor` / ❌ no configurado
   - VITE_API_URL: `valor`

---

**Última actualización:** Sistema de logs agregado para diagnóstico completo
**Archivos modificados:**
- `backend/src/billboards/billboards.admin.controller.ts`
- `frontend/src/components/AdminBillboard.jsx`
- `frontend/src/react-ui/components/Hero.jsx`
