.PHONY: help docker-up docker-down docker-logs docker-build docker-rebuild \
        test test-unit test-e2e test-full lint security-check clean

# Colors
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
NC := \033[0m # No Color

help:
	@echo "$(BLUE)RíoClaro - Available Commands$(NC)"
	@echo ""
	@echo "$(GREEN)Docker Commands:$(NC)"
	@echo "  make docker-up          Start all services"
	@echo "  make docker-down        Stop all services"
	@echo "  make docker-logs        Show service logs"
	@echo "  make docker-build       Build Docker images"
	@echo "  make docker-rebuild     Rebuild images (no cache)"
	@echo "  make docker-ps          Show running containers"
	@echo "  make docker-restart     Restart all services"
	@echo ""
	@echo "$(GREEN)Testing Commands:$(NC)"
	@echo "  make test               Run all tests"
	@echo "  make test-unit          Run unit tests only"
	@echo "  make test-e2e           Run E2E tests only"
	@echo "  make test-full          Run all tests sequentially"
	@echo ""
	@echo "$(GREEN)Code Quality:$(NC)"
	@echo "  make lint               Run ESLint"
	@echo "  make security-check     Run lint + coverage"
	@echo ""
	@echo "$(GREEN)Utilities:$(NC)"
	@echo "  make clean              Remove containers and volumes"
	@echo "  make help               Show this help message"

# Docker commands
docker-up:
	@echo "$(BLUE)Starting Docker services...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)✅ Services started$(NC)"
	@echo "   Frontend: http://localhost:5173"
	@echo "   Backend:  http://localhost:8000"
	@echo "   Admin:    http://localhost:8000/admin"

docker-down:
	@echo "$(BLUE)Stopping Docker services...$(NC)"
	docker-compose down
	@echo "$(GREEN)✅ Services stopped$(NC)"

docker-logs:
	docker-compose logs -f

docker-build:
	@echo "$(BLUE)Building Docker images...$(NC)"
	docker-compose build
	@echo "$(GREEN)✅ Build complete$(NC)"

docker-rebuild:
	@echo "$(BLUE)Rebuilding Docker images (no cache)...$(NC)"
	docker-compose build --no-cache
	@echo "$(GREEN)✅ Rebuild complete$(NC)"

docker-ps:
	docker-compose ps

docker-restart:
	@echo "$(BLUE)Restarting Docker services...$(NC)"
	docker-compose restart
	@echo "$(GREEN)✅ Services restarted$(NC)"

# Testing commands
test:
	pnpm test:run

test-unit:
	pnpm test:unit

test-e2e:
	pnpm test:e2e

test-full:
	@echo "$(BLUE)Running full test suite...$(NC)"
	pnpm test:full
	@echo "$(GREEN)✅ All tests passed$(NC)"

# Code quality
lint:
	pnpm lint

security-check:
	@echo "$(BLUE)Running security checks...$(NC)"
	pnpm security:check
	@echo "$(GREEN)✅ Security checks passed$(NC)"

# Utilities
clean:
	@echo "$(YELLOW)Removing containers and volumes...$(NC)"
	docker-compose down -v
	@echo "$(GREEN)✅ Cleanup complete$(NC)"

.DEFAULT_GOAL := help
