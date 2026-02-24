# 🚨 DIAGNÓSTICO: 502 Bad Gateway en Railway

## El backend NO está funcionando. Verificar:

### 1. ¿Hiciste REDEPLOY después de agregar las variables?
   - Ve a Railway → Deployments
   - Click en "..." del último deployment
   - Click "Redeploy"
   - **Esto es OBLIGATORIO después de agregar variables**

### 2. Verifica el Root Directory
   - Railway → Settings → Root Directory
   - Debe ser exactamente: `backend`
   - Si no está configurado, agrégalo y redeploy

### 3. Verifica el Start Command
   - Railway → Settings → Start Command
   - Debe ser: `php artisan serve --host=0.0.0.0 --port=$PORT`
   - Si no está, agrégalo y redeploy

### 4. Verifica los Logs de Railway
   - Railway → Deployments → Click en el deployment activo
   - Ve a la pestaña "Logs"
   - **Copia y pégame el último error que veas**

### 5. Verifica que APP_KEY esté completa
   - Railway → Variables
   - APP_KEY debe ser: `base64:/kxrjpud8HBBNfhHdpGwkerC6EsISRCE4SID4/o8lP8=`
   - Si tiene solo `*******`, elimínala y créala de nuevo

---

## 🎯 Acción Inmediata:

1. **Abre Railway Dashboard**
2. **Ve a Settings** y verifica:
   - Root Directory = `backend`
   - Start Command = `php artisan serve --host=0.0.0.0 --port=$PORT`
   
3. **Ve a Deployments** y haz **Redeploy**
4. **Espera 3-4 minutos** (Railway puede tardar)
5. **Mira los Logs** para ver si hay errores

---

## 📋 Checklist de Variables (deben estar TODAS):

- [ ] APP_KEY=base64:/kxrjpud8HBBNfhHdpGwkerC6EsISRCE4SID4/o8lP8=
- [ ] APP_NAME=Oasis
- [ ] APP_ENV=production
- [ ] APP_DEBUG=false
- [ ] APP_URL=https://igecosystem-production.up.railway.app
- [ ] DB_CONNECTION=mysql
- [ ] DB_HOST=gondola.proxy.rlwy.net
- [ ] DB_PORT=32192
- [ ] DB_DATABASE=railway
- [ ] DB_USERNAME=root
- [ ] DB_PASSWORD=OuxGyqhyFrfNOpRaIJmIRvfaJjexvOkx
- [ ] CORS_ALLOWED_ORIGINS=*

---

**Ve a Railway ahora y:**
1. Verifica Root Directory = `backend`
2. Verifica Start Command
3. Haz Redeploy
4. Mira los Logs y dime qué error aparece
