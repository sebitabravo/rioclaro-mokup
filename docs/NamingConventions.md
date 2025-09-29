# NAMING CONVENTIONS - PROYECTO RÍO CLARO

## 🎯 ESTÁNDAR OFICIAL

### **REGLA ÚNICA: Todo en camelCase**

#### ✅ CORRECTO:
```typescript
interface Station {
  stationId: number;
  stationName: string;
  currentLevel: number;
  lastMeasurement: string;
  createdAt: string;
  updatedAt: string;
}

type ActivityType =
  | 'userLogin'
  | 'userLogout'
  | 'stationCreated'
  | 'stationUpdated'
  | 'measurementRecorded';
```

#### ❌ INCORRECTO:
```typescript
interface Station {
  station_id: number;     // NO
  station_name: string;   // NO
  current_level: number;  // NO
  last_measurement: string; // NO
}

type ActivityType =
  | 'user_login'    // NO
  | 'station_created'; // NO
```

## 📋 TIPOS DE ARCHIVOS

### **Entidades de Dominio**
- Propiedades: **camelCase**
- Interfaces: **PascalCase**
- Enums: **PascalCase**

### **Componentes React**
- Archivos: **PascalCase** (ej: `DashboardPage.tsx`)
- Props interfaces: **PascalCase** + Props (ej: `DashboardPageProps`)
- Funciones: **camelCase**

### **Servicios y Utils**
- Archivos: **PascalCase** (ej: `MockDataService.ts`)
- Clases: **PascalCase**
- Métodos: **camelCase**

### **Hooks**
- Archivos: **camelCase** (ej: `useDashboardData.ts`)
- Función: **camelCase** comenzando con 'use'

## 🚫 CASOS PROHIBIDOS

❌ **NUNCA** usar snake_case en propiedades
❌ **NUNCA** mezclar convenciones en un archivo
❌ **NUNCA** usar abreviaciones confusas

## 🎯 MIGRACIÓN GRADUAL

**Prioridad 1**: Nuevos archivos deben seguir el estándar
**Prioridad 2**: Al editar archivos existentes, corregir naming
**Prioridad 3**: Refactor masivo cuando sea seguro

---

**Esta es la LEY. Sin excepciones.**