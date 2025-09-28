# Panel de Administración - Especificaciones Técnicas

## 🎯 Funcionalidades Críticas del Panel Admin

### 1. **Gestión de Usuarios y Permisos**

#### Página: `/admin/usuarios`

```typescript
interface AdminUserPage {
  // Lista de usuarios con filtros
  userList: {
    search: string; // buscar por nombre/email
    filterByRole: 'all' | 'admin' | 'technician' | 'observer';
    filterByStatus: 'all' | 'active' | 'inactive';
  };

  // Formulario de creación/edición
  userForm: {
    name: string;
    email: string;
    role: UserRole;
    assignedStations: Station[];
    modulePermissions: {
      variables: boolean;
      reports: boolean;
      admin: boolean;
      alerts: boolean;
    };
  };
}
```

#### Mockup Visual

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

┌─ Editar Usuario: Juan Pérez ───────────────────────────────────┐
│ Información Personal:                                          │
│ Nombre: [Juan Pérez                        ]                  │
│ Email:  [juan@muni.cl                      ]                  │
│ Rol:    [Técnico ▼]                                          │
│                                                               │
│ Estaciones Asignadas:                                         │
│ ☑️ Estación Río Norte    ⬜ Estación Río Sur                   │
│ ☑️ Estación Central      ⬜ Estación Lago                      │
│                                                               │
│ Permisos por Módulo:                                          │
│ ☑️ Ver Variables        ☑️ Generar Reportes                    │
│ ⬜ Panel Admin          ☑️ Configurar Alertas                  │
│                                                               │
│ [Guardar Cambios] [Cancelar] [Enviar Nueva Contraseña]        │
└────────────────────────────────────────────────────────────────┘
```

### 2. **Configuración Simulador vs Producción**

#### Página: `/admin/configuracion-sistema`

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

#### Mockup Visual

```
┌─ Configuración del Sistema ────────────────────────────────────┐
│ Modo de Operación Actual: 🔧 DESARROLLO                       │
│                                                               │
│ ○ Modo Desarrollo (Simulador Arduino)                        │
│   ├─ Intervalo de datos: [30] segundos                       │
│   ├─ Estaciones simuladas: [3]                               │
│   └─ Estado: 🟢 Simulador Activo (90 mediciones enviadas)     │
│                                                               │
│ ● Modo Producción (Sensores Reales)                          │
│   ┌─ Configuración PLCs ─────────────────────────────────────┐ │
│   │ Estación Norte:                                         │ │
│   │ IP: [192.168.1.100] Puerto: [502] Protocolo: [Modbus▼] │ │
│   │ Estado: 🔴 Desconectado [Test Conexión]                │ │
│   │                                                        │ │
│   │ Estación Sur:                                          │ │
│   │ IP: [192.168.1.101] Puerto: [502] Protocolo: [Modbus▼] │ │
│   │ Estado: 🔴 No configurado [Configurar]                 │ │
│   └────────────────────────────────────────────────────────┘ │
│                                                               │
│ [Aplicar Configuración] [Guardar como Perfil] [Restaurar]     │
└────────────────────────────────────────────────────────────────┘
```

### 3. **Panel de Diagnóstico en Tiempo Real**

#### Página: `/admin/diagnostico`

```typescript
interface SystemDiagnostics {
  systemHealth: {
    overall: 'healthy' | 'warning' | 'critical';
    uptime: number; // seconds
    lastUpdate: Date;
  };

  components: Array<{
    name: string;
    status: 'online' | 'offline' | 'error';
    lastSeen: Date;
    metrics?: {
      cpu?: number;
      memory?: number;
      responseTime?: number;
    };
  }>;

  sensors: Array<{
    stationId: string;
    sensorId: string;
    type: string;
    status: 'active' | 'inactive' | 'error';
    lastReading: Date;
    batteryLevel?: number;
    signalStrength?: number;
  }>;
}
```

#### Mockup Visual

```
┌─ Panel de Diagnóstico ─────────────────────────────────────────┐
│ Estado General del Sistema: 🟢 SALUDABLE                       │
│ Tiempo Activo: 3d 14h 25m    Última Actualización: Hace 5s    │
├────────────────────────────────────────────────────────────────┤
│ Componentes del Sistema:                                       │
│ 🟢 Backend Django     Online    CPU: 15%   RAM: 45%          │
│ 🟢 Base de Datos      Online    Conectado                    │
│ 🟡 Simulador Arduino  Warning   Última conexión: Hace 2m      │
│ 🔴 PLC Estación Norte Offline   Sin respuesta desde 1h        │
├────────────────────────────────────────────────────────────────┤
│ Estado de Sensores:                                            │
│ Estación Norte (Simulador):                                   │
│ ├─ 🟢 Nivel Agua      Activo   Batería: 87%  Señal: 95%      │
│ ├─ 🟢 Temperatura     Activo   Batería: 92%  Señal: 88%      │
│ ├─ 🟡 Turbidez        Warning  Batería: 23%  Señal: 76%      │
│ └─ 🔴 pH              Error    Sin datos desde 30m            │
│                                                               │
│ [Reiniciar Servicios] [Limpiar Logs] [Exportar Diagnóstico]   │
└────────────────────────────────────────────────────────────────┘
```

## 🔧 Implementación Técnica

### Backend (Django)

```python
# views.py
class AdminConfigurationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]

    @action(detail=False, methods=['post'])
    def switch_mode(self, request):
        mode = request.data.get('mode')  # 'simulator' | 'production'
        # Logic to switch between modes
        return Response({'status': 'success', 'mode': mode})

    @action(detail=False, methods=['get'])
    def system_diagnostics(self, request):
        # Return real-time system health
        return Response(diagnostics_data)

# models.py
class SystemConfiguration(models.Model):
    operation_mode = models.CharField(
        max_length=20,
        choices=[('simulator', 'Simulador'), ('production', 'Producción')],
        default='simulator'
    )
    config_data = models.JSONField(default=dict)
    updated_by = models.ForeignKey(User, on_delete=models.CASCADE)
    updated_at = models.DateTimeField(auto_now=True)
```

### Frontend (React)

```typescript
// AdminDashboard.tsx
import { useState, useEffect } from 'react';

interface AdminDashboardProps {}

export const AdminDashboard: React.FC<AdminDashboardProps> = () => {
  const [systemConfig, setSystemConfig] = useState<SystemConfiguration>();
  const [diagnostics, setDiagnostics] = useState<SystemDiagnostics>();

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(fetchDiagnostics, 5000);
    return () => clearInterval(interval);
  }, []);

  const switchOperationMode = async (mode: 'simulator' | 'production') => {
    await adminAPI.switchMode(mode);
    // Show success notification
  };

  return (
    <div className="admin-dashboard">
      <SystemConfigPanel config={systemConfig} onModeSwitch={switchOperationMode} />
      <DiagnosticsPanel diagnostics={diagnostics} />
      <UserManagementPanel />
    </div>
  );
};
```

## 🚀 Plan de Implementación

### Fase 1: Configuración Sistema (8-10 horas)

- [ ] Backend: Model `SystemConfiguration`
- [ ] API endpoints para cambio de modo
- [ ] Frontend: Toggle simulador/producción
- [ ] Persistencia de configuración

### Fase 2: Panel Usuarios (10-12 horas)

- [ ] Backend: User management APIs
- [ ] Frontend: Lista y formularios usuarios
- [ ] Asignación de permisos y estaciones
- [ ] Validaciones y feedback

### Fase 3: Diagnóstico Tiempo Real (6-8 horas)

- [ ] Backend: Health check endpoints
- [ ] Frontend: Dashboard diagnóstico
- [ ] Auto-refresh cada 5 segundos
- [ ] Alertas visuales por estado

## 📱 Consideraciones UX

### Accesibilidad

- Navegación por teclado completa
- Colores para personas daltónicas
- Textos descriptivos para screen readers

### Responsive

- Panel admin responsive para tablets
- Funciones críticas accesibles en móvil
- Navegación simplificada en pantallas pequeñas

### Feedback Visual

- Loading states en todas las operaciones
- Confirmaciones antes de acciones destructivas
- Toast notifications para éxito/error
- Indicadores de estado en tiempo real

Este panel convertirá tu sistema técnico en una herramienta que cualquier administrador municipal puede usar sin problemas! 🚀
