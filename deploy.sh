#!/bin/bash

# RíoClaro Deployment Script
# Usage: ./deploy.sh [dev|prod] [options]
#
# This script handles deployment for both development and production environments
# with proper environment configuration and Docker orchestration.

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script configuration
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_NAME="rioclaro"
COMPOSE_FILE="docker/docker-compose.yml"
PRODUCTION_COMPOSE_FILE="docker/docker-compose.production.yml"

# Default values
ENVIRONMENT="dev"
ACTION="up"
BUILD_FRESH=false
SHOW_LOGS=false
BACKGROUND=false

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

show_help() {
    cat << EOF
RíoClaro Deployment Script

USAGE:
    ./deploy.sh [ENVIRONMENT] [ACTION] [OPTIONS]

ENVIRONMENTS:
    dev         Development environment (default)
    prod        Production environment

ACTIONS:
    up          Start services (default)
    down        Stop services
    restart     Restart services
    build       Build images only
    logs        Show service logs
    status      Show service status
    backup      Create database backup
    restore     Restore database from backup

OPTIONS:
    --build     Force rebuild of images
    --fresh     Clean start (remove volumes)
    --logs      Show logs after startup
    --bg        Run in background (no logs)
    --help      Show this help message

EXAMPLES:
    ./deploy.sh dev                    # Start development environment
    ./deploy.sh prod up --build        # Start production with fresh build
    ./deploy.sh dev restart --logs     # Restart dev and show logs
    ./deploy.sh prod backup            # Create production backup
    ./deploy.sh down                   # Stop all services

ENVIRONMENT FILES:
    Development: .env.development
    Production:  .env.production

EOF
}

check_requirements() {
    log_info "Checking requirements..."

    # Check if Docker is installed and running
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! docker info &> /dev/null; then
        log_error "Docker is not running. Please start Docker first."
        exit 1
    fi

    # Check if docker-compose is available
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not available. Please install Docker Compose."
        exit 1
    fi

    log_success "Requirements check passed"
}

setup_environment() {
    local env="$1"

    log_info "Setting up $env environment..."

    # Set environment variable for Django
    export DJANGO_ENVIRONMENT="$env"

    # Check if environment file exists
    if [ "$env" = "production" ]; then
        ENV_FILE=".env.production"
    else
        ENV_FILE=".env.development"
    fi

    if [ ! -f "$ENV_FILE" ]; then
        log_error "Environment file $ENV_FILE not found!"
        log_info "Please create $ENV_FILE based on the template."
        exit 1
    fi

    # Load environment variables
    set -a  # automatically export all variables
    source "$ENV_FILE"
    set +a

    log_success "Environment $env configured"
}

get_compose_command() {
    local env="$1"

    # Determine compose command
    if command -v docker-compose &> /dev/null; then
        COMPOSE_CMD="docker-compose"
    else
        COMPOSE_CMD="docker compose"
    fi

    # Set compose files
    if [ "$env" = "production" ]; then
        if [ -f "$PRODUCTION_COMPOSE_FILE" ]; then
            COMPOSE_FILES="-f $COMPOSE_FILE -f $PRODUCTION_COMPOSE_FILE"
        else
            COMPOSE_FILES="-f $COMPOSE_FILE"
        fi
    else
        COMPOSE_FILES="-f $COMPOSE_FILE"
    fi

    echo "$COMPOSE_CMD $COMPOSE_FILES"
}

create_backup() {
    local env="$1"
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="backup_${env}_${timestamp}.sql"

    log_info "Creating database backup for $env environment..."

    setup_environment "$env"
    local compose_cmd=$(get_compose_command "$env")

    # Create backup directory if it doesn't exist
    mkdir -p backups

    # Create database backup
    if [ "$env" = "production" ]; then
        $compose_cmd exec -T mysql mysqldump -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" > "backups/$backup_file"
    else
        # For development with SQLite, copy the database file
        if [ -f "backend/db.sqlite3" ]; then
            cp "backend/db.sqlite3" "backups/db_${timestamp}.sqlite3"
            backup_file="db_${timestamp}.sqlite3"
        else
            log_warning "No SQLite database found for development backup"
            return 1
        fi
    fi

    log_success "Backup created: backups/$backup_file"
}

restore_backup() {
    local env="$1"
    local backup_file="$2"

    if [ -z "$backup_file" ]; then
        log_error "Please specify backup file to restore"
        log_info "Available backups:"
        ls -la backups/ || log_info "No backups found"
        exit 1
    fi

    if [ ! -f "backups/$backup_file" ]; then
        log_error "Backup file backups/$backup_file not found"
        exit 1
    fi

    log_warning "This will overwrite the current database!"
    read -p "Are you sure you want to continue? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Restore cancelled"
        exit 0
    fi

    log_info "Restoring database from backups/$backup_file..."

    setup_environment "$env"
    local compose_cmd=$(get_compose_command "$env")

    if [ "$env" = "production" ]; then
        $compose_cmd exec -T mysql mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "backups/$backup_file"
    else
        # For development with SQLite
        if [[ "$backup_file" == *.sqlite3 ]]; then
            cp "backups/$backup_file" "backend/db.sqlite3"
        else
            log_error "Invalid backup file for development environment"
            exit 1
        fi
    fi

    log_success "Database restored from backups/$backup_file"
}

deploy_services() {
    local env="$1"
    local action="$2"

    setup_environment "$env"
    local compose_cmd=$(get_compose_command "$env")

    case "$action" in
        "up")
            log_info "Starting $env environment services..."

            if [ "$BUILD_FRESH" = true ]; then
                log_info "Building images..."
                $compose_cmd build --no-cache
            elif [ "$BUILD_IMAGES" = true ]; then
                log_info "Building images..."
                $compose_cmd build
            fi

            if [ "$CLEAN_START" = true ]; then
                log_warning "Removing existing volumes (clean start)..."
                $compose_cmd down -v
            fi

            # Start services
            if [ "$BACKGROUND" = true ]; then
                $compose_cmd up -d
            else
                $compose_cmd up -d
                if [ "$SHOW_LOGS" = true ]; then
                    $compose_cmd logs -f
                fi
            fi

            log_success "$env environment started successfully"
            ;;

        "down")
            log_info "Stopping $env environment services..."
            $compose_cmd down
            log_success "$env environment stopped"
            ;;

        "restart")
            log_info "Restarting $env environment services..."
            $compose_cmd restart
            if [ "$SHOW_LOGS" = true ]; then
                $compose_cmd logs -f
            fi
            log_success "$env environment restarted"
            ;;

        "build")
            log_info "Building $env environment images..."
            if [ "$BUILD_FRESH" = true ]; then
                $compose_cmd build --no-cache
            else
                $compose_cmd build
            fi
            log_success "Images built successfully"
            ;;

        "logs")
            log_info "Showing $env environment logs..."
            $compose_cmd logs -f
            ;;

        "status")
            log_info "$env environment status:"
            $compose_cmd ps
            ;;

        *)
            log_error "Unknown action: $action"
            show_help
            exit 1
            ;;
    esac
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        dev|development)
            ENVIRONMENT="development"
            shift
            ;;
        prod|production)
            ENVIRONMENT="production"
            shift
            ;;
        up|down|restart|build|logs|status)
            ACTION="$1"
            shift
            ;;
        backup)
            ACTION="backup"
            shift
            ;;
        restore)
            ACTION="restore"
            BACKUP_FILE="$2"
            shift 2
            ;;
        --build)
            BUILD_IMAGES=true
            shift
            ;;
        --fresh)
            BUILD_FRESH=true
            CLEAN_START=true
            shift
            ;;
        --logs)
            SHOW_LOGS=true
            shift
            ;;
        --bg|--background)
            BACKGROUND=true
            shift
            ;;
        --help|-h)
            show_help
            exit 0
            ;;
        *)
            log_error "Unknown parameter: $1"
            show_help
            exit 1
            ;;
    esac
done

# Main execution
main() {
    log_info "RíoClaro Deployment Script Starting..."
    log_info "Environment: $ENVIRONMENT"
    log_info "Action: $ACTION"

    check_requirements

    case "$ACTION" in
        "backup")
            create_backup "$ENVIRONMENT"
            ;;
        "restore")
            restore_backup "$ENVIRONMENT" "$BACKUP_FILE"
            ;;
        *)
            deploy_services "$ENVIRONMENT" "$ACTION"
            ;;
    esac

    log_success "Deployment script completed successfully!"
}

# Run main function
main