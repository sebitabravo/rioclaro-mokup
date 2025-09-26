# Estilo y Convenciones de Código

## Convenciones de Naming
- **Archivos**: camelCase para archivos TS/TSX (ej: `ThemeContext.tsx`)
- **Componentes**: PascalCase (ej: `WaterMascot`, `MetricChart`)
- **Variables/funciones**: camelCase (ej: `useTheme`, `formatDateTime`)
- **Constantes**: UPPER_SNAKE_CASE (ej: `DATA_SOURCE_TYPE`)
- **Tipos**: PascalCase (ej: `ThemeContextType`, `MetricType`)

## Estructura de Componentes React
```tsx
// 1. Imports
import React from 'react'
import { Type } from 'module'

// 2. Types/Interfaces
interface ComponentProps {
  prop: string
}

// 3. Component
export function Component({ prop }: ComponentProps) {
  // 4. Hooks
  const [state, setState] = useState()
  
  // 5. Handlers
  const handleAction = () => {}
  
  // 6. Render
  return <div>{prop}</div>
}
```

## TypeScript Guidelines
- **Evitar `any`**: Usar tipos específicos o `Record<string, unknown>`
- **Props tipadas**: Siempre definir interfaces para props
- **Type safety**: Usar type guards cuando sea necesario
- **Null checks**: Manejar valores undefined/null explícitamente

## Patrones de Arquitectura
- **Clean Architecture**: Respeto estricto de las capas
- **Dependency Injection**: Usar el Container para dependencias
- **Repository Pattern**: Abstraer acceso a datos
- **Service Layer**: Lógica de negocio en services

## Convenciones de Export
- **Named exports preferidos** sobre default exports
- **Evitar mixed exports**: No mezclar default y named en el mismo archivo
- **Comentarios sobre exports**: Documentar exports complejos

## Patrones de Hooks
- **Custom hooks**: Prefijo `use` (ej: `useTheme`, `useBrowserDetect`)
- **Separación de concerns**: Un hook por responsabilidad
- **Return types**: Tipar claramente los valores de retorno