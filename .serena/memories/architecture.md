# Clean Architecture - Estructura del Proyecto

## Estructura de Carpetas
```
src/
├── domain/           # Entidades de negocio y contratos
│   ├── entities/     # User, Station, Measurement, Alert, Report, ActivityLog
│   └── repositories/ # Interfaces de repositorios
├── application/      # Casos de uso y lógica de aplicación
│   └── use-cases/    # GenerateReports, GetMeasurements, GetStations, ManageUsers
├── infrastructure/   # Adaptadores e implementaciones
│   ├── adapters/     # Mock y API repositories, ApiClient
│   └── di/          # Container para inyección de dependencias
├── presentation/     # UI, componentes React y stores
│   ├── components/   # UI components (charts, layout, maps, ui)
│   ├── pages/       # Páginas principales
│   └── stores/      # Estado global con Zustand
├── shared/          # Utilidades y servicios compartidos
│   ├── components/  # MotionWrapper components
│   ├── contexts/    # ThemeContext
│   ├── hooks/       # Custom hooks
│   ├── services/    # DataNormalization, Export, ReportActivity
│   ├── types/       # Type definitions
│   └── utils/       # Utility functions
└── examples/        # Ejemplos de uso y documentación
```

## Principios de la Arquitectura
- **Inversión de dependencias**: Las capas internas no dependen de las externas
- **Separación de responsabilidades**: Cada capa tiene un propósito específico
- **Testabilidad**: Fácil testing mediante inyección de dependencias
- **Escalabilidad**: Estructura modular que facilita el crecimiento

## Flujo de Datos
1. **Presentation** → llama a casos de uso
2. **Application** → ejecuta lógica de negocio
3. **Domain** → define entidades y contratos
4. **Infrastructure** → implementa repositorios y servicios externos