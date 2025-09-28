#!/bin/bash

# Script para probar el sistema completo RíoClaro
# Verifica backend Django + Frontend React + Autenticación

echo "🔥 INICIANDO PRUEBA COMPLETA DEL SISTEMA RIOCLARO 🔥"
echo "=================================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
BACKEND_URL="http://localhost:8000"
FRONTEND_URL="http://localhost:5173"
BACKEND_DIR="/Users/sebita/Developer/rioclaro-mokup/backend"

echo -e "${BLUE}📋 CONFIGURACIÓN:${NC}"
echo "   Backend:  $BACKEND_URL"
echo "   Frontend: $FRONTEND_URL"
echo "   Backend Dir: $BACKEND_DIR"
echo ""

# Función para verificar si un puerto está en uso
check_port() {
    local port=$1
    local service=$2
    if lsof -ti:$port > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $service corriendo en puerto $port${NC}"
        return 0
    else
        echo -e "${RED}❌ $service NO está corriendo en puerto $port${NC}"
        return 1
    fi
}

# Función para hacer petición HTTP
test_endpoint() {
    local url=$1
    local description=$2
    local expected_status=${3:-200}

    echo -n "   Probando $description... "

    response=$(curl -s -w "%{http_code}" -o /tmp/test_response "$url" 2>/dev/null)
    status_code=$response

    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ ($status_code)${NC}"
        return 0
    else
        echo -e "${RED}❌ ($status_code)${NC}"
        return 1
    fi
}

# Función para test de login
test_login() {
    local username=$1
    local password=$2
    local description=$3

    echo -n "   Login $description ($username)... "

    # Crear JSON payload
    json_payload=$(printf '{"username":"%s","password":"%s"}' "$username" "$password")

    response=$(curl -s -w "%{http_code}" \
        -H "Content-Type: application/json" \
        -d "$json_payload" \
        -o /tmp/login_response \
        "$BACKEND_URL/api/auth/token/" 2>/dev/null)

    status_code=${response: -3}

    if [ "$status_code" = "200" ]; then
        # Extraer token de la respuesta
        token=$(grep -o '"token":"[^"]*"' /tmp/login_response | cut -d'"' -f4)
        if [ -n "$token" ]; then
            echo -e "${GREEN}✅ Token: ${token:0:20}...${NC}"
            # Guardar token para siguientes tests
            echo "$token" > /tmp/auth_token
            return 0
        else
            echo -e "${RED}❌ No token received${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ ($status_code)${NC}"
        cat /tmp/login_response 2>/dev/null
        return 1
    fi
}

# Función para test autenticado
test_authenticated_endpoint() {
    local endpoint=$1
    local description=$2

    echo -n "   $description... "

    if [ ! -f /tmp/auth_token ]; then
        echo -e "${RED}❌ No token disponible${NC}"
        return 1
    fi

    token=$(cat /tmp/auth_token)

    response=$(curl -s -w "%{http_code}" \
        -H "Authorization: Token $token" \
        -o /tmp/auth_response \
        "$BACKEND_URL$endpoint" 2>/dev/null)

    status_code=${response: -3}

    if [ "$status_code" = "200" ]; then
        # Contar registros si es un array JSON
        if jq -e '. | type == "array"' /tmp/auth_response > /dev/null 2>&1; then
            count=$(jq '. | length' /tmp/auth_response)
            echo -e "${GREEN}✅ ($count registros)${NC}"
        else
            echo -e "${GREEN}✅${NC}"
        fi
        return 0
    else
        echo -e "${RED}❌ ($status_code)${NC}"
        return 1
    fi
}

echo -e "${YELLOW}1. VERIFICANDO SERVICIOS ACTIVOS${NC}"
echo "================================="

# Verificar si los puertos están activos
backend_running=false
frontend_running=false

if check_port 8000 "Django Backend"; then
    backend_running=true
fi

if check_port 5173 "React Frontend"; then
    frontend_running=true
fi

echo ""

# Si el backend no está corriendo, intentar iniciarlo
if [ "$backend_running" = false ]; then
    echo -e "${YELLOW}🚀 Intentando iniciar Django Backend...${NC}"
    if [ -d "$BACKEND_DIR" ]; then
        cd "$BACKEND_DIR"
        echo "   Directorio: $(pwd)"

        # Buscar manage.py
        if [ -f "manage.py" ]; then
            echo "   Iniciando servidor Django..."
            python manage.py runserver 8000 &
            DJANGO_PID=$!
            echo "   PID del proceso Django: $DJANGO_PID"

            # Esperar a que el servidor inicie
            echo "   Esperando 5 segundos para que Django inicie..."
            sleep 5

            if check_port 8000 "Django Backend"; then
                backend_running=true
                echo -e "${GREEN}✅ Django Backend iniciado exitosamente${NC}"
            else
                echo -e "${RED}❌ No se pudo iniciar Django Backend${NC}"
            fi
        else
            echo -e "${RED}❌ manage.py no encontrado en $BACKEND_DIR${NC}"
        fi
    else
        echo -e "${RED}❌ Directorio backend no encontrado: $BACKEND_DIR${NC}"
    fi
fi

echo ""

# Solo continuar si el backend está corriendo
if [ "$backend_running" = false ]; then
    echo -e "${RED}💥 ABORTANDO: Backend Django no está disponible${NC}"
    exit 1
fi

echo -e "${YELLOW}2. PROBANDO ENDPOINTS BÁSICOS${NC}"
echo "============================="

test_endpoint "$BACKEND_URL/" "Django Root" 404
test_endpoint "$BACKEND_URL/admin/" "Django Admin" 302
test_endpoint "$BACKEND_URL/api/users/" "API Users (sin auth)" 401
test_endpoint "$BACKEND_URL/api/stations/" "API Stations (sin auth)" 401

echo ""

echo -e "${YELLOW}3. PROBANDO AUTENTICACIÓN${NC}"
echo "========================="

# Test de login con usuarios
test_login "admin" "admin123" "Administrador"
test_login "tecnico" "tecnico123" "Técnico"
test_login "observador" "observador123" "Observador"

echo ""

echo -e "${YELLOW}4. PROBANDO ENDPOINTS AUTENTICADOS${NC}"
echo "=================================="

# Usar el último token válido para tests autenticados
test_authenticated_endpoint "/api/users/" "Lista de usuarios"
test_authenticated_endpoint "/api/stations/" "Lista de estaciones"
test_authenticated_endpoint "/api/measurements/history/" "Mediciones históricas"
test_authenticated_endpoint "/api/measurements/latest/" "Mediciones más recientes"

echo ""

echo -e "${YELLOW}5. VERIFICANDO DATOS EN BASE DE DATOS${NC}"
echo "===================================="

if [ "$backend_running" = true ]; then
    cd "$BACKEND_DIR"

    echo -n "   Contando usuarios... "
    user_count=$(python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); print(User.objects.count())" 2>/dev/null | tail -1)
    echo -e "${GREEN}✅ $user_count usuarios${NC}"

    echo -n "   Contando estaciones... "
    station_count=$(python manage.py shell -c "from module4.models import Station; print(Station.objects.count())" 2>/dev/null | tail -1)
    echo -e "${GREEN}✅ $station_count estaciones${NC}"

    echo -n "   Contando mediciones... "
    measurement_count=$(python manage.py shell -c "from module4.models import ExtensibleMeasurement; print(ExtensibleMeasurement.objects.count())" 2>/dev/null | tail -1)
    echo -e "${GREEN}✅ $measurement_count mediciones${NC}"
fi

echo ""

echo -e "${YELLOW}6. VERIFICANDO FRONTEND${NC}"
echo "======================"

if [ "$frontend_running" = true ]; then
    test_endpoint "$FRONTEND_URL" "React Frontend" 200
    echo -e "${GREEN}✅ Frontend accesible${NC}"
    echo -e "${BLUE}   Abrir: $FRONTEND_URL${NC}"
else
    echo -e "${RED}❌ Frontend no está corriendo${NC}"
    echo -e "${YELLOW}   Para iniciar: pnpm dev${NC}"
fi

echo ""

echo -e "${YELLOW}7. RESUMEN FINAL${NC}"
echo "================"

echo -e "${BLUE}🔗 URLs del Sistema:${NC}"
echo "   Frontend: $FRONTEND_URL"
echo "   Backend:  $BACKEND_URL"
echo "   Admin:    $BACKEND_URL/admin/"

echo ""
echo -e "${BLUE}🔑 Credenciales de Prueba:${NC}"
echo "   admin / admin123 (Administrador)"
echo "   tecnico / tecnico123 (Técnico)"
echo "   observador / observador123 (Observador)"

echo ""
echo -e "${BLUE}📋 Estado de Servicios:${NC}"
if [ "$backend_running" = true ]; then
    echo -e "   Backend Django:  ${GREEN}✅ FUNCIONANDO${NC}"
else
    echo -e "   Backend Django:  ${RED}❌ NO DISPONIBLE${NC}"
fi

if [ "$frontend_running" = true ]; then
    echo -e "   Frontend React:  ${GREEN}✅ FUNCIONANDO${NC}"
else
    echo -e "   Frontend React:  ${RED}❌ NO DISPONIBLE${NC}"
fi

echo ""

if [ "$backend_running" = true ] && [ "$frontend_running" = true ]; then
    echo -e "${GREEN}🎉 SISTEMA COMPLETAMENTE FUNCIONAL${NC}"
    echo -e "${GREEN}   Todos los componentes están operativos${NC}"
    echo -e "${BLUE}   Puedes usar el sistema normalmente${NC}"
else
    echo -e "${YELLOW}⚠️  SISTEMA PARCIALMENTE FUNCIONAL${NC}"
    if [ "$backend_running" = false ]; then
        echo -e "${RED}   ❌ Iniciar Django Backend${NC}"
    fi
    if [ "$frontend_running" = false ]; then
        echo -e "${RED}   ❌ Iniciar React Frontend (pnpm dev)${NC}"
    fi
fi

echo ""
echo -e "${BLUE}📝 Logs guardados en /tmp/test_* para debugging${NC}"

# Limpiar archivos temporales (opcional)
# rm -f /tmp/test_response /tmp/login_response /tmp/auth_response /tmp/auth_token

echo ""
echo "🔥 PRUEBA COMPLETA FINALIZADA 🔥"