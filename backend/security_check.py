#!/usr/bin/env python3
"""
Script de verificación de las nuevas características de seguridad
Este script verifica que todas las importaciones y configuraciones estén correctas
"""

import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rioclaro_api.settings')
django.setup()

def test_imports():
    """Probar que todas las importaciones funcionen correctamente"""
    print("🔍 Verificando importaciones...")

    try:
        # Middleware
        from users.middleware import (
            SessionTimeoutMiddleware,
            AuditLogMiddleware,
            SecurityHeadersMiddleware,
            RequestSanitizationMiddleware
        )
        print("✅ Middleware importado correctamente")

        # Rate limiting
        from users.ratelimit import (
            smart_ratelimit,
            auth_ratelimit,
            api_ratelimit,
            admin_ratelimit,
            advanced_rate_limiter
        )
        print("✅ Rate limiting importado correctamente")

        # Security logging
        from users.security_logging import (
            SecurityLogger,
            SecurityEventTypes,
            log_security_event,
            security_logger
        )
        print("✅ Security logging importado correctamente")

        # Validators
        from users.validators import (
            CustomPasswordValidator,
            EnhancedEmailValidator,
            UsernameValidator,
            InputSanitizer,
            APIParameterValidator
        )
        print("✅ Validators importado correctamente")

        # Authentication
        from users.authentication import EmailOrUsernameBackend
        print("✅ Authentication backend importado correctamente")

    except ImportError as e:
        print(f"❌ Error de importación: {e}")
        return False

    return True

def test_configuration():
    """Verificar que la configuración de Django esté correcta"""
    print("\n🔧 Verificando configuración...")

    from django.conf import settings

    # Verificar apps instaladas
    required_apps = [
        'django_ratelimit',
        'axes',
        'users'
    ]

    for app in required_apps:
        if app in settings.INSTALLED_APPS:
            print(f"✅ App '{app}' está instalada")
        else:
            print(f"❌ App '{app}' NO está instalada")
            return False

    # Verificar middleware
    required_middleware = [
        'users.security_logging.RequestContextMiddleware',
        'axes.middleware.AxesMiddleware',
        'users.middleware.SessionTimeoutMiddleware',
        'users.middleware.AuditLogMiddleware',
        'users.middleware.SecurityHeadersMiddleware',
        'users.middleware.RequestSanitizationMiddleware'
    ]

    for middleware in required_middleware:
        if middleware in settings.MIDDLEWARE:
            print(f"✅ Middleware '{middleware}' está configurado")
        else:
            print(f"⚠️  Middleware '{middleware}' NO está configurado")

    # Verificar logging
    if 'rioclaro.security' in settings.LOGGING['loggers']:
        print("✅ Logger de seguridad está configurado")
    else:
        print("❌ Logger de seguridad NO está configurado")
        return False

    return True

def test_security_features():
    """Probar características básicas de seguridad"""
    print("\n🛡️  Probando características de seguridad...")

    try:
        # Probar logger de seguridad
        from users.security_logging import log_security_event, SecurityEventTypes
        log_security_event(
            SecurityEventTypes.SYSTEM_ERROR,
            "Test security event",
            test=True
        )
        print("✅ Security logging funciona")

        # Probar validadores
        from users.validators import InputSanitizer
        test_input = "<script>alert('test')</script>"
        sanitized = InputSanitizer.sanitize_html(test_input)
        if sanitized != test_input:
            print("✅ Input sanitizer funciona")
        else:
            print("⚠️  Input sanitizer no eliminó HTML")

        # Probar rate limiter avanzado
        from users.ratelimit import advanced_rate_limiter
        print("✅ Rate limiter avanzado disponible")

    except Exception as e:
        print(f"❌ Error probando características: {e}")
        return False

    return True

def check_directories():
    """Verificar que existan los directorios necesarios"""
    print("\n📁 Verificando directorios...")

    logs_dir = "logs"
    if os.path.exists(logs_dir):
        print(f"✅ Directorio '{logs_dir}' existe")
    else:
        print(f"⚠️  Creando directorio '{logs_dir}'")
        os.makedirs(logs_dir, exist_ok=True)

    return True

def main():
    """Función principal"""
    print("🔒 VERIFICACIÓN DE CARACTERÍSTICAS DE SEGURIDAD - RIOCLARO")
    print("=" * 60)

    all_passed = True

    # Ejecutar todas las verificaciones
    if not test_imports():
        all_passed = False

    if not test_configuration():
        all_passed = False

    if not test_security_features():
        all_passed = False

    if not check_directories():
        all_passed = False

    print("\n" + "=" * 60)
    if all_passed:
        print("🎉 TODAS LAS VERIFICACIONES PASARON!")
        print("✅ El sistema de seguridad está listo para usar")
        print("\nPróximos pasos:")
        print("1. Instalar dependencias: pip install -r requirements.txt")
        print("2. Ejecutar migraciones: python manage.py migrate")
        print("3. Reiniciar el servidor: python manage.py runserver")
    else:
        print("⚠️  ALGUNAS VERIFICACIONES FALLARON")
        print("❌ Revise los errores anteriores antes de continuar")
        sys.exit(1)

if __name__ == "__main__":
    main()