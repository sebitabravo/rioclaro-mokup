# Tareas Post-Desarrollo - Checklist

## Después de Completar una Tarea

### 1. Verificación de Código
```bash
# Linting obligatorio (0 warnings)
pnpm lint

# TypeScript compilation
pnpm build
```

### 2. Testing
```bash
# Tests E2E
pnpm test

# Tests específicos si aplica
pnpm test:ui  # para debugging visual
```

### 3. Verificación de Funcionalidad
```bash
# Probar en desarrollo
pnpm dev

# Verificar build de producción
pnpm build && pnpm preview
```

### 4. Control de Calidad
- ✅ **No errores de TypeScript**
- ✅ **ESLint pasa sin warnings**
- ✅ **Tests E2E pasan**
- ✅ **Funcionalidad probada manualmente**
- ✅ **Responsive design verificado**
- ✅ **Cross-browser compatibility** (Chrome, Safari, Firefox)

### 5. Clean Architecture Compliance
- ✅ **Respeta las capas de arquitectura**
- ✅ **No hay dependencias circulares**
- ✅ **Inyección de dependencias correcta**
- ✅ **Separación de responsabilidades**

### 6. Documentación
- ✅ **Actualizar README si es necesario**
- ✅ **Comentarios en código complejo**
- ✅ **Types documentados**

### 7. Git Workflow
```bash
git add .
git commit -m "feat: descripción clara del cambio"
git push
```

## Problemas Comunes a Verificar
- **Memory leaks** en componentes con animaciones
- **Performance** en navegadores Safari/Firefox  
- **Type safety** - evitar uso de `any`
- **Export/Import** statements limpios
- **Unused imports** removidos