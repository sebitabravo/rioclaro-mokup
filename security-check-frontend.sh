#!/bin/bash

# Script de Verificación de Seguridad - Frontend Río Claro
# Este script verifica configuraciones de seguridad antes del deploy

echo "🔒 VERIFICACIÓN DE SEGURIDAD - FRONTEND RÍO CLARO"
echo "=================================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Función para verificar
check_pass() {
    echo -e "${GREEN}✅ $1${NC}"
}

check_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARNINGS++))
}

check_fail() {
    echo -e "${RED}❌ $1${NC}"
    ((ERRORS++))
}

echo "📋 Verificando Configuración..."
echo ""

# 1. Verificar que exista .env.production
if [ -f ".env.production" ]; then
    check_pass ".env.production existe"
    
    # Verificar variables críticas
    if grep -q "VITE_API_URL" .env.production; then
        check_pass "VITE_API_URL configurada"
    else
        check_fail "VITE_API_URL NO configurada"
    fi
else
    check_fail ".env.production NO existe"
    check_warn "Copiar .env.production.example a .env.production"
fi

# 2. Verificar que no haya console.log en código
echo ""
echo "🔍 Verificando console.log en código..."
CONSOLE_LOGS=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -n "console\.log" 2>/dev/null | wc -l)
if [ "$CONSOLE_LOGS" -gt 0 ]; then
    check_warn "Se encontraron $CONSOLE_LOGS console.log en el código"
    echo "   Nota: Se eliminarán automáticamente en build de producción"
else
    check_pass "No hay console.log en código"
fi

# 3. Verificar que no haya claves API hardcodeadas
echo ""
echo "🔑 Verificando claves API hardcodeadas..."
if grep -r "sk-" src/ 2>/dev/null | grep -v "node_modules" > /dev/null; then
    check_fail "Posible clave API hardcodeada encontrada"
else
    check_pass "No se encontraron claves API hardcodeadas"
fi

# 4. Verificar dependencias vulnerables
echo ""
echo "📦 Verificando dependencias..."
if command -v pnpm &> /dev/null; then
    check_pass "pnpm instalado"
    
    echo "   Ejecutando audit..."
    if pnpm audit --prod 2>&1 | grep -q "0 vulnerabilities"; then
        check_pass "No hay vulnerabilidades en dependencias de producción"
    else
        check_warn "Se encontraron vulnerabilidades. Ejecutar: pnpm audit"
    fi
else
    check_warn "pnpm no instalado"
fi

# 5. Verificar que el build funcione
echo ""
echo "🏗️  Verificando build..."
if [ -d "dist" ]; then
    check_pass "Directorio dist existe"
    
    # Verificar tamaño de chunks
    LARGE_CHUNKS=$(find dist/assets -name "*.js" -size +500k 2>/dev/null | wc -l)
    if [ "$LARGE_CHUNKS" -gt 0 ]; then
        check_warn "$LARGE_CHUNKS chunks mayores a 500KB"
        echo "   Considerar optimización adicional"
    else
        check_pass "Todos los chunks son menores a 500KB"
    fi
else
    check_warn "Directorio dist no existe. Ejecutar: pnpm build"
fi

# 6. Verificar configuración HTTPS
echo ""
echo "🔐 Verificación HTTPS..."
if [ -f ".env.production" ] && grep -q "https://" .env.production; then
    check_pass "URL de API usa HTTPS"
else
    check_warn "Verificar que API use HTTPS en producción"
fi

# 7. Verificar que no haya archivos sensibles
echo ""
echo "🗂️  Verificando archivos sensibles..."
SENSITIVE_FILES=(".env" ".env.local" ".env.development")
for file in "${SENSITIVE_FILES[@]}"; do
    if [ -f "$file" ]; then
        if grep -q "$file" .gitignore; then
            check_pass "$file está en .gitignore"
        else
            check_fail "$file NO está en .gitignore"
        fi
    fi
done

# 8. Verificar sourcemaps en producción
echo ""
echo "🗺️  Verificando sourcemaps..."
if grep -q "sourcemap: true" vite.config.ts; then
    check_warn "Sourcemaps habilitados en producción"
    echo "   Considerar desactivar o proteger en producción"
else
    check_pass "Sourcemaps configurados correctamente"
fi

# 9. Verificar configuración de seguridad
echo ""
echo "🛡️  Verificando configuración de seguridad..."
if grep -q "pure_funcs.*console.log" vite.config.ts; then
    check_pass "console.log se elimina en producción"
fi

if grep -q "drop_debugger: true" vite.config.ts; then
    check_pass "debugger se elimina en producción"
fi

# 10. Verificar tests
echo ""
echo "🧪 Verificando tests..."
if [ -d "src/test" ] || [ -d "tests" ]; then
    check_pass "Directorio de tests existe"
else
    check_warn "No se encontró directorio de tests"
fi

# Resumen Final
echo ""
echo "=================================================="
echo "📊 RESUMEN"
echo "=================================================="
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}🎉 PERFECTO! Todas las verificaciones pasaron${NC}"
    echo ""
    echo "✅ El proyecto está listo para producción"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS advertencias encontradas${NC}"
    echo ""
    echo "El proyecto puede ir a producción, pero revisa las advertencias"
    exit 0
else
    echo -e "${RED}❌ $ERRORS errores y $WARNINGS advertencias encontradas${NC}"
    echo ""
    echo "Corrige los errores antes de ir a producción"
    exit 1
fi
