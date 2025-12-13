# Backend Setup - RíoClaro

## Entorno Virtual

El proyecto ya tiene un entorno virtual configurado en `backend/venv/`.

### Activar el entorno virtual:

**En macOS/Linux:**
```bash
cd backend
source venv/bin/activate
```

**En Windows:**
```bash
cd backend
venv\Scripts\activate
```

### Ejecutar el servidor de desarrollo:

```bash
# Activar entorno virtual primero
source venv/bin/activate

# Ejecutar servidor
python manage.py runserver
```

El servidor estará disponible en http://localhost:8000

### Verificar que todo funciona:

```bash
# Check de Django
python manage.py check

# Health endpoint
curl http://localhost:8000/health/
```

## Notas

- La base de datos SQLite ya está configurada y migrada
- El entorno virtual ya tiene Django y las dependencias esenciales instaladas
- Para producción, necesitarás instalar las dependencias adicionales de `requirements.txt`
