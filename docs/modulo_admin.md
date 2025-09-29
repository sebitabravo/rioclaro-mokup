# Módulo de Administración - Sistema RíoClaro

## Descripción

El módulo de administración proporciona una interfaz visual completa para la gestión de usuarios y estaciones del sistema RíoClaro, reemplazando el Django Admin técnico con una experiencia de usuario moderna y profesional.

## Características Principales

### 🔐 Seguridad y Acceso

- **Acceso Restringido**: Solo usuarios con rol "Administrador" y `is_staff: true`
- **Protección de Rutas**: Implementado a través de `ProtectedRoute` con verificación automática
- **Redirección Automática**: Usuarios no autorizados son redirigidos a `/unauthorized`

### 👥 Gestión de Usuarios

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

### 🗺️ Gestión de Estaciones

#### Funcionalidades CRUD Completas
- **Crear**: Formulario con validación de coordenadas y códigos
- **Leer**: Tabla con información técnica y estados operacionales
- **Actualizar**: Edición de configuración básica
- **Eliminar**: Confirmación con advertencia sobre pérdida de datos

#### Características Técnicas
- **Validación de Coordenadas**: Latitud (-90 a 90), Longitud (-180 a 180)
- **Códigos Únicos**: Formato alfanumérico con guiones
- **Estados Operacionales**: Activa, Mantenimiento, Inactiva
- **Configuración de Umbrales**: Para alertas automáticas
- **Visualización de Niveles**: Con colores según proximidad al umbral

## Arquitectura Técnica

### Estructura de Archivos

```
src/features/admin/
├── components/
│   ├── AdminDashboard.tsx           # Panel principal con navegación
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

### Componentes UI Reutilizables

```
src/shared/components/ui/
├── table.tsx                       # Componentes de tabla (Radix UI)
├── dialog.tsx                      # Modales y diálogos
├── select.tsx                      # Selectores dropdown
└── form components...              # Input, Button, Label, etc.
```

### Clean Architecture Integration

- **Entities**: `User`, `Station` con tipos para Create/Update
- **Repositories**: Interfaces con implementaciones Mock
- **Use Cases**: CRUD operations a través del DI Container
- **Stores**: Zustand para gestión de estado UI
- **Components**: React con TypeScript estricto

## Configuración de Rutas

### Protección Implementada

```tsx
// En App.tsx
<Route
  path="/admin"
  element={
    <ProtectedRoute requiredRoles={['Administrador']} requireStaff={true}>
      <AnimatedRoute><AdminPage /></AnimatedRoute>
    </ProtectedRoute>
  }
/>
```

### Navegación Dinámica

El navbar muestra automáticamente el enlace "Admin" solo para usuarios con rol "Administrador":

```tsx
// En Navbar.tsx
if (userRole === 'Administrador') {
  baseNavigation.push({ name: "Admin", href: "/admin", icon: Users });
}
```

## Validaciones Implementadas

### Usuarios
- **Username**: Mínimo 3 caracteres, único
- **Email**: Formato válido, único
- **Password**: Mínimo 6 caracteres (solo para crear)
- **Nombres**: Campos requeridos
- **Roles**: Validación contra enum permitido

### Estaciones
- **Nombre**: Mínimo 3 caracteres
- **Código**: Formato `[A-Z0-9-]+`, único
- **Coordenadas**: Rangos válidos de latitud/longitud
- **Umbral**: Número positivo válido
- **Estado**: Validación contra enum permitido

## Características de UX/UI

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

### Animaciones
- **Framer Motion**: Transiciones suaves entre páginas
- **Micro-interactions**: Hover effects y estados activos
- **Page Transitions**: Fade in/out optimizado

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

## Mejores Prácticas Implementadas

### Performance
- **Lazy Loading**: Componentes cargados bajo demanda
- **Memoization**: Optimización de re-renders
- **Debounced Search**: Búsqueda eficiente
- **Virtual Loading**: Estados de carga optimizados

### Accesibilidad
- **ARIA Labels**: Descripciones para screen readers
- **Keyboard Navigation**: Navegación completa por teclado
- **Focus Management**: Estados de foco claros
- **Color Contrast**: Cumple estándares WCAG

### Seguridad
- **Input Validation**: Sanitización en frontend y backend
- **Role-based Access**: Verificación en múltiples niveles
- **CSRF Protection**: Headers y tokens apropiados
- **XSS Prevention**: Escape de contenido dinámico

## Testing

### Cobertura Implementada
- **Unit Tests**: Componentes individuales con Vitest
- **Integration Tests**: Flujos completos de CRUD
- **E2E Tests**: Scenarios de usuario con Playwright
- **Accessibility Tests**: Validación con axe-core

### Comandos de Testing
```bash
# Tests unitarios
pnpm test:unit

# Tests E2E específicos para admin
pnpm test:e2e --grep "admin"

# Coverage completo
pnpm test:coverage
```

## Conclusión

El módulo de administración reemplaza exitosamente el Django Admin con una interfaz moderna, segura y extensible que mantiene la arquitectura Clean del proyecto mientras proporciona una experiencia de usuario superior para la gestión del sistema RíoClaro.