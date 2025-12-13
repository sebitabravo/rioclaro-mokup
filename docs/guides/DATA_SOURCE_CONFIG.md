# Configuración de Fuentes de Datos

El sistema RíoClaro permite trabajar con diferentes fuentes de datos según el entorno y las necesidades de desarrollo.

## Modos Disponibles

### 1. MOCK - Desarrollo sin Backend
**Uso:** Desarrollo frontend sin necesidad de tener el backend corriendo  
**Configuración:**
```bash
# .env.development
VITE_DATA_SOURCE=MOCK
VITE_API_URL=http://localhost:8000  # No se usa, pero debe estar definido
```

**Características:**
- ✅ Datos en memoria generados automáticamente
- ✅ 3 estaciones predefinidas
- ✅ Mediciones generadas en tiempo real
- ✅ No requiere base de datos
- ✅ Ideal para desarrollo de UI

**Cuándo usar:**
- Desarrollo de componentes visuales
- Testing de interfaces
- Demos sin backend
- Desarrollo offline

---

### 2. API - Desarrollo con Backend Local + Simulador

**Uso:** Desarrollo con backend Django y simulador Python generando datos  
**Configuración:**
```bash
# .env.development
VITE_DATA_SOURCE=API
VITE_API_URL=http://localhost:8000
```

**Flujo de datos:**
```
Simulador Python → Django Backend → Base de Datos → Frontend
```

**Pasos para iniciar:**

1. **Iniciar backend:**
   ```bash
   cd backend
   python manage.py runserver
   ```

2. **Iniciar simulador:**
   ```bash
   cd arduino/simulator
   python mock_arduino.py --backend http://localhost:8000 --interval 30
   ```

3. **Iniciar frontend:**
   ```bash
   npm run dev
   ```

**Características:**
- ✅ Datos realistas con patrones temporales
- ✅ Simulación de sensores: turbidez, pH, oxígeno, temperatura, etc.
- ✅ Eventos especiales (lluvias, cambios de flujo)
- ✅ Errores de sensores simulados
- ✅ Ideal para pruebas de integración

**Cuándo usar:**
- Desarrollo de features que requieren backend
- Testing de integración
- Pruebas de reportes y alertas
- Desarrollo de lógica de negocio

---

### 3. API - Producción con Arduino Real

**Uso:** Producción con dispositivos Arduino/PLC reales  
**Configuración:**
```bash
# .env.production
VITE_DATA_SOURCE=API
VITE_API_URL=https://api.rioclaro.com
```

**Flujo de datos:**
```
Arduino/PLC Real → Django Backend → Base de Datos → Frontend
```

**Características:**
- ✅ Datos reales de sensores físicos
- ✅ Alta disponibilidad
- ✅ Alertas en tiempo real
- ✅ Producción

**Cuándo usar:**
- Despliegue en producción
- Operación real del sistema
- Monitoreo de ríos en vivo

---

## Cambio entre Modos

### Opción 1: Variables de Entorno (Recomendado)

Crea archivos `.env.development` y `.env.production` basados en los `.example`:

```bash
# Copiar templates
cp .env.example .env.development
cp .env.production.example .env.production
```

Edita cada archivo según el modo deseado.

### Opción 2: Manual en Container.ts

Si no usas variables de entorno, puedes cambiar manualmente:

```typescript
// src/infrastructure/di/Container.ts
const USE_MOCK = true;  // true = MOCK, false = API
```

⚠️ **No recomendado** - Mejor usar variables de entorno

---

## Configuración del Simulador

El simulador Python acepta varios parámetros:

### Modo Normal
```bash
python mock_arduino.py --backend http://localhost:8000 --interval 30
```

### Modo Test (ráfaga de datos)
```bash
python mock_arduino.py --backend http://localhost:8000 --test-burst 10
```

### Sin simulación de errores
```bash
python mock_arduino.py --backend http://localhost:8000 --no-errors
```

### Con autenticación
```bash
python mock_arduino.py --backend http://localhost:8000 --token YOUR_AUTH_TOKEN
```

### Parámetros disponibles:

| Parámetro | Descripción | Default |
|-----------|-------------|---------|
| `--backend` | URL del backend | `http://localhost:8000` |
| `--interval` | Segundos entre envíos | `30` |
| `--test-burst` | Enviar N mediciones rápido y salir | - |
| `--no-errors` | Desactivar simulación de errores | `false` |
| `--token` | Token de autenticación | - |

---

## Datos Generados por el Simulador

### Sensores Simulados:

1. **Turbidez** (0-1000 NTU)
2. **pH** (0-14)
3. **Oxígeno Disuelto** (0-20 mg/L)
4. **Temperatura del Agua** (-5 a 40°C)
5. **Caudal** (0-1000 m³/s)
6. **Temperatura del Aire** (-10 a 45°C)
7. **Humedad** (0-100%)
8. **Precipitación** (0-200 mm)
9. **Conductividad** (0-5000 µS/cm)
10. **Nitratos** (0-100 mg/L)

### Patrones Temporales:

- **Variación diurna:** Temperatura aumenta durante el día
- **Ruido:** ±10% del valor base
- **Eventos especiales:**
  - Picos de turbidez (2% probabilidad)
  - Lluvia (2% probabilidad)
  - Cambios de caudal (2% probabilidad)

### Metadatos Incluidos:

```json
{
  "device_id": "SENSOR_001",
  "signal_strength": 85,
  "battery_level": 92,
  "calibration_date": "2024-01-15"
}
```

---

## Verificación del Modo Activo

Al iniciar la aplicación, la consola del navegador mostrará:

### Modo MOCK:
```
🎭 Usando repositorios MOCK - Modo desarrollo sin backend
```

### Modo API:
```
🌐 Usando repositorios API - Conectado a http://localhost:8000
```

---

## Troubleshooting

### El frontend no muestra datos

1. **Verificar modo:**
   ```bash
   echo $VITE_DATA_SOURCE
   ```

2. **Si es MOCK:** Debería funcionar siempre
   - Revisar consola del navegador

3. **Si es API:**
   - Verificar que el backend esté corriendo: `curl http://localhost:8000/health/`
   - Verificar que el simulador esté enviando datos
   - Revisar logs del backend: `python manage.py runserver`

### El simulador no envía datos

1. **Verificar que el backend esté corriendo:**
   ```bash
   curl http://localhost:8000/health/
   ```

2. **Verificar que las estaciones existan:**
   ```bash
   curl http://localhost:8000/api/stations/
   ```

3. **Ejecutar en modo verbose:**
   ```bash
   python mock_arduino.py --backend http://localhost:8000 --interval 10
   ```

### Errores de CORS

Si ves errores de CORS:

1. **Backend development:** Verificar `CORS_ALLOWED_ORIGINS` en `.env`
2. **Agregar origen del frontend:**
   ```bash
   CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
   ```

---

## Recomendaciones por Etapa

### Desarrollo Inicial de UI
✅ Usa **MOCK**
- Rápido
- No dependencias
- Datos consistentes

### Desarrollo de Integraciones
✅ Usa **API + Simulador**
- Datos realistas
- Pruebas de alertas
- Testing de reportes

### Testing de Usuario
✅ Usa **API + Simulador**
- Comportamiento similar a producción
- Datos variados
- Eventos especiales

### Staging/QA
✅ Usa **API + Simulador o Arduino Real**
- Validación final
- Performance testing
- Pruebas de carga

### Producción
✅ Usa **API + Arduino Real**
- Datos reales
- Alta disponibilidad
- Monitoreo crítico

---

## Próximos Pasos

1. [ ] Implementar toggle de fuente de datos en Admin Panel
2. [ ] Agregar métricas de calidad de datos del simulador
3. [ ] Crear dashboard de status del simulador
4. [ ] Documentar protocolo de comunicación Arduino → Backend

---

**Última actualización:** Diciembre 2024  
**Mantenido por:** Equipo RíoClaro
