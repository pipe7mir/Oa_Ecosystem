# ✅ VARIABLES DE RAILWAY - CHECKLIST

## Variables que DEBES TENER en Railway:

Haz click en "+ New Variable" y agrega cada una de estas si no existe:

```
APP_NAME=Oasis
```

```
APP_ENV=production
```

```
APP_DEBUG=false
```

```
APP_URL=${{RAILWAY_PUBLIC_DOMAIN}}
```

```
DB_CONNECTION=mysql
```

```
DB_HOST=gondola.proxy.rlwy.net
```

```
DB_PORT=32192
```

```
DB_DATABASE=railway
```

```
DB_USERNAME=root
```

```
DB_PASSWORD=OuxGyqhyFrfNOpRaIJmIRvfaJjexvOkx
```

```
CORS_ALLOWED_ORIGINS=*
```

---

## ✅ APP_KEY - Ya la tienes (con *******)

---

## DESPUÉS DE AGREGAR VARIABLES:

1. Ve a la pestaña "Deployments"
2. Haz click en el menú "..." del último deployment
3. Click en "Redeploy"
4. Espera 2-3 minutos
5. **COPIA LA URL PÚBLICA** (la necesitas para Vercel)

---

## Cómo obtener la URL pública:

En Railway, ve a:
- Settings → Domains → Generate Domain (si no tienes)
- O copia la URL que aparece en la parte superior del dashboard

Ejemplo:
```
https://igecosystem-production.up.railway.app
```

**Guarda esta URL para el siguiente paso (Vercel)**
