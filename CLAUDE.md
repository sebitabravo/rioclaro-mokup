# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development Scripts
- `pnpm dev` - Start development server (http://localhost:5173)
- `pnpm build` - Build for production (runs TypeScript check + Vite build)
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint on TypeScript/TSX files with max 0 warnings

### Testing Commands
#### Unit Tests (Vitest)
- `pnpm test` - Run Vitest unit tests in watch mode
- `pnpm test:run` - Run Vitest unit tests once
- `pnpm test:unit` - Run only unit tests (recommended for development)
- `pnpm test:coverage` - Run unit tests with coverage report

#### E2E Tests (Playwright)
- `pnpm test:e2e` - Run Playwright end-to-end tests
- `pnpm test:e2e:ui` - Run Playwright tests with UI mode
- `pnpm test:e2e:headed` - Run Playwright tests in headed mode (visible browser)

#### Complete Testing
- `pnpm test:full` - Run ALL tests (unit + e2e) sequentially
- `pnpm test:full:parallel` - Run ALL tests (unit + e2e) in parallel (faster)

### Key Development Tasks
- **Run development server**: `pnpm dev`
- **Type checking**: TypeScript compilation is included in build process
- **Linting**: `pnpm lint` (enforces React hooks rules and React refresh)
- **Production build**: `pnpm build` (includes TypeScript compilation)
- **Quick Testing**: `pnpm test:unit` (Vitest tests for components and services)
- **Complete Testing**: `pnpm test:full` (All tests - unit + e2e)
- **E2E Testing**: `pnpm test:e2e` (Playwright tests configured for http://localhost:5173)

## Architecture Overview

This is a **Clean Architecture** React application for river water level monitoring, built with **Vite + React 19 + TypeScript**.

### Core Architecture Layers

```
src/
├── domain/           # Business entities and repository interfaces
├── application/      # Use cases and business logic
├── infrastructure/   # External adapters and DI container
├── presentation/     # React components, pages, and Zustand stores
├── features/         # Feature-based modules (dashboard, reports, admin, activity)
└── shared/          # Cross-cutting utilities and services
```

### Key Architectural Patterns

**Dependency Injection Container**: All dependencies are managed through `src/infrastructure/di/Container.ts`. This singleton provides access to all use cases and abstracts repository implementations.

**Repository Pattern**: Domain defines interfaces, infrastructure provides implementations (Mock for development, API for production).

**Data Normalization Service**: `src/shared/services/DataNormalizationService.ts` enables changing data sources without modifying components by normalizing different data formats to a consistent interface.

**Use Case Pattern**: Business logic is encapsulated in use cases located in `src/application/use-cases/`, organized by feature (station, measurement, alert, report, user).

### State Management
- **Zustand stores** in `src/features/[feature]/stores/` manage feature-specific UI state
- Global shared state in `src/shared/contexts/` (ThemeContext for dark/light mode)
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
- **Framer Motion** for animations
- **Class Variance Authority** for component variants

### Development Tools
- **ESLint 9.15** with TypeScript, React hooks, and React refresh rules (max 0 warnings enforced)
- **PostCSS** with Autoprefixer
- **Tailwind CSS** with animations and custom government color variables
- **Playwright 1.55** for cross-browser E2E testing (Chrome, Firefox, Safari)

### Export & Reporting
- **jsPDF** and **jsPDF-autotable** for PDF generation
- **XLSX** for Excel export functionality

## File Organization Patterns

### Component Structure
- `src/shared/components/ui/` - Base reusable components (Radix UI + shadcn/ui)
- `src/shared/components/layout/` - Layout components (Navbar)
- `src/features/[feature]/components/` - Feature-specific components organized by domain
- `src/features/dashboard/components/` - Dashboard-specific components (MetricsDashboard, StationsMap)
- `src/features/reports/components/` - Report components (NormalizedChart, MetricChart)
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
6. Create Zustand store in `src/features/[feature]/stores/`
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
- `vite.config.ts` - Path aliases configured for clean imports (@domain, @application, etc.)
- `tailwind.config.js` - Custom government theme colors and animations
- `docs/ARCHITECTURE.md` - Detailed architecture documentation
- `docs/DEVELOPMENT_GUIDE.md` - Comprehensive development patterns and examples

## Code Style & Conventions

- TypeScript strict mode enabled
- ESLint enforces React hooks rules and component refresh patterns
- Path aliases: Use `@domain`, `@application`, `@infrastructure`, `@presentation`, `@shared`, `@features` for imports
- Tailwind CSS for styling with custom government color variables (gov-primary, gov-secondary, etc.)
- Clean Architecture principles with clear layer separation
- Repository pattern with dependency injection
- Framer Motion for animations with cross-browser compatibility optimizations

## Package Manager

This project uses **pnpm** as the package manager. All installation commands should use `pnpm` instead of `npm`:
- `pnpm install` - Install dependencies
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm test` - Run tests