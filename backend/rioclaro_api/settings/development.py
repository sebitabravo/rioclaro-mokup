"""
Development settings for rioclaro_api project.
"""

from .base import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# Development allowed hosts
ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0']

# CORS Settings for Development - More permissive
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

# Database for development (SQLite by default)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Development email backend
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Django Debug Toolbar (if installed)
if 'debug_toolbar' in INSTALLED_APPS:
    MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware']
    INTERNAL_IPS = ['127.0.0.1', 'localhost']

# Disable security settings for development
SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False

# Development logging - more verbose
LOGGING['handlers']['console']['level'] = 'DEBUG'
LOGGING['loggers']['django']['level'] = 'DEBUG'
LOGGING['loggers']['rioclaro_api']['level'] = 'DEBUG'

# Django Extensions (if installed)
if 'django_extensions' in INSTALLED_APPS:
    NOTEBOOK_ARGUMENTS = [
        '--ip=0.0.0.0',
        '--port=8888',
        '--allow-root',
        '--no-browser',
    ]

# Performance settings for development
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
    }
}

# Django REST Framework settings for development
REST_FRAMEWORK.update({
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',  # Enable browsable API
    ],
})

# Development-specific apps
DEV_APPS = []

# Check if optional development packages are available
try:
    import debug_toolbar
    DEV_APPS.append('debug_toolbar')
except ImportError:
    pass

try:
    import django_extensions
    DEV_APPS.append('django_extensions')
except ImportError:
    pass

INSTALLED_APPS += DEV_APPS