#!/bin/bash
# Script de configuración rápida para el simulador Arduino/PLC

echo "🚀 CONFIGURACIÓN SIMULADOR ARDUINO/PLC"
echo "======================================"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar Python
echo "🐍 Verificando Python..."
if command -v python3 &> /dev/null; then
    echo -e "${GREEN}✅ Python3 encontrado$(python3 --version)${NC}"
else
    echo -e "${RED}❌ Python3 no encontrado. Por favor instala Python 3.7+${NC}"
    exit 1
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
pip3 install -r requirements.txt

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencias instaladas${NC}"
else
    echo -e "${RED}❌ Error instalando dependencias${NC}"
    exit 1
fi

# Hacer ejecutables los scripts
chmod +x mock_arduino.py
chmod +x simulator_utils.py

echo -e "${GREEN}✅ Scripts configurados como ejecutables${NC}"

# Probar conexión con backend (opcional)
read -p "🔗 ¿Quieres probar la conexión con el backend? [y/N]: " test_connection

if [[ $test_connection =~ ^[Yy]$ ]]; then
    read -p "🌐 URL del backend [http://localhost:8000]: " backend_url
    backend_url=${backend_url:-http://localhost:8000}

    echo "🧪 Probando conexión..."
    python3 simulator_utils.py --backend "$backend_url" test-endpoints
fi

echo ""
echo -e "${GREEN}🎉 CONFIGURACIÓN COMPLETADA${NC}"
echo ""
echo "📋 Comandos disponibles:"
echo "  ./mock_arduino.py --help                    # Ver ayuda del simulador"
echo "  ./mock_arduino.py --test-burst 5           # Enviar 5 ráfagas de prueba"
echo "  ./mock_arduino.py --setup-only             # Solo configurar backend"
echo "  ./simulator_utils.py --help               # Ver ayuda de utilidades"
echo "  ./simulator_utils.py test-endpoints       # Probar endpoints"
echo ""
echo -e "${YELLOW}💡 Ejemplo de uso básico:${NC}"
echo "  ./mock_arduino.py --backend http://localhost:8000 --interval 15"
echo ""
