# Oa_Ecosystem — Sistema de Control de Iglesia

Aplicación web para la gestión y control de una iglesia. Desarrollada con Python (Flask) y SQLite.

## Características

- **Gestión de Miembros**: Registro completo de feligreses (nombre, contacto, ministerio, estado activo/inactivo).
- **Control de Asistencia**: Registro de asistencia por evento/servicio, marcado individual y masivo.
- **Gestión de Ofrendas**: Registro de diezmos y ofrendas con filtros por fecha y resumen de totales.
- **Gestión de Eventos**: Creación y administración de actividades y servicios de la iglesia.
- **Panel de Control**: Estadísticas rápidas (miembros activos, asistencia del mes, total de ofrendas).

## Requisitos

- Python 3.9+
- pip

## Instalación

```bash
pip install -r requirements.txt
```

## Ejecución

```bash
python app.py
```

La aplicación estará disponible en [http://localhost:5000](http://localhost:5000).

## Variables de Entorno (opcionales)

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `SECRET_KEY` | Clave secreta de Flask | `iglesia-secret-key-dev` |
| `DATABASE_URL` | URL de la base de datos | `sqlite:///iglesia.db` |
| `FLASK_DEBUG` | Modo debug (`1`/`0`) | `0` |

## Tests

```bash
python -m pytest tests/ -v
```

## Estructura del Proyecto

```
├── app.py             # Aplicación Flask y rutas
├── models.py          # Modelos de base de datos
├── extensions.py      # Extensiones Flask (SQLAlchemy)
├── requirements.txt   # Dependencias
├── templates/         # Plantillas HTML (Jinja2 + Bootstrap 5)
│   ├── base.html
│   ├── index.html
│   ├── members/
│   ├── attendance/
│   ├── offerings/
│   └── events/
└── tests/
    └── test_app.py
```
