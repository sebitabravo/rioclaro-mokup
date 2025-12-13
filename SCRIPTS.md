# Scripts Reference - RíoClaro

## Overview

Este proyecto usa **Makefile** y **npm scripts** para automatizar tareas comunes. No hay scripts `.sh` sueltos.

## Quick Start

```bash
# Levantar Docker
make docker-up

# Ejecutar tests
make test-full

# Ver logs
make docker-logs
```

## Makefile Commands

Ejecuta `make help` para ver todos los comandos disponibles.

### Docker Management

```bash
make docker-up          # Inicia todos los servicios
make docker-down        # Detiene todos los servicios
make docker-logs        # Muestra logs en tiempo real
make docker-build       # Construye imágenes Docker
make docker-rebuild     # Reconstruye sin cache
make docker-ps          # Muestra contenedores activos
make docker-restart     # Reinicia servicios
make clean              # Elimina contenedores y volúmenes
```

### Testing

```bash
make test               # Ejecuta todos los tests
make test-unit          # Solo tests unitarios
make test-e2e           # Solo tests E2E (Playwright)
make test-full          # Tests unitarios + E2E secuencialmente
```

### Code Quality

```bash
make lint               # Ejecuta ESLint
make security-check     # Lint + coverage
```

## NPM Scripts

Ejecuta con `pnpm <script>` o `npm run <script>`.

### Development

```bash
pnpm dev                # Inicia servidor de desarrollo (Vite)
pnpm build              # Build para producción
pnpm preview            # Preview del build
```

### Testing

```bash
pnpm test               # Vitest en modo watch
pnpm test:run           # Vitest una sola vez
pnpm test:ui            # Vitest con UI
pnpm test:coverage      # Vitest con coverage
pnpm test:unit          # Solo tests unitarios
pnpm test:e2e           # Playwright E2E tests
pnpm test:e2e:ui        # Playwright con UI
pnpm test:e2e:headed    # Playwright con navegador visible
pnpm test:full          # Todos los tests
```

### Docker

```bash
pnpm docker:up          # docker-compose up -d
pnpm docker:down        # docker-compose down
pnpm docker:logs        # docker-compose logs -f
pnpm docker:build       # docker-compose build
pnpm docker:rebuild     # docker-compose build --no-cache
pnpm docker:ps          # docker-compose ps
pnpm docker:restart     # docker-compose restart
```

### Code Quality

```bash
pnpm lint               # ESLint
pnpm security:check     # Lint + coverage
```

## Workflow Típico

### Desarrollo Local

```bash
# 1. Levantar servicios
make docker-up

# 2. Esperar a que estén listos
make docker-ps

# 3. Ejecutar tests
make test-full

# 4. Ver logs si hay problemas
make docker-logs

# 5. Detener cuando termines
make docker-down
```

### Antes de Commit

```bash
# Verificar código
pnpm lint

# Ejecutar tests
pnpm test:full

# O usar el comando de seguridad
make security-check
```

### Deploy

```bash
# Build
pnpm build

# Rebuild Docker images
make docker-rebuild

# Levantar en producción
make docker-up
```

## Notas

- **Makefile** es más legible y tiene colores en la salida
- **npm scripts** son más portátiles (funcionan en Windows)
- Usa `make` si estás en macOS/Linux
- Usa `pnpm` si necesitas portabilidad o estás en Windows

## Troubleshooting

### Docker no inicia

```bash
# Verificar que Docker está corriendo
make docker-ps

# Ver logs detallados
make docker-logs

# Reconstruir desde cero
make clean
make docker-rebuild
make docker-up
```

### Tests fallan

```bash
# Ejecutar con más detalle
pnpm test:run

# Ver coverage
pnpm test:coverage

# E2E con navegador visible
pnpm test:e2e:headed
```
