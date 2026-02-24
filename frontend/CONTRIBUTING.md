# 🤝 Guía de Contribución - OASIS Project

Gracias por tu interés en contribuir al proyecto OASIS. Esta guía te ayudará a entender nuestro proceso de desarrollo.

## 📋 Código de Conducta

Ser respetuoso, inclusivo y colaborativo. No toleramos discriminación, acoso o comportamiento ofensivo.

## 🚀 Comenzar

### 1. Fork el Repositorio
```bash
# En GitHub, haz clic en "Fork"
```

### 2. Clonar tu Fork
```bash
git clone https://github.com/tu-usuario/oasis-project.git
cd oasis-project
```

### 3. Crear Rama de Feature
```bash
git checkout -b feature/mi-nueva-feature
# O para bug fixes:
git checkout -b fix/corregir-bug
```

### 4. Instalar Dependencias
```bash
npm install
```

### 5. Crear tu Feature

```bash
# Inicia servidor de desarrollo
npm run dev

# En otra terminal, ejecuta linting
npm run lint -- --watch
```

## 📝 Estándares de Código

### Naming Conventions
- Variables/funciones: `miVariable`, `miFunction()`
- Clases: `MiClase`
- Constantes: `MI_CONSTANTE`
- Archivos: `miModulo.js` o `mi-modulo.js`

### JSDoc
Todas las funciones públicas deben tener JSDoc:

```javascript
/**
 * Descripción breve de qué hace
 * 
 * Descripción larga si es necesario (opcional)
 * 
 * @param {type} paramName - Descripción del parámetro
 * @returns {type} Descripción del retorno
 * @throws {ErrorType} Descripción del error
 * @example
 * miFunction('valor')
 */
export function miFunction(paramName) {
  //...
}
```

### Linting
```bash
# Verificar errores
npm run lint

# Arreglar automáticamente
npm run lint

# Formatea el código
npm run format
```

### Commits
```bash
# Buen commit message
git commit -m "feat: agregar validación de email"
git commit -m "fix: corregir debounce en búsqueda"
git commit -m "docs: actualizar README"
git commit -m "style: aplicar prettier"

# Malo
git commit -m "cambios varios"
git commit -m "actualizado"
```

**Formato recomendado:**
```
<tipo>(<scope>): <descripción>

<cuerpo - opcional>

<footer - opcional>
```

Tipos:
- `feat`: Nueva feature
- `fix`: Bug fix
- `docs`: Documentación
- `style`: Formateo (no cambía funcionalidad)
- `refactor`: Refactor de código
- `perf`: Mejora de performance
- `test`: Agregar/actualizar tests
- `chore`: Cambios en build, deps, etc

## 🧪 Testing

### Ejecutar Tests
```bash
npm run test
```

### Escribir Tests
```javascript
// __tests__/miModulo.test.js
import { describe, it, expect } from 'vitest';
import { miFunction } from '../src/miModulo.js';

describe('miFunction', () => {
  it('debe retornar el valor esperado', () => {
    const result = miFunction('input');
    expect(result).toBe('expected');
  });

  it('debe lanzar error con input inválido', () => {
    expect(() => miFunction(null)).toThrow();
  });
});
```

**Coverage mínimo requerido: 70%**

## 🔄 Pull Request (PR)

### 1. Antes de Enviar PR

```bash
# Actualizar rama con main
git fetch origin
git rebase origin/main

# Ejecutar tests y linting
npm run test
npm run lint
npm run format

# Verificar que la app funcione
npm run dev
```

### 2. Crear PR

**Título:**
- Sigue el formato de commits
- Claro y descriptivo

**Descripción:**
```markdown
## Descripción
Breve descripción de los cambios

## Tipo de Cambio
- [ ] Nueva feature
- [ ] Bug fix
- [ ] Breaking change
- [ ] Documentación

## Relacionado a
Closes #<issue-number>

## Screenshots (si corresponde)
Adjunta imágenes si es UI change

## Checklist
- [ ] Mi código sigue los estándares
- [ ] He actualizado la documentación
- [ ] He agregado tests
- [ ] Los tests pasan
- [ ] No hay breaking changes
```

### 3. Revisión de Código

- Espera revisión de al menos un reviewer
- Responde a comentarios constructivamente
- Realiza cambios solicitados
- Haz rebasing si hay conflictos

### 4. Merge

Una vez aprobado, el maintainer realizará el merge.

## 📂 Estructura de Directorios

```
src/
├── auth/                  # Autenticación
│   ├── auth.js
│   └── authService.js
├── modules/               # Módulos de negocio
│   ├── home.js
│   ├── admin.js
│   └── usuarios.js
├── common/                # Código compartido
│   ├── supabaseClient.js
│   ├── errorHandler.js
│   └── styles.css
└── styles/                # Hojas de estilo
```

## 🎯 Tipos de Contribución

### 🐛 Reportar Bugs

1. Verifica si el bug ya existe
2. Abre un issue con:
   - Título claro
   - Pasos para reproducir
   - Comportamiento esperado
   - Capturas de pantalla si aplica

```markdown
## Descripción
El formulario de login no valida emails

## Pasos para Reproducir
1. Ir a página de login
2. Escribir email "invalido"
3. Enviar formulario
4. No muestra error

## Comportamiento Esperado
Debe mostrar error "Email no válido"

## Entorno
- Browser: Chrome 120
- OS: Windows 10
- Versión: 1.3.0
```

### ✨ Sugerir Features

1. Abre una discussion o issue
2. Describe la feature claramente
3. Explica el beneficio

```markdown
## Feature Request: Modo Oscuro

### Descripción
Agregar soporte para modo oscuro

### Beneficio
Mejor experiencia visual en ambientes oscuros
Menor consumo de batería en dispositivos OLED

### Propuesta
Usar variable CSS `--dark-mode` toggle
```

### 📚 Mejorar Documentación

- Actualizar README si hay cambios
- Agregar ejemplos de código
- Corregir typos
- Mejorar claridad de instrucciones

## 🚫 Issues Cerrados Sin PR

Los issues pueden cerrarse si:
- No tienen respuesta después de 30 días
- Son duplicados
- No cumplen con la guía

## 📖 Recursos

- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Keep a Changelog](https://keepachangelog.com/)

## 🏅 Reconocimiento

Aunque seas el primer contribuidor, siempre reconocemos a nuestros contribuidores en:
- README (sección Contributors)
- CHANGELOG (si tiene impacto significativo)
- Release notes

## 📞 Contacto

- Issues: GitHub Issues
- Discussions: GitHub Discussions
- Email: soporte@oasis.local

---

¡Gracias por contribuir a OASIS! 🎉

**Última actualización**: Febrero 2026  
**Versión**: 1.3.0
