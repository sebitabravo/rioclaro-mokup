"""
Django settings for rioclaro_api project.

Production-ready configuration with environment variable support.
This configuration supports both development and production environments.
"""

import os
from pathlib import Path
from django.core.management.utils import get_random_secret_key
import dj_database_url

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from .env file
import environ
env = environ.Env(
    # Set casting and default values
    DEBUG=(bool, False),
    SECRET_KEY=(str, get_random_secret_key()),
    ALLOWED_HOSTS=(list, []),
)

# Read environment file based on DJANGO_ENVIRONMENT
DJANGO_ENVIRONMENT = os.getenv('DJANGO_ENVIRONMENT', 'development')

# Read the appropriate .env file
if DJANGO_ENVIRONMENT == 'production':
    environ.Env.read_env(BASE_DIR.parent / '.env.production')
else:
    environ.Env.read_env(BASE_DIR.parent / '.env.development')

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = env('SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = env('DEBUG')

# Hosts configuration
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS')

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'django_filters',
    'django_extensions',  # For management commands
    'django_ratelimit',   # Rate limiting
    'axes',              # Advanced authentication security
    'users',
    'stations',
    'sensors',
    'measurements',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'users.security_logging.RequestContextMiddleware',  # Request context for logging
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'axes.middleware.AxesMiddleware',                    # Django-axes protection
    'users.middleware.SessionTimeoutMiddleware',        # Custom session timeout
    'users.middleware.AuditLogMiddleware',             # Custom audit logging
    'users.middleware.SecurityHeadersMiddleware',       # Custom security headers
    'users.middleware.RequestSanitizationMiddleware',   # Input sanitization
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'rioclaro_api.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'rioclaro_api.wsgi.application'

# Database Configuration
DATABASES = {
    'default': {
        'ENGINE': env('DB_ENGINE', default='django.db.backends.sqlite3'),
        'NAME': env('DB_NAME', default=BASE_DIR / 'db.sqlite3'),
        'USER': env('DB_USER', default=''),
        'PASSWORD': env('DB_PASSWORD', default=''),
        'HOST': env('DB_HOST', default=''),
        'PORT': env('DB_PORT', default=''),
        'OPTIONS': {
            'charset': 'utf8mb4',
        } if env('DB_ENGINE', default='').endswith('mysql') else {},
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': env('PASSWORD_MIN_LENGTH', default=8),
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
    {
        'NAME': 'users.validators.CustomPasswordValidator',  # Custom password policy
    },
]

# Internationalization
LANGUAGE_CODE = 'es-es'
TIME_ZONE = 'America/Argentina/Buenos_Aires'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = env('STATIC_ROOT', default=BASE_DIR / 'staticfiles')

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = env('MEDIA_ROOT', default=BASE_DIR / 'media')

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Custom User Model
AUTH_USER_MODEL = 'users.CustomUser'

# Authentication Backends
AUTHENTICATION_BACKENDS = [
    'users.authentication.EmailOrUsernameBackend',
    'django.contrib.auth.backends.ModelBackend',
]

# Django Rest Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.FormParser',
        'rest_framework.parsers.MultiPartParser',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': env('API_RATE_LIMIT', default='100/hour'),
        'user': env('API_RATE_LIMIT', default='1000/hour'),
        'login': env('LOGIN_RATE_LIMIT', default='5/min'),
    }
}

# CORS Settings
CORS_ALLOW_ALL_ORIGINS = env('CORS_ALLOW_ALL_ORIGINS', default=False)
CORS_ALLOW_CREDENTIALS = env('CORS_ALLOW_CREDENTIALS', default=True)
CORS_ALLOWED_ORIGINS = env.list('CORS_ALLOWED_ORIGINS', default=[])

# Session Configuration
SESSION_COOKIE_AGE = env('SESSION_COOKIE_AGE', default=3600)  # 1 hour default
SESSION_SAVE_EVERY_REQUEST = True
SESSION_EXPIRE_AT_BROWSER_CLOSE = False

# Production Security Settings
if not DEBUG:
    SESSION_COOKIE_SECURE = env('SESSION_COOKIE_SECURE', default=True)
    SESSION_COOKIE_HTTPONLY = env('SESSION_COOKIE_HTTPONLY', default=True)
    SESSION_COOKIE_SAMESITE = env('SESSION_COOKIE_SAMESITE', default='Strict')

    SECURE_SSL_REDIRECT = env('SECURE_SSL_REDIRECT', default=True)
    SECURE_HSTS_SECONDS = env('SECURE_HSTS_SECONDS', default=31536000)
    SECURE_HSTS_INCLUDE_SUBDOMAINS = env('SECURE_HSTS_INCLUDE_SUBDOMAINS', default=True)
    SECURE_HSTS_PRELOAD = env('SECURE_HSTS_PRELOAD', default=True)
    SECURE_CONTENT_TYPE_NOSNIFF = env('SECURE_CONTENT_TYPE_NOSNIFF', default=True)
    SECURE_BROWSER_XSS_FILTER = env('SECURE_BROWSER_XSS_FILTER', default=True)
    X_FRAME_OPTIONS = env('X_FRAME_OPTIONS', default='DENY')

# Email Configuration
EMAIL_BACKEND = env('EMAIL_BACKEND', default='django.core.mail.backends.console.EmailBackend')
EMAIL_HOST = env('EMAIL_HOST', default='')
EMAIL_PORT = env('EMAIL_PORT', default=587)
EMAIL_USE_TLS = env('EMAIL_USE_TLS', default=True)
EMAIL_HOST_USER = env('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = env('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = env('DEFAULT_FROM_EMAIL', default='noreply@rioclaro.com')

# Logging Configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
        'json': {
            '()': 'users.security_logging.SecurityLogFormatter',
        },
    },
    'handlers': {
        'file': {
            'level': env('LOG_LEVEL', default='INFO'),
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'django.log',
            'formatter': 'verbose',
        },
        'console': {
            'level': env('LOG_LEVEL', default='INFO'),
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
        'security_file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': BASE_DIR / 'logs' / 'security.log',
            'maxBytes': 10 * 1024 * 1024,  # 10MB
            'backupCount': 10,
            'formatter': 'json',
        },
        'security_critical': {
            'level': 'ERROR',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': BASE_DIR / 'logs' / 'security_critical.log',
            'maxBytes': 5 * 1024 * 1024,  # 5MB
            'backupCount': 20,
            'formatter': 'json',
        },
        'audit_file': {
            'level': 'INFO',
            'class': 'logging.handlers.TimedRotatingFileHandler',
            'filename': BASE_DIR / 'logs' / 'audit.log',
            'when': 'midnight',
            'interval': 1,
            'backupCount': 365,
            'formatter': 'json',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': env('LOG_LEVEL', default='INFO'),
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': env('LOG_LEVEL', default='INFO'),
            'propagate': False,
        },
        'rioclaro': {
            'handlers': ['console', 'file'],
            'level': env('LOG_LEVEL', default='INFO'),
            'propagate': False,
        },
        'rioclaro.security': {
            'handlers': ['security_file', 'security_critical', 'audit_file', 'console'],
            'level': 'INFO',
            'propagate': False,
        },
        'rioclaro.auth': {
            'handlers': ['security_file', 'console'],
            'level': 'INFO',
            'propagate': False,
        },
        'rioclaro.ratelimit': {
            'handlers': ['security_file', 'console'],
            'level': 'WARNING',
            'propagate': False,
        },
        'axes': {
            'handlers': ['security_file', 'console'],
            'level': 'WARNING',
            'propagate': False,
        },
    },
}

# Custom RíoClaro Settings
RIOCLARO_SETTINGS = {
    'SESSION_TIMEOUT_MINUTES': env('SESSION_TIMEOUT_MINUTES', default=480),
    'PASSWORD_POLICY': {
        'MIN_LENGTH': env('PASSWORD_MIN_LENGTH', default=8),
        'REQUIRE_UPPERCASE': env('PASSWORD_REQUIRE_UPPERCASE', default=True),
        'REQUIRE_LOWERCASE': env('PASSWORD_REQUIRE_LOWERCASE', default=True),
        'REQUIRE_NUMBERS': env('PASSWORD_REQUIRE_NUMBERS', default=True),
        'REQUIRE_SYMBOLS': env('PASSWORD_REQUIRE_SYMBOLS', default=False),
        'HISTORY_COUNT': env('PASSWORD_HISTORY_COUNT', default=3),
        'FORCE_CHANGE_DAYS': env('PASSWORD_FORCE_CHANGE_DAYS', default=90),
    },
    'BACKUP': {
        'RETENTION_DAYS': env('BACKUP_RETENTION_DAYS', default=30),
        'STORAGE_PATH': env('BACKUP_STORAGE_PATH', default=BASE_DIR / 'backups'),
        'ENCRYPTION_KEY': env('BACKUP_ENCRYPTION_KEY', default=''),
    },
    'AUDIT': {
        'ENABLED': env('AUDIT_LOG_ENABLED', default=True),
        'RETENTION_DAYS': env('AUDIT_LOG_RETENTION_DAYS', default=365),
    },
    'DATA_SOURCE': env('DATA_SOURCE', default='SIMULATOR'),
    'FRONTEND_URL': env('FRONTEND_URL', default='http://localhost:5173'),
}

# Redis Configuration (for caching and Celery)
if env('REDIS_URL', default=None):
    CACHES = {
        'default': {
            'BACKEND': 'django_redis.cache.RedisCache',
            'LOCATION': env('REDIS_URL'),
            'OPTIONS': {
                'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            }
        }
    }

    # Celery Configuration
    CELERY_BROKER_URL = env('CELERY_BROKER_URL', default=env('REDIS_URL'))
    CELERY_RESULT_BACKEND = env('CELERY_RESULT_BACKEND', default=env('REDIS_URL'))
    CELERY_ACCEPT_CONTENT = ['json']
    CELERY_TASK_SERIALIZER = 'json'
    CELERY_RESULT_SERIALIZER = 'json'
    CELERY_TIMEZONE = TIME_ZONE

# Admin URL Configuration (obfuscated in production)
ADMIN_URL = env('ADMIN_URL', default='admin/')

# Error Tracking (Sentry)
SENTRY_DSN = env('SENTRY_DSN', default=None)
if SENTRY_DSN and not DEBUG:
    import sentry_sdk
    from sentry_sdk.integrations.django import DjangoIntegration

    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[DjangoIntegration()],
        traces_sample_rate=0.1,
        send_default_pii=True
    )

# Django-axes Configuration (Anti-brute force protection)
AXES_HANDLER = 'axes.handlers.database.AxesDatabaseHandler'
AXES_FAILURE_LIMIT = env('AXES_FAILURE_LIMIT', default=5)
AXES_COOLOFF_TIME = env('AXES_COOLOFF_TIME', default=1)  # Hours
AXES_RESET_ON_SUCCESS = env('AXES_RESET_ON_SUCCESS', default=True)
AXES_LOCKOUT_CALLABLE = 'users.security_logging.log_lockout_event'
AXES_ENABLE_ADMIN = env('AXES_ENABLE_ADMIN', default=True)
AXES_VERBOSE = env('AXES_VERBOSE', default=True)
AXES_LOCK_OUT_AT_FAILURE = env('AXES_LOCK_OUT_AT_FAILURE', default=True)
AXES_USE_USER_AGENT = env('AXES_USE_USER_AGENT', default=True)
AXES_LOCK_OUT_BY_COMBINATION_USER_AND_IP = env('AXES_LOCK_OUT_BY_COMBINATION_USER_AND_IP', default=True)

# Rate Limiting Configuration
RATELIMIT_USE_CACHE = 'default'
RATELIMIT_ENABLE = env('RATELIMIT_ENABLE', default=True)

# Additional Security Settings for Production
if not DEBUG:
    # Force HTTPS in production
    SECURE_SSL_REDIRECT = env('SECURE_SSL_REDIRECT', default=True)
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

    # HSTS Settings
    SECURE_HSTS_SECONDS = env('SECURE_HSTS_SECONDS', default=31536000)  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = env('SECURE_HSTS_INCLUDE_SUBDOMAINS', default=True)
    SECURE_HSTS_PRELOAD = env('SECURE_HSTS_PRELOAD', default=True)

    # Additional Security Headers
    SECURE_CONTENT_TYPE_NOSNIFF = env('SECURE_CONTENT_TYPE_NOSNIFF', default=True)
    SECURE_BROWSER_XSS_FILTER = env('SECURE_BROWSER_XSS_FILTER', default=True)
    SECURE_REFERRER_POLICY = env('SECURE_REFERRER_POLICY', default='strict-origin-when-cross-origin')

    # Cookie Security
    SESSION_COOKIE_SECURE = env('SESSION_COOKIE_SECURE', default=True)
    SESSION_COOKIE_HTTPONLY = env('SESSION_COOKIE_HTTPONLY', default=True)
    SESSION_COOKIE_SAMESITE = env('SESSION_COOKIE_SAMESITE', default='Strict')
    CSRF_COOKIE_SECURE = env('CSRF_COOKIE_SECURE', default=True)
    CSRF_COOKIE_HTTPONLY = env('CSRF_COOKIE_HTTPONLY', default=True)
    CSRF_COOKIE_SAMESITE = env('CSRF_COOKIE_SAMESITE', default='Strict')

# Security Event Monitoring
SECURITY_MONITORING = {
    'ENABLE_INTRUSION_DETECTION': env('ENABLE_INTRUSION_DETECTION', default=True),
    'ENABLE_RATE_LIMIT_MONITORING': env('ENABLE_RATE_LIMIT_MONITORING', default=True),
    'ENABLE_AUTHENTICATION_MONITORING': env('ENABLE_AUTHENTICATION_MONITORING', default=True),
    'SUSPICIOUS_ACTIVITY_THRESHOLD': env('SUSPICIOUS_ACTIVITY_THRESHOLD', default=10),
    'AUTO_BLOCK_SUSPICIOUS_IPS': env('AUTO_BLOCK_SUSPICIOUS_IPS', default=False),
    'NOTIFICATION_EMAIL': env('SECURITY_NOTIFICATION_EMAIL', default=DEFAULT_FROM_EMAIL),
}