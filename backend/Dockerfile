# Multi-stage build for production optimization
FROM python:3.11-slim as builder

# Set build-time environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies for building
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        gcc \
        g++ \
        default-libmysqlclient-dev \
        libpq-dev \
        pkg-config \
        build-essential \
    && rm -rf /var/lib/apt/lists/*

# Create and activate virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy requirements and install Python dependencies
COPY requirements.txt /tmp/
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r /tmp/requirements.txt

# Production stage
FROM python:3.11-slim as production

# Set production environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_ENVIRONMENT=production
ENV PATH="/opt/venv/bin:$PATH"

# Install runtime dependencies only
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        default-libmysqlclient-dev \
        libpq5 \
        curl \
        dumb-init \
    && rm -rf /var/lib/apt/lists/*

# Copy virtual environment from builder stage
COPY --from=builder /opt/venv /opt/venv

# Create app directory and user
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

# Set working directory
WORKDIR /app

# Create necessary directories
RUN mkdir -p /app/logs /app/staticfiles /app/media \
    && chown -R appuser:appgroup /app

# Copy application code
COPY --chown=appuser:appgroup . /app/

# Switch to non-root user
USER appuser

# Collect static files
RUN python manage.py collectstatic --noinput --clear

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health/ || exit 1

# Expose port
EXPOSE 8000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Run gunicorn server
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "--worker-class", "gevent", "--worker-connections", "1000", "--max-requests", "1000", "--max-requests-jitter", "100", "--preload", "--access-logfile", "-", "--error-logfile", "-", "rioclaro_api.wsgi:application"]
