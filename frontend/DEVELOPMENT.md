# 🛠️ Guía de Desarrollo - OASIS Project

## Configuración Inicial del Entorno

### 1. Clonar Repositorio
```bash
git clone https://github.com/tu-usuario/oasis-project.git
cd oasis-project
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno
```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tus credenciales de Supabase
# VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
# VITE_SUPABASE_ANON_KEY=tu-clave-anonima
```

### 4. Iniciar Servidor de Desarrollo
```bash
npm run dev
```

## 👨‍💻 Estándares de Código

### Nomenclatura
- **Variables/Funciones**: `camelCase`
- **Clases**: `PascalCase`
- **Constantes**: `UPPER_SNAKE_CASE`
- **Archivos**: `kebab-case.js` o `moduleName.js`

### Imports
```javascript
// ✅ CORRECTO - Importar un módulo
import { misFunciones } from '../path/modulo.js';

// ✅ CORRECTO - Module por defecto
import Modulo from '../path/modulo.js';

// ❌ EVITAR - Imports circulares o rutas relativas excesivas
```

### JSDoc
Documenta todas las funciones públicas:

```javascript
/**
 * Obtiene el perfil del usuario actual
 * @param {string} userId - ID del usuario a consultar
 * @param {Object} options - Opciones adicionales
 * @param {boolean} options.includeRole - Incluir rol del usuario
 * @returns {Promise<Object>} Datos del perfil del usuario
 * @throws {Error} Si el usuario no existe
 */
export async function getUserProfile(userId, options = {}) {
  // ...
}
```

### Manejo de Errores
Siempre usa el `errorHandler` centralizado:

```javascript
import { handleError, showAlert, logEvent } from '../common/errorHandler.js';

try {
  // tu código aquí
  await misFuncion();
  logEvent('success_event', { data: 'info' });
} catch (error) {
  const result = handleError(error, 'misFuncion');
  showAlert(containerElement, result.message, 'danger');
}
```

### Validación de Formularios
```javascript
import { validateForm } from '../common/errorHandler.js';

const form = document.getElementById('mi-formulario');
const validation = validateForm(form);

if (!validation.success) {
  // Mostrar errores
  showAlert(statusArea, Object.values(validation.errors).join(', '), 'danger');
  return;
}

const { nombreCampo } = validation.data;
```

## 📁 Estructura de Módulos

Cada módulo debe exportar `render` e `init`:

```javascript
// src/modules/miModulo.js
import { supabase } from '../common/supabaseClient.js';
import { handleError, logEvent } from '../common/errorHandler.js';

/**
 * Renderiza el HTML del módulo
 * @returns {Promise<string>} HTML del módulo
 */
export async function renderMiModulo() {
  return `
    <div class="mi-modulo">
      <!-- HTML aquí -->
    </div>
  `;
}

/**
 * Inicializa la lógica del módulo
 */
export async function initMiModulo() {
  // Lógica aquí
}
```

## 🔒 Seguridad

### Input Validation
```javascript
import { sanitizeHTML, validateForm } from '../common/errorHandler.js';

// Sanitizar datos de usuario
const nombreSeguro = sanitizeHTML(datosUsuario.nombre);

// Validar formulario
const validation = validateForm(form);
if (!validation.success) {
  // Manejar errores
}
```

### Protección de Rutas
Las rutas protegidas se validan en `main.js`:

```javascript
const protectedRoutes = ['admin', 'usuarios'];
if (protectedRoutes.includes(hash) && this.userRole !== 'admin') {
  window.location.hash = '#home';
  return;
}
```

### Variables de Entorno
- Nunca commitear `.env` con credenciales reales
- Usar `.env.example` para documentar variables
- En producción, usar secrets del proveedor (GitHub, Vercel, etc)

## 🧪 Testing (Próximo)

Ejemplo de test con Vitest:

```javascript
// __tests__/errorHandler.test.js
import { describe, it, expect } from 'vitest';
import { validateForm, sanitizeHTML } from '../src/common/errorHandler.js';

describe('errorHandler', () => {
  it('should sanitize HTML', () => {
    const dangerous = '<script>alert("xss")</script>';
    const safe = sanitizeHTML(dangerous);
    expect(safe).not.toContain('<script>');
  });
});
```

Ejecutar tests:
```bash
npm run test
```

## 🔍 Linting y Formato

### ESLint
Verifica y arregla errores de código:

```bash
# Verificar
npm run lint

# Arreglar automáticamente
npm run lint
```

### Prettier
Formatea código automáticamente:

```bash
npm run format
```

### Commitear
Siempre lint antes de hacer commit:

```bash
npm run lint
npm run format
git add .
git commit -m "feat: descripción del cambio"
```

## 🚀 Build y Deployment

### Build para Producción
```bash
npm run build
```

Genera carpeta `dist/` con archivos optimizados.

### Preview Local
```bash
npm run preview
```

Prueba la build de producción localmente.

### Deploy (Ejemplo con Vercel)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## 📊 Debugging

### Debug Console
```javascript
import { debugLog, logEvent } from '../common/errorHandler.js';

debugLog('Mensaje de debug', { datos: 'adicionales' });
logEvent('nombre_evento', { información: 'relevante' });
```

### Debug en Browser
- Abre DevTools (F12)
- Busca logs en Console
- Usa breakpoints en Sources

## 🔗 Recursos Útiles

- [Supabase Docs](https://supabase.com/docs)
- [Bootstrap 5](https://getbootstrap.com/docs/5.0/)
- [Vite Guide](https://vitejs.dev/)
- [JavaScript.info](https://javascript.info/)
- [MDN Web Docs](https://developer.mozilla.org/)

## 📞 Soporte

- Issues: GitHub Issues
- Discussiones: GitHub Discussions
- Email: soporte@oasis.local

---

**Última actualización**: Febrero 2026  
**Versión**: 1.3.0
