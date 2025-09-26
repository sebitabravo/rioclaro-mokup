# Comandos Esenciales para Desarrollo

## Comandos Core
```bash
# Instalar dependencias
pnpm install

# Modo desarrollo (http://localhost:5173)
pnpm dev

# Construir para producción
pnpm build

# Vista previa de producción
pnpm preview

# Linting (ESLint con max 0 warnings)
pnpm lint
```

## Comandos de Testing
```bash
# Ejecutar tests E2E con Playwright
pnpm test

# Tests con UI mode (interfaz visual)
pnpm test:ui

# Tests en modo headed (navegador visible)
pnpm test:headed
```

## Flujo de Desarrollo Recomendado
1. **Desarrollo activo**: `pnpm dev`
2. **Verificar código**: `pnpm lint`
3. **Testing**: `pnpm test`
4. **Build final**: `pnpm build`
5. **Verificar producción**: `pnpm preview`

## Comandos del Sistema (macOS/Darwin)
```bash
# Navegación
ls -la          # Listar archivos
cd [directorio] # Cambiar directorio
pwd            # Directorio actual

# Búsqueda
find . -name "*.tsx" -type f
grep -r "searchterm" src/

# Git
git status
git add .
git commit -m "message"
git push

# Proceso management
ps aux | grep node
kill -9 [PID]
```

## Variables de Entorno
```bash
# Crear archivo .env
echo "VITE_API_URL=http://localhost:8000/api" > .env
```