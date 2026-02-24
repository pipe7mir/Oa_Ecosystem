# 🔒 Guía de Seguridad - OASIS Project

## Aspectos de Seguridad Implementados

### 1️⃣ Validación de Entrada

#### Para Formularios
El sistema valida automáticamente:
- **Campos requeridos** (no pueden estar vacíos)
- **Email** (formato válido de email)
- **Contraseña** (mínimo 6 caracteres)
- **Teléfono** (solo números, símbolos válidos)
- **URL** (URLs válidas)

```javascript
import { validateForm } from './src/common/errorHandler.js';

const validation = validateForm(form);
if (!validation.success) {
  // Manejar errores de validación
}
```

#### Para Datos de Usuario
Todos los datos se sanitizan para prevenir XSS:

```javascript
import { sanitizeHTML } from './src/common/errorHandler.js';

const nombreSeguro = sanitizeHTML(datosDelUsuario.nombre);
```

### 2️⃣ Prevención de XSS (Cross-Site Scripting)

**¿Qué es?** Inyección de código JavaScript malicioso a través de entrada de usuario.

**Cómo prevenimos:**
- Sanitización de HTML con `sanitizeHTML()`
- Uso de `textContent` en lugar de `innerHTML` cuando sea posible
- Content Security Policy (CSP) recomendada en servidor

```javascript
// ❌ INSEGURO
element.innerHTML = userInput; // ¡NO HAGAS ESTO!

// ✅ SEGURO
const safe = sanitizeHTML(userInput);
element.innerHTML = safe;
```

### 3️⃣ Autenticación Segura

#### Supabase Auth
- Basada en JWT (JSON Web Tokens)
- Tokens con expiración automática
- Refresh tokens para renovación
- Gestión segura de contraseñas

#### Mejores Prácticas
```javascript
// ✅ Login seguro
const { data: profile } = await supabase
  .from('profiles')
  .select('email, is_approved')
  .ilike('username', usuario)
  .single();

const { error } = await supabase.auth.signInWithPassword({
  email: profile.email,
  password: contraseña
});

// Nunca almacenar contraseñas
// Nunca enviar contraseñas a la consola
```

### 4️⃣ Protección de Rutas

Las rutas protegidas se validan en `main.js`:

```javascript
const protectedRoutes = ['admin', 'usuarios'];
if (protectedRoutes.includes(hash) && this.userRole !== 'admin') {
  window.location.hash = '#home';
  return;
}
```

### 5️⃣ Variables de Entorno

**Archivos sensibles que NUNCA deben ser commiteados:**
- `.env` (credenciales reales)
- `.env.local`
- Archivos con claves privadas

**Archivo `.env.example`:**
- Documenta todas las variables necesarias
- Usa valores de ejemplo
- Se puede commitear sin problemas

**Uso correcto:**
```bash
# .env (en .gitignore)
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-real-aqui

# .env.example (en git)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 6️⃣ Gestión de Errores Segura

**En Desarrollo (DEV):**
- Se muestran detalles completos de errores
- Logs detallados en consola

**En Producción (PROD):**
- Se ocultan detalles técnicos al usuario
- Se muestran mensajes amigables
- Se pueden enviar a servicio de logging

```javascript
import { handleError } from './src/common/errorHandler.js';

try {
  await miOperacion();
} catch (error) {
  const result = handleError(error, 'miOperacion');
  // result.message es seguro para mostrar al usuario
  // result.rawError solo está disponible en desarrollo
}
```

### 7️⃣ Seguridad en Base de Datos (Supabase)

#### Row Level Security (RLS)
- Habilitar RLS en todas las tablas
- Crear policies por rol
- Cada usuario solo ve sus datos

**Ejemplo de Policy:**
```sql
-- Usuarios solo ven su propio perfil
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Solo admins pueden modificar
CREATE POLICY "Admins can update any profile"
ON profiles FOR UPDATE
USING (auth.jwt() ->> 'role' = 'admin');
```

#### Validación en BD
- Agregar constraints
- Crear triggers para audit
- Validar tipos de datos
- Limitar longitud de strings

### 8️⃣ Seguridad en Comunidaciones (HTTPS/SSL)

**En Producción:**
- Usar HTTPS siempre
- Certificados SSL válidos
- HSTS headers habilitados
- Redireccionar HTTP → HTTPS

**Headers de Seguridad Recomendados:**
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Content-Security-Policy: default-src 'self'
X-XSS-Protection: 1; mode=block
```

### 9️⃣ Auditoría y Logging

Todos los eventos importantes se registran:

```javascript
import { logEvent } from './src/common/errorHandler.js';

// Loguear eventos importantes
logEvent('user_login', { username, timestamp: new Date() });
logEvent('admin_action', { action: 'user_deleted', userId });
logEvent('error_occurred', { context, message });
```

**Eventos a loguear:**
- Intentos de login (exitosos y fallidos)
- Cambios de roles o permisos
- Acceso a rutas protegidas
- Operaciones administrativas
- Errores críticos

### 🔟 Checklist de Seguridad

**Antes de Deploy a Producción:**

- [ ] `.env` está en `.gitignore`
- [ ] No hay credenciales reales en código
- [ ] HTTPS está habilitado
- [ ] RLS policies están configuradas en Supabase
- [ ] Headers de seguridad están configurados
- [ ] Validación de entrada está en lugar
- [ ] No hay `console.log` con datos sensibles
- [ ] Rate limiting está configurado (servidor)
- [ ] Backups están configurados
- [ ] Monitoreo de seguridad está activo

## 🚨 Vulnerabilidades Comunes a Evitar

### ❌ XSS (Cross-Site Scripting)
```javascript
// MALO
element.innerHTML = userInput;

// BUENO
element.textContent = userInput;
// O
element.innerHTML = sanitizeHTML(userInput);
```

### ❌ SQL Injection
```javascript
// MALO
// Nunca concatenar strings en queries
const query = `SELECT * FROM users WHERE name = '${name}'`;

// BUENO (Supabase lo maneja)
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('name', name);
```

### ❌ Contraseñas Debilitadas
```javascript
// MALO
function validarPassword(pass) {
  return pass.length > 3; // Muy débil
}

// BUENO
function validarPassword(pass) {
  return pass.length >= 8 && /[A-Z]/.test(pass) && /\d/.test(pass);
}
```

### ❌ Exposición de Variables de Entorno
```javascript
// MALO
console.log(import.meta.env.VITE_SUPABASE_KEY); // ¡NO!

// BUENO
// Las variables se usan, pero no se loguean
const { supabase } = initSupabase();
```

## 📚 Recursos Adicionales

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security](https://supabase.com/docs/guides/auth)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [HTTPS Everywhere](https://www.eff.org/https-everywhere)

## 📞 Reporte de Vulnerabilidades

Si encuentras una vulnerabilidad:

1. **NO** la publiques públicamente
2. Envía un email a: `security@oasis.local`
3. Incluye detalles técnicos
4. Espera respuesta en 48 horas

---

**Última actualización**: Febrero 2026  
**Versión**: 1.3.0
