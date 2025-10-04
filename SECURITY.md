# 🔒 Guía de Seguridad - Río Claro

## 📋 Índice
1. [Configuración de Seguridad Backend](#configuración-de-seguridad-backend)
2. [HTTPS en Producción](#https-en-producción)
3. [Rate Limiting](#rate-limiting)
4. [Variables de Entorno](#variables-de-entorno)
5. [Checklist Pre-Producción](#checklist-pre-producción)

---

## 🛡️ Configuración de Seguridad Backend

### Estado Actual
El backend ya tiene implementadas las siguientes características de seguridad:

#### ✅ Middleware de Seguridad Activos
```python
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'users.security_logging.RequestContextMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'axes.middleware.AxesMiddleware',                    # Protección contra fuerza bruta
    'users.middleware.SessionTimeoutMiddleware',        # Timeout de sesión
    'users.middleware.AuditLogMiddleware',             # Auditoría
    'users.middleware.SecurityHeadersMiddleware',       # Headers de seguridad
    'users.middleware.RequestSanitizationMiddleware',   # Sanitización de input
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
```

#### ✅ Rate Limiting Configurado
```python
RATELIMIT_CONFIG = {
    'anon': '100/hour',     # Usuarios anónimos
    'user': '1000/hour',    # Usuarios autenticados
    'login': '5/min',       # Intentos de login
}
```

### Verificación de Seguridad

Ejecutar el script de verificación:
```bash
cd backend
python3 security_check.py
```

---

## 🔐 HTTPS en Producción

### Opción 1: Nginx con Let's Encrypt (Recomendado)

#### 1. Instalar Certbot
```bash
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx
```

#### 2. Obtener Certificado SSL
```bash
sudo certbot --nginx -d tudominio.cl -d www.tudominio.cl
```

#### 3. Configuración Nginx
```nginx
# /etc/nginx/sites-available/rioclaro

server {
    listen 80;
    server_name tudominio.cl www.tudominio.cl;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tudominio.cl www.tudominio.cl;

    # Certificados SSL
    ssl_certificate /etc/letsencrypt/live/tudominio.cl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tudominio.cl/privkey.pem;

    # Configuración SSL moderna
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Otros headers de seguridad
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend (React build)
    location / {
        root /var/www/rioclaro/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API Backend (Django)
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Admin Backend
    location /admin/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files
    location /static/ {
        alias /var/www/rioclaro/backend/staticfiles/;
    }

    location /media/ {
        alias /var/www/rioclaro/backend/media/;
    }
}
```

#### 4. Renovación Automática
```bash
# Agregar a crontab
sudo crontab -e

# Agregar línea:
0 12 * * * /usr/bin/certbot renew --quiet
```

### Opción 2: Cloudflare (Más Simple)

1. Agregar tu dominio a Cloudflare
2. Actualizar nameservers en tu proveedor de dominio
3. Activar SSL/TLS en modo "Full (strict)"
4. Configurar reglas de página para forzar HTTPS

---

## ⚡ Rate Limiting

### Configuración Actual

El sistema ya tiene rate limiting configurado en `backend/rioclaro_api/settings.py`:

```python
RATELIMIT_CONFIG = {
    'anon': env('API_RATE_LIMIT', default='100/hour'),
    'user': env('API_RATE_LIMIT', default='1000/hour'),
    'login': env('LOGIN_RATE_LIMIT', default='5/min'),
    'ENABLE_RATE_LIMIT_MONITORING': env('ENABLE_RATE_LIMIT_MONITORING', default=True),
}
```

### Personalización por Entorno

#### Desarrollo (.env.development)
```bash
API_RATE_LIMIT=1000/hour
LOGIN_RATE_LIMIT=10/min
ENABLE_RATE_LIMIT_MONITORING=True
```

#### Producción (.env.production)
```bash
API_RATE_LIMIT=100/hour
LOGIN_RATE_LIMIT=5/min
ENABLE_RATE_LIMIT_MONITORING=True
```

### Verificar Rate Limiting

```python
# Test manual
curl -I http://localhost:8000/api/stations/
# Repetir varias veces para ver headers X-RateLimit-*
```

---

## 🔑 Variables de Entorno

### Variables Críticas de Seguridad

#### Backend (.env.production)
```bash
# Seguridad
SECRET_KEY=<generar-clave-secreta-fuerte>
DEBUG=False
DJANGO_ENVIRONMENT=production

# Base de datos
DB_ENGINE=django.db.backends.mysql
DB_NAME=rioclaro_prod
DB_USER=rioclaro_user
DB_PASSWORD=<password-seguro>
DB_HOST=localhost
DB_PORT=3306

# CORS (ajustar a tu dominio)
CORS_ALLOWED_ORIGINS=https://tudominio.cl,https://www.tudominio.cl
ALLOWED_HOSTS=tudominio.cl,www.tudominio.cl

# Rate Limiting
API_RATE_LIMIT=100/hour
LOGIN_RATE_LIMIT=5/min

# Session
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SESSION_COOKIE_HTTPONLY=True
```

#### Frontend (.env.production)
```bash
VITE_API_URL=https://tudominio.cl/api
VITE_ENVIRONMENT=production
```

### Generar SECRET_KEY Seguro

```python
# Ejecutar en Python
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
```

---

## ✅ Checklist Pre-Producción

### Backend Django

- [ ] **Configuración de Seguridad**
  - [ ] `DEBUG=False` en producción
  - [ ] SECRET_KEY único y seguro
  - [ ] `ALLOWED_HOSTS` configurado correctamente
  - [ ] `SECURE_SSL_REDIRECT=True`
  - [ ] `SESSION_COOKIE_SECURE=True`
  - [ ] `CSRF_COOKIE_SECURE=True`

- [ ] **Base de Datos**
  - [ ] Usar PostgreSQL o MySQL en producción
  - [ ] Credenciales seguras
  - [ ] Backups automáticos configurados
  - [ ] Migraciones aplicadas

- [ ] **CORS y CSRF**
  - [ ] `CORS_ALLOWED_ORIGINS` con dominios específicos
  - [ ] CSRF tokens configurados
  - [ ] Cookies HttpOnly activadas

- [ ] **Rate Limiting**
  - [ ] Límites apropiados configurados
  - [ ] Monitoreo activado
  - [ ] Logs de intentos excesivos

- [ ] **Logging**
  - [ ] Logs de seguridad activados
  - [ ] Logs de errores enviados a servicio externo (Sentry)
  - [ ] Rotación de logs configurada

- [ ] **Dependencias**
  - [ ] Todas las dependencias actualizadas
  - [ ] Verificar vulnerabilidades con `pip-audit`
  - [ ] requirements.txt sin versiones de desarrollo

### Frontend React

- [ ] **Build de Producción**
  - [ ] `pnpm build` sin errores
  - [ ] Sourcemaps desactivados o protegidos
  - [ ] Variables de entorno correctas

- [ ] **Performance**
  - [ ] Bundles < 500KB
  - [ ] Code splitting implementado
  - [ ] Lazy loading en rutas pesadas

- [ ] **Seguridad**
  - [ ] No hay console.log en producción (verificado)
  - [ ] No hay API keys en código
  - [ ] HTTPS forzado

### Infraestructura

- [ ] **Servidor**
  - [ ] HTTPS configurado (SSL/TLS)
  - [ ] Firewall configurado (UFW/iptables)
  - [ ] SSH con autenticación por llave
  - [ ] Fail2ban instalado

- [ ] **Monitoreo**
  - [ ] Uptime monitoring (UptimeRobot, Pingdom)
  - [ ] Error tracking (Sentry)
  - [ ] Logs centralizados

- [ ] **Backups**
  - [ ] Base de datos (diario)
  - [ ] Archivos media (semanal)
  - [ ] Configuraciones (versionado en Git)

---

## 🚨 Procedimiento de Emergencia

### En caso de brecha de seguridad:

1. **Inmediato**
   - Cambiar SECRET_KEY
   - Cambiar credenciales de BD
   - Invalidar todas las sesiones
   - Revisar logs de acceso

2. **Investigación**
   - Analizar logs de seguridad
   - Identificar punto de entrada
   - Documentar incidente

3. **Corrección**
   - Parchear vulnerabilidad
   - Actualizar dependencias
   - Fortalecer medidas

4. **Notificación**
   - Informar a stakeholders
   - Notificar a usuarios si aplica
   - Documentar lecciones aprendidas

---

## 📞 Contactos de Emergencia

- **Desarrollador Principal**: [Tu Email]
- **DevOps**: [Email DevOps]
- **Gobierno Regional**: [Email Contacto]

---

## 📚 Recursos Adicionales

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Django Security Checklist](https://docs.djangoproject.com/en/stable/howto/deployment/checklist/)
- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/)

---

**Última actualización**: $(date +"%Y-%m-%d")
**Versión**: 1.0
