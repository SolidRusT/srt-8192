# Variables
SHELL := /bin/bash
DOCKER_COMPOSE := docker compose
PROJECT_NAME := srt-8192
SERVICES := api-gateway game-logic ai-service data-integration economy leaderboard matchmaking notifications persistence rewards social tutorial user

# Colors for output
BLUE := \033[34m
GREEN := \033[32m
RED := \033[31m
RESET := \033[0m

# Default environment
ENV ?= dev
DOCKER_PROJECT := $(PROJECT_NAME)-$(ENV)

.PHONY: help build test test-all test-integration lint-all clean setup logs health-check generate-env

help: ## Show this help message
	@echo -e "$(BLUE)8192 Development Commands:$(RESET)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-30s$(RESET) %s\n", $$1, $$2}'

setup: ## Install dependencies and generate environment files
	@echo -e "$(BLUE)Setting up development environment...$(RESET)"
	npm install
	npm run generate:env
	@echo -e "$(GREEN)Setup complete$(RESET)"

generate-env: ## Generate environment files for all services
	@echo -e "$(BLUE)Generating environment files...$(RESET)"
	npm run generate:env
	@echo -e "$(GREEN)Environment files generated$(RESET)"

build: generate-env ## Build all services
	@echo -e "$(BLUE)Building all services...$(RESET)"
	$(DOCKER_COMPOSE) -p $(DOCKER_PROJECT) build
	@echo -e "$(GREEN)Build complete$(RESET)"

start: ## Start the development environment
	@echo -e "$(BLUE)Starting development environment...$(RESET)"
	$(DOCKER_COMPOSE) -p $(DOCKER_PROJECT) up -d
	@echo -e "$(GREEN)Environment started$(RESET)"

dev: build start ## Build and start development environment

stop: ## Stop the development environment
	@echo -e "$(BLUE)Stopping development environment...$(RESET)"
	$(DOCKER_COMPOSE) -p $(DOCKER_PROJECT) down
	@echo -e "$(GREEN)Environment stopped$(RESET)"

test: ## Run tests for a specific service (usage: make test SERVICE=ai-service)
	@if [ -z "$(SERVICE)" ]; then \
		echo -e "$(RED)Please specify a service: make test SERVICE=<service-name>$(RESET)"; \
		exit 1; \
	fi
	@echo -e "$(BLUE)Running tests for $(SERVICE)...$(RESET)"
	@if [ "$(SERVICE)" = "frontend" ]; then \
		cd frontend && npm test; \
	else \
		cd backend/services/$(SERVICE) && npm test; \
	fi

test-all: ## Run tests for all services
	@echo -e "$(BLUE)Running tests for all services...$(RESET)"
	npm test
	@echo -e "$(GREEN)All tests completed$(RESET)"

test-integration: ## Run integration tests
	@echo -e "$(BLUE)Running integration tests...$(RESET)"
	@for service in $(SERVICES); do \
		echo -e "$(BLUE)Running integration tests for $$service...$(RESET)"; \
		cd backend/services/$$service && npm run test:integration || exit 1; \
		cd ../../../; \
	done
	@echo -e "$(GREEN)Integration tests completed$(RESET)"

lint-all: ## Run linting for all services
	@echo -e "$(BLUE)Running linting for all services...$(RESET)"
	@cd frontend && npm run lint
	@for service in $(SERVICES); do \
		echo -e "$(BLUE)Linting $$service...$(RESET)"; \
		cd backend/services/$$service && npm run lint || exit 1; \
		cd ../../../; \
	done
	@echo -e "$(GREEN)Linting completed$(RESET)"

clean: ## Clean up containers, volumes, and images
	@echo -e "$(BLUE)Cleaning up development environment...$(RESET)"
	$(DOCKER_COMPOSE) -p $(DOCKER_PROJECT) down -v --rmi all
	@echo -e "$(GREEN)Cleanup complete$(RESET)"

logs: ## View logs for a specific service (usage: make logs SERVICE=ai-service)
	@if [ -z "$(SERVICE)" ]; then \
		$(DOCKER_COMPOSE) -p $(DOCKER_PROJECT) logs -f; \
	else \
		$(DOCKER_COMPOSE) -p $(DOCKER_PROJECT) logs -f $(SERVICE); \
	fi

health-check: ## Run health checks for all services
	@echo -e "$(BLUE)Running health checks...$(RESET)"
	@echo "Frontend (3000):"
	@curl -s http://localhost:3000/api/health || echo -e "$(RED)Failed$(RESET)"
	@echo "API Gateway (5000):"
	@curl -s http://localhost:5000/health || echo -e "$(RED)Failed$(RESET)"
	@for service in $(SERVICES); do \
		port=$$(docker-compose port $$service 5000 2>/dev/null | cut -d: -f2); \
		if [ ! -z "$$port" ]; then \
			echo "$$service ($$port):"; \
			curl -s http://localhost:$$port/health || echo -e "$(RED)Failed$(RESET)"; \
		fi \
	done
	@echo -e "$(GREEN)Health checks completed$(RESET)"

db-check: ## Check database connections
	@echo -e "$(BLUE)Checking database connections...$(RESET)"
	@echo "MongoDB status:"
	@docker exec -it $(DOCKER_PROJECT)-mongodb-1 mongosh --eval "db.adminCommand('ping')" || echo -e "$(RED)MongoDB check failed$(RESET)"
	@echo "Redis status:"
	@docker exec -it $(DOCKER_PROJECT)-redis-1 redis-cli ping || echo -e "$(RED)Redis check failed$(RESET)"
	@echo -e "$(GREEN)Database checks completed$(RESET)"

prod-test: ## Run production environment tests
	@echo -e "$(BLUE)Testing production build...$(RESET)"
	ENV=prod $(DOCKER_COMPOSE) -p $(PROJECT_NAME)-prod up -d
	@echo -e "$(GREEN)Production environment started$(RESET)"
	@make health-check
	@make db-check