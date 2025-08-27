# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development Scripts
- `npm run dev` - Start development server (http://localhost:5173)
- `npm run build` - Build for production (runs TypeScript check + Vite build)
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint on TypeScript/TSX files with max 0 warnings

### Key Development Tasks
- **Run development server**: `npm run dev`
- **Type checking**: TypeScript compilation is included in build process
- **Linting**: `npm run lint` (enforces React hooks rules and React refresh)
- **Production build**: `npm run build` (includes TypeScript compilation)

## Architecture Overview

This is a **Clean Architecture** React application for river water level monitoring, built with **Vite + React 19 + TypeScript**.

### Core Architecture Layers

```
src/
├── domain/           # Business entities and repository interfaces
├── application/      # Use cases and business logic 
├── infrastructure/   # External adapters and DI container
├── presentation/     # React components, pages, and Zustand stores
└── shared/          # Cross-cutting utilities and services
```

### Key Architectural Patterns

**Dependency Injection Container**: All dependencies are managed through `src/infrastructure/di/Container.ts`. This singleton provides access to all use cases and abstracts repository implementations.

**Repository Pattern**: Domain defines interfaces, infrastructure provides implementations (Mock for development, API for production).

**Data Normalization Service**: `src/shared/services/DataNormalizationService.ts` enables changing data sources without modifying components by normalizing different data formats to a consistent interface.

**Use Case Pattern**: Business logic is encapsulated in use cases located in `src/application/use-cases/`, organized by feature (station, measurement, alert, report, user).

### State Management
- **Zustand stores** in `src/presentation/stores/` manage UI state
- Stores call use cases through the DI Container
- Stores handle loading states and error management

### Development vs Production
Switch between Mock and real API implementations by modifying `src/infrastructure/di/Container.ts` initializeRepositories method. Components and use cases remain unchanged.

## Key Technologies & Dependencies

### Core Stack
- **React 19** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Router DOM** for navigation

### UI Components
- **Radix UI** components (extensive set including accordion, dialog, dropdown, etc.)
- **Lucide React** for icons
- **Recharts** for data visualization
- **React Leaflet** for maps

### Development Tools
- **ESLint** with TypeScript, React hooks, and React refresh rules
- **PostCSS** with Autoprefixer
- **Tailwind CSS** with animations

## File Organization Patterns

### Component Structure
- `src/presentation/components/ui/` - Base reusable components
- `src/presentation/components/layout/` - Layout components (Navbar)
- `src/presentation/components/charts/` - Chart components including NormalizedChart
- `src/presentation/pages/` - Main application pages

### Domain-Driven Structure
- Entities in `src/domain/entities/` (Station, Measurement, Alert, Report, User)
- Repository interfaces in `src/domain/repositories/`
- Use cases grouped by feature in `src/application/use-cases/`

### Infrastructure Layer
- Mock implementations in `src/infrastructure/adapters/Mock*Repository.ts`
- API client in `src/infrastructure/adapters/ApiClient.ts`
- Dependency injection in `src/infrastructure/di/Container.ts`

## Development Workflow

### Adding New Features
1. Define entity in `src/domain/entities/`
2. Create repository interface in `src/domain/repositories/`
3. Implement use cases in `src/application/use-cases/`
4. Create mock repository in `src/infrastructure/adapters/`
5. Register in DI Container
6. Create Zustand store in `src/presentation/stores/`
7. Implement UI components and pages

### Data Source Integration
Use DataNormalizationService to add new data sources:
1. Add new DataSourceType enum value
2. Implement normalization method
3. Use NormalizedChart component with new source type

### Migration to Production
Change repository implementations in DI Container from Mock to API versions. No other code changes required due to clean architecture separation.

## Important Files

- `src/infrastructure/di/Container.ts` - Central dependency injection configuration
- `src/shared/services/DataNormalizationService.ts` - Data source normalization
- `docs/ARCHITECTURE.md` - Detailed architecture documentation
- `docs/DEVELOPMENT_GUIDE.md` - Comprehensive development patterns and examples

## Code Style & Conventions

- TypeScript strict mode enabled
- ESLint enforces React hooks rules and component refresh patterns
- Tailwind CSS for styling with custom government color variables
- Clean Architecture principles with clear layer separation
- Repository pattern with dependency injection