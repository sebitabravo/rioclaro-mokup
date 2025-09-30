# 👨‍💼 Panel de Administración - Sistema RíoClaro

> Interfaz completa para la gestión de usuarios, estaciones y configuración del sistema, reemplazando el Django Admin con una experiencia moderna y profesional.

## 📋 Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Características Principales](#características-principales)
- [Arquitectura Técnica](#arquitectura-técnica)
- [Funcionalidades Detalladas](#funcionalidades-detalladas)
- [Seguridad y Permisos](#seguridad-y-permisos)
- [UX/UI](#uxui)
- [Testing](#testing)

---

## Descripción General

El módulo de administración proporciona una interfaz visual completa para la gestión del sistema RíoClaro con las siguientes capacidades:

- 👥 **Gestión de Usuarios**: CRUD completo con roles y permisos
- 🗺️ **Gestión de Estaciones**: Configuración de estaciones de monitoreo
- ⚙️ **Configuración del Sistema**: Modo simulador vs producción
- 📊 **Analytics**: Estadísticas y métricas del sistema
- 🔐 **Control de Acceso**: Basado en roles con protección multinivel

---

## Características Principales

### 🔐 Seguridad y Acceso

- **Acceso Restringido**: Solo usuarios con rol "Administrador" y `is_staff: true`
- **Protección de Rutas**: Implementado a través de `ProtectedRoute` con verificación automática
- **Redirección Automática**: Usuarios no autorizados son redirigidos a `/unauthorized`
- **Navegación Dinámica**: El enlace "Admin" solo aparece para administradores

```tsx
// Protección de ruta implementada
<Route
  path="/admin"
  element={
    <ProtectedRoute requiredRoles={['Administrador']} requireStaff={true}>
      <AnimatedRoute><AdminPage /></AnimatedRoute>
    </ProtectedRoute>
  }
/>
```

---

## Arquitectura Técnica

### Estructura de Archivos

```
src/features/admin/
├── components/
│   ├── AdminDashboard.tsx           # Panel principal con navegación
│   ├── analytics/
│   │   └── AdminAnalytics.tsx       # Dashboard de estadísticas
│   ├── users/
│   │   ├── UserManagement.tsx       # Gestión completa de usuarios
│   │   ├── UserForm.tsx             # Formulario crear/editar usuarios
│   │   └── DeleteConfirmDialog.tsx  # Confirmación de eliminación
│   └── stations/
│       ├── StationManagement.tsx    # Gestión completa de estaciones
│       └── StationForm.tsx          # Formulario crear/editar estaciones
└── stores/
    ├── UserStore.ts                 # Estado y acciones para usuarios
    └── StationStore.ts              # Estado y acciones para estaciones
```

### Clean Architecture Integration

- **Entities**: `User`, `Station` con tipos para Create/Update
- **Repositories**: Interfaces con implementaciones API
- **Use Cases**: CRUD operations a través del DI Container
- **Stores**: Zustand para gestión de estado UI
- **Components**: React con TypeScript estricto

---

## Funcionalidades Detalladas

### 1. 👥 Gestión de Usuarios

#### Funcionalidades CRUD Completas
- **Crear**: Formulario con validación robusta para nuevos usuarios
- **Leer**: Tabla con información completa y filtros avanzados
- **Actualizar**: Edición de datos existentes (excepto contraseña)
- **Eliminar**: Confirmación antes de eliminación con advertencias claras

#### Características Avanzadas
- **Búsqueda en Tiempo Real**: Por nombre, usuario, email
- **Filtros Dinámicos**: Por rol, estado activo/inactivo
- **Validación Completa**: Email, longitud de campos, unicidad
- **Estados Visuales**: Badges de colores para roles y estados
- **Gestión de Roles**: Administrador, Técnico, Observador

#### Interfaz Visual

```
┌─ Gestión de Usuarios ──────────────────────────────────────────┐
│ [+ Nuevo Usuario]    🔍 [Buscar...]  Rol: [Todos ▼]  Estado: [Todos ▼] │
├────────────────────────────────────────────────────────────────┤
│ Nombre          Email               Rol        Estado    Acciones │
│ Juan Pérez     juan@muni.cl        Técnico    🟢Activo   [✏️][🗑️]  │
│ Ana García     ana@muni.cl         Admin      🟢Activo   [✏️][🗑️]  │
│ Luis Torres    luis@muni.cl        Observador 🔴Inactivo [✏️][🗑️]  │
├────────────────────────────────────────────────────────────────┤
│                                     Página 1 de 3  [◀️][▶️]     │
└────────────────────────────────────────────────────────────────┘
```

#### Formulario de Edición

```typescript
interface UserFormData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'Administrador' | 'Técnico' | 'Observador';
  isActive: boolean;
  assignedStations?: Station[];
  modulePermissions?: {
    variables: boolean;
    reports: boolean;
    admin: boolean;
    alerts: boolean;
  };
}
```

#### Validaciones
- **Username**: Mínimo 3 caracteres, único
- **Email**: Formato válido, único
- **Password**: Mínimo 6 caracteres (solo para crear)
- **Nombres**: Campos requeridos
- **Roles**: Validación contra enum permitido

---

### 2. 🗺️ Gestión de Estaciones

#### Funcionalidades CRUD Completas
- **Crear**: Formulario con validación de coordenadas y códigos
- **Leer**: Tabla con información técnica y estados operacionales
- **Actualizar**: Edición de configuración básica y umbrales
- **Eliminar**: Confirmación con advertencia sobre pérdida de datos

#### Características Técnicas
- **Validación de Coordenadas**: Latitud (-90 a 90), Longitud (-180 a 180)
- **Códigos Únicos**: Formato alfanumérico con guiones
- **Estados Operacionales**: Activa, Mantenimiento, Inactiva
- **Configuración de Umbrales**: Para alertas automáticas
- **Visualización de Niveles**: Con colores según proximidad al umbral

#### Validaciones de Estaciones
- **Nombre**: Mínimo 3 caracteres
- **Código**: Formato `[A-Z0-9-]+`, único
- **Coordenadas**: Rangos válidos de latitud/longitud
- **Umbral**: Número positivo válido
- **Estado**: Validación contra enum permitido

---

### 3. ⚙️ Configuración del Sistema

#### Modo de Operación

```typescript
interface SystemConfiguration {
  operationMode: 'simulator' | 'production';

  simulatorConfig: {
    enabled: boolean;
    dataInterval: number; // segundos
    stationsCount: number;
    sensorsPerStation: number;
  };

  productionConfig: {
    plcConnections: Array<{
      stationId: string;
      ip: string;
      port: number;
      protocol: 'modbus' | 'opcua' | 'ethernet';
      status: 'connected' | 'disconnected' | 'error';
    }>;
  };
}
```

#### Interfaz Visual

```
┌─ Configuración del Sistema ────────────────────────────────────┐
│ Modo de Operación Actual: 🔧 DESARROLLO                       │
│                                                               │
│ ○ Modo Desarrollo (Simulador Arduino)                        │
│   ├─ Intervalo de datos: [30] segundos                       │
│   ├─ Número de estaciones: [5]                               │
│   └─ Sensores por estación: [3]                              │
│                                                               │
│ ● Modo Producción (PLCs Reales)                              │
│   ├─ Estación Norte:  192.168.1.10:502  [🟢 Conectado]      │
│   ├─ Estación Sur:    192.168.1.11:502  [🔴 Error]          │
│   └─ Estación Centro: 192.168.1.12:502  [🟢 Conectado]      │
│                                                               │
│ [Aplicar Cambios] [Reiniciar Conexiones]                     │
└────────────────────────────────────────────────────────────────┘
```

---

### 4. 📊 Analytics Dashboard

El panel de analytics proporciona métricas en tiempo real del sistema:

- **Usuarios Activos**: Cantidad y estadísticas
- **Estaciones Operativas**: Estado y distribución
- **Mediciones del Día**: Volumen de datos procesados
- **Alertas Generadas**: Críticas, warnings, info
- **Performance del Sistema**: Tiempos de respuesta
- **Uso de Recursos**: CPU, memoria, storage

---

## Seguridad y Permisos

### Control de Acceso Multinivel

1. **Verificación de Ruta**: `ProtectedRoute` component
2. **Verificación de Rol**: Solo "Administrador"
3. **Verificación de Staff**: `is_staff: true` requerido
4. **Verificación de Token**: JWT válido y no expirado

### Protecciones Implementadas

```typescript
// Input Validation
- Sanitización de entradas en frontend
- Escape de contenido dinámico (XSS prevention)

// Role-based Access
- Verificación en múltiples niveles
- Middleware de autorización

// CSRF Protection
- Headers y tokens apropiados
- SameSite cookies

// API Security
- Rate limiting por usuario
- Autenticación requerida en todos los endpoints
```

---

## UX/UI

### Design System

- **Tailwind CSS**: Styling consistente con tema gubernamental
- **Radix UI**: Componentes accesibles y profesionales
- **Dark Mode**: Soporte completo automático
- **Responsive**: Diseño adaptativo para móviles

### Feedback Visual

- **Loading States**: Spinners durante operaciones
- **Error Handling**: Mensajes claros de error
- **Success Feedback**: Confirmaciones visuales
- **Empty States**: Mensajes cuando no hay datos
- **Tooltips**: Información contextual en hover

### Animaciones

- **Framer Motion**: Transiciones suaves entre páginas
- **Micro-interactions**: Hover effects y estados activos
- **Page Transitions**: Fade in/out optimizado
- **Loading Skeletons**: Placeholders durante carga

---

## Testing

### Cobertura Implementada

- **Unit Tests**: Componentes individuales con Vitest
- **Integration Tests**: Flujos completos de CRUD
- **E2E Tests**: Scenarios de usuario con Playwright
- **Accessibility Tests**: Validación con axe-core

### Comandos de Testing

```bash
# Tests unitarios del módulo admin
pnpm test:unit src/features/admin

# Tests E2E específicos para admin
pnpm test:e2e --grep "admin"

# Coverage completo
pnpm test:coverage
```

### Scenarios de Testing

```typescript
describe('Admin Panel', () => {
  it('should restrict access to non-admin users');
  it('should allow admin to create new user');
  it('should validate user form inputs');
  it('should filter users by role and status');
  it('should delete user with confirmation');
  it('should create station with valid coordinates');
  it('should prevent duplicate station codes');
});
```

---

## Extensibilidad

### Agregar Nuevas Secciones

1. Crear componente en `src/features/admin/components/`
2. Agregar al array `tabs` en `AdminDashboard.tsx`
3. Implementar store correspondiente si es necesario
4. Configurar use cases y repository en DI Container

### Campos Adicionales

1. Actualizar interfaces en `src/domain/entities/`
2. Modificar formularios correspondientes
3. Actualizar validaciones
4. Ajustar tablas y displays

---

## Mejores Prácticas Implementadas

### Performance
- **Lazy Loading**: Componentes cargados bajo demanda
- **Memoization**: Optimización de re-renders con `React.memo`
- **Debounced Search**: Búsqueda eficiente con debounce de 300ms
- **Virtual Loading**: Estados de carga optimizados

### Accesibilidad
- **ARIA Labels**: Descripciones para screen readers
- **Keyboard Navigation**: Navegación completa por teclado
- **Focus Management**: Estados de foco claros
- **Color Contrast**: Cumple estándares WCAG 2.1 AA

### Code Quality
- **TypeScript Strict**: Tipado completo sin `any`
- **ESLint**: Linting con reglas estrictas
- **Component Organization**: Separación clara de responsabilidades
- **Error Boundaries**: Manejo de errores a nivel de componente

---

## Conclusión

El módulo de administración reemplaza exitosamente el Django Admin con una interfaz moderna, segura y extensible que:

✅ Mantiene la arquitectura Clean del proyecto
✅ Proporciona una experiencia de usuario superior
✅ Implementa seguridad multinivel
✅ Es completamente testeable
✅ Es fácilmente extensible

---

**Última actualización**: 2025-01-15
**Autor**: Sebastian Bravo
**Tags**: #admin #users #stations #configuration #security