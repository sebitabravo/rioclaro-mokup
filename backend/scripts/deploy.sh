#!/bin/bash

# RioClaro Backend Deployment Script
# This script handles production deployment with zero-downtime

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="rioclaro-backend"
DOCKER_COMPOSE_FILE="docker-compose.production.yml"
BACKUP_DIR="/var/backups/rioclaro"
LOG_FILE="/var/log/rioclaro-deploy.log"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a $LOG_FILE
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a $LOG_FILE
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a $LOG_FILE
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."

    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed or not in PATH"
    fi

    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed or not in PATH"
    fi

    # Check if .env.production exists
    if [ ! -f ".env.production" ]; then
        error ".env.production file not found. Please create it from .env.example"
    fi

    # Check if required environment variables are set
    source .env.production
    if [ -z "$SECRET_KEY" ] || [ "$SECRET_KEY" = "CHANGE-THIS-TO-A-STRONG-SECRET-KEY-IN-PRODUCTION" ]; then
        error "SECRET_KEY not properly configured in .env.production"
    fi

    if [ -z "$DB_PASSWORD" ]; then
        error "DB_PASSWORD not set in .env.production"
    fi

    success "Prerequisites check passed"
}

# Create backup directory
create_backup_dir() {
    log "Creating backup directory..."
    sudo mkdir -p $BACKUP_DIR
    sudo chown $USER:$USER $BACKUP_DIR
}

# Backup database
backup_database() {
    log "Creating database backup..."

    BACKUP_FILE="$BACKUP_DIR/rioclaro_backup_$(date +%Y%m%d_%H%M%S).sql"

    # Only backup if there's an existing database
    if docker-compose -f $DOCKER_COMPOSE_FILE ps db | grep -q "Up"; then
        docker-compose -f $DOCKER_COMPOSE_FILE exec -T db pg_dump -U rioclaro_user rioclaro_production > $BACKUP_FILE

        if [ $? -eq 0 ]; then
            success "Database backup created: $BACKUP_FILE"
        else
            error "Database backup failed"
        fi
    else
        warning "No running database container found, skipping backup"
    fi
}

# Build and deploy
deploy() {
    log "Starting deployment..."

    # Pull latest images
    log "Pulling latest images..."
    docker-compose -f $DOCKER_COMPOSE_FILE pull

    # Build application
    log "Building application..."
    docker-compose -f $DOCKER_COMPOSE_FILE build --no-cache web

    # Start services
    log "Starting services..."
    docker-compose -f $DOCKER_COMPOSE_FILE up -d

    # Wait for database to be ready
    log "Waiting for database to be ready..."
    sleep 10

    # Run migrations
    log "Running database migrations..."
    docker-compose -f $DOCKER_COMPOSE_FILE exec web python manage.py migrate --noinput

    # Collect static files
    log "Collecting static files..."
    docker-compose -f $DOCKER_COMPOSE_FILE exec web python manage.py collectstatic --noinput --clear

    # Warm up cache
    log "Warming up cache..."
    docker-compose -f $DOCKER_COMPOSE_FILE exec web python manage.py warm_cache

    success "Deployment completed successfully"
}

# Health check
health_check() {
    log "Performing health check..."

    # Wait for application to start
    sleep 15

    # Check health endpoint
    if curl -f http://localhost/health/ > /dev/null 2>&1; then
        success "Health check passed"
    else
        error "Health check failed"
    fi

    # Check detailed health
    if curl -f http://localhost/health/detailed/ > /dev/null 2>&1; then
        success "Detailed health check passed"
    else
        warning "Detailed health check failed, but basic health is OK"
    fi
}

# Cleanup old images
cleanup() {
    log "Cleaning up old Docker images..."
    docker image prune -f
    docker volume prune -f
    success "Cleanup completed"
}

# Main deployment process
main() {
    log "========================================="
    log "Starting RioClaro Backend Deployment"
    log "========================================="

    check_prerequisites
    create_backup_dir
    backup_database
    deploy
    health_check
    cleanup

    success "========================================="
    success "Deployment completed successfully!"
    success "Application is running at: http://localhost"
    success "Health check: http://localhost/health/"
    success "Admin panel: http://localhost/admin/"
    success "========================================="
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "backup")
        check_prerequisites
        create_backup_dir
        backup_database
        ;;
    "health")
        health_check
        ;;
    "logs")
        docker-compose -f $DOCKER_COMPOSE_FILE logs -f web
        ;;
    "shell")
        docker-compose -f $DOCKER_COMPOSE_FILE exec web python manage.py shell
        ;;
    "migrate")
        docker-compose -f $DOCKER_COMPOSE_FILE exec web python manage.py migrate
        ;;
    "collectstatic")
        docker-compose -f $DOCKER_COMPOSE_FILE exec web python manage.py collectstatic --noinput
        ;;
    "warm-cache")
        docker-compose -f $DOCKER_COMPOSE_FILE exec web python manage.py warm_cache
        ;;
    "stop")
        docker-compose -f $DOCKER_COMPOSE_FILE down
        ;;
    "restart")
        docker-compose -f $DOCKER_COMPOSE_FILE restart
        ;;
    *)
        echo "Usage: $0 {deploy|backup|health|logs|shell|migrate|collectstatic|warm-cache|stop|restart}"
        exit 1
        ;;
esac