# OASIS Project - Frontend

Instrucciones mínimas para desarrollo del frontend (React + Vite).

Requisitos
- Node.js (v18+ recomendado)
- npm o pnpm

Instalación

```bash
npm ci
```

Desarrollo

```bash
npm run dev
```

Build de producción

```bash
npm run build
```

Quality
- Lint: `npm run lint`
- Formatear: `npm run format`
- Tests: `npm test`

Notas
- `prepare` en `package.json` instala hooks de `husky` (si están presentes).
- Para ejecutar en contenedor usar `docker-compose up --build`.
# 🌴 OASIS Ecosystem v1.3.0

Sistema de gestión integral para la comunidad religiosa OASIS. Plataforma moderna con autenticación segura, panel administrativo y módulos de comunicación.

## 🚀 Características Principales

- ✅ **Autenticación Segura** - Basada en Supabase con validación de roles
- ✅ **Panel Administrativo** - Gestión de usuarios, anuncios y recursos
- ✅ **Módulo de Peticiones** - Sistema de comunicación comunitaria
- ✅ **Cartelera Digital** - Anuncios con proyector en tiempo real
- ✅ **Gestión de Recursos** - Inventario y disponibilidad
- ✅ **Interfaz Responsiva** - Diseño mobile-first con Bootstrap 5

## 📋 Requisitos Previos

- Node.js 16+ 
- npm 8+
- Cuenta Supabase activa
- Git

## ⚙️ Instalación

### 1. Clonar el Repositorio
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
# Obtén las credenciales desde: https://app.supabase.com/
```

Variables de entorno requeridas:
- `VITE_SUPABASE_URL` - URL de tu proyecto Supabase
- `VITE_SUPABASE_ANON_KEY` - Clave anónima del cliente Supabase

### 4. Iniciar Servidor de Desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🏗️ Estructura del Proyecto

```
oasis-project/
├── src/
│   ├── auth/                 # Sistema de autenticación
│   │   ├── auth.js          # Módulo de login/registro
│   │   └── authService.js   # Servicios de auth
│   ├── modules/             # Módulos de negocio
│   │   ├── home.js          # Página principal
│   │   ├── admin.js         # Panel de control
│   │   ├── usuarios.js      # Gestión de usuarios
│   │   ├── recursos.js      # Gestión de recursos
│   │   ├── anuncios.js      # Sistema de anuncios
│   │   ├── peticiones.js    # Módulo de peticiones
│   │   └── solicitudes.js   # Gestión de solicitudes
│   ├── common/              # Código compartido
│   │   ├── supabaseClient.js # Configuración Supabase
│   │   ├── errorHandler.js  # Gestor de errores
│   │   └── styles.css       # Estilos globales
│   ├── styles/              # Hojas de estilo
│   └── img/                 # Imágenes y logos
├── index.html               # HTML principal
├── main.js                  # Punto de entrada
├── package.json             # Dependencias
├── .env.example             # Variables de entorno (ejemplo)
└── vite.config.js           # Configuración Vite
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev                 # Inicia servidor de desarrollo

# Producción
npm run build              # Genera build optimizado
npm run preview            # Vista previa del build

# Calidad de código (próximas versiones)
npm run lint               # Verifica con ESLint
npm run test               # Ejecuta tests
npm run audit              # Auditoría de seguridad
```

## 🔐 Seguridad

### Autenticación
- Basada en Supabase Auth con Email/Contraseña
- Validación de roles (admin/user)
- Tokens JWT con expiración automática
- RLS (Row Level Security) en base de datos

### Validación
- Validación de entrada en formularios (cliente)
- Sanitización HTML para prevenir XSS
- CSRF protection mediante Supabase
- Rate limiting recomendado en servidor

### Mejores Prácticas
- Nunca commitear `.env` (incluido en `.gitignore`)
- Usar variables de entorno para configuración sensible
- Cambiar credenciales de demostración en producción
- Revisar RLS policies en Supabase regularmente

## 📱 Módulos

### 🏠 Home
- Página de bienvenida con hero section
- Acceso rápido a peticiones, recursos y diezmos
- Cartelera digital con anuncios
- Sección de noticias y actualizaciones

### 👥 Usuarios
- Listado de miembros de la comunidad
- Gestión de accesos y roles
- Aprobación de nuevos usuarios
- Filtro y búsqueda de usuarios

### 📢 Anuncios
- Creación y edición de anuncios
- Anuncios con imagen y descripción
- Horarios de eventos
- Proyección en cartelera

### 📝 Peticiones
- Sistema de oración y peticiones comunitarias
- Listado de peticiones activas
- Comentarios y actualizaciones

### 📦 Recursos
- Gestión de inventario
- Disponibilidad de espacios
- Solicitudes de recursos

### ⚙️ Panel Admin
- Centro de control integrado
- Acceso a todos los módulos
- Estadísticas en tiempo real
- Gestión completa del sistema

## 🛠️ Desarrollo

### Agregar un Nuevo Módulo

1. Crear archivo en `src/modules/nuevo-modulo.js`:
```javascript
import { supabase } from '../common/supabaseClient.js';
import { handleError } from '../common/errorHandler.js';

export async function renderNuevoModulo() {
  return `
    <div class="nuevo-modulo animate__animated animate__fadeIn">
      <!-- HTML aquí -->
    </div>
  `;
}

export async function initNuevoModulo() {
  // Lógica de inicialización
}
```

2. Registrar en el router (`main.js`):
```javascript
const routes = {
  'nuevo-modulo': './src/modules/nuevo-modulo.js',
  // ...
};
```

3. Agregar enlace en navegación (`index.html`)

### Estándar de Código

- **Idioma**: JavaScript ES6+ (módulos)
- **Estilos**: CSS + Bootstrap 5 + Custom CSS
- **Nombres**: camelCase para variables, PascalCase para clases
- **Documentación**: JSDoc para funciones públicas
- **Errores**: Usar `handleError()` centralizado

## 📚 Documentación Adicional

- [Supabase Docs](https://supabase.com/docs)
- [Bootstrap 5 Docs](https://getbootstrap.com/docs/5.0/)
- [Vite Docs](https://vitejs.dev/)
- [ES6 Modules](https://javascript.info/modules)

## 🐛 Reporte de Problemas

Para reportar bugs o sugerir mejoras:

1. Abre un issue en GitHub
2. Proporciona pasos para reproducir
3. Incluye screenshots o logs de error
4. Describe el comportamiento esperado

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/mejora`)
3. Commit cambios (`git commit -m 'Agrega mejora'`)
4. Push a la rama (`git push origin feature/mejora`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo licencia MIT. Ver `LICENSE` para detalles.

## 👥 Equipo

- **Desarrollo**: Tu Nombre
- **Diseño UI/UX**: Equipo de Diseño
- **Gestión de Proyecto**: Coordinador

## 📞 Contacto

- Email: soporte@oasis.local
- Teléfono: +1 (XXX) XXX-XXXX
- Web: https://www.oasis.local

---

**Versión**: 1.3.0  
**Última actualización**: Febrero 2026  
**Estado**: En desarrollo activo
