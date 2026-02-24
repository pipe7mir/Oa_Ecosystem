# UI Kit (Flat Design 2.0 + Glassmorphism)

Uso rápido:

1. Importa los estilos globales (SCSS) en tu entrada principal (ej. `index.js` o `main.jsx`):

```js
import './ui-kit/design.scss';
```

2. Importa componentes:

```js
import { Navbar, GlassCard, Button } from './ui-kit';
```

Notas:
- Espaciados basados en una grilla de 8px. Usa las clases utilitarias y variables SCSS.
- Tipografías: `Modern Age` para `Logo` y el stack de `-apple-system` para el resto.
- Contenedores principales usan `backdrop-filter: blur(20px)` y fondo rgba(0,0,0,0.1).
