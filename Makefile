# Variables
SHELL := /bin/bash
DOCKER_COMPOSE := docker compose
PROJECT_NAME := future-earth
SERVICES := game-logic ai-service data-integration economy leaderboard matchmaking notifications

# Colors for output
BLUE := \033[34m
GREEN := \033[32m
RED := \033[31m
RESET := \033[0m

# Default environment
ENV ?= dev
DOCKER_PROJECT := $(PROJECT_NAME)-$(ENV)

.PHONY: help build test test-all test-integration lint-all clean setup logs health-check

help: ## Show this help message
	@echo -e "$(BLUE)Future Earth Testing Commands:$(RESET)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-30s$(RESET) %s\n", $$1, $$2}'

setup: ## Build base image and setup development environment
	@echo -e "$(BLUE)Building base service image...$(RESET)"
	cd backend/services/base && docker build -t srt-8192/base-service -f Dockerfile .
	@echo -e "$(GREEN)Base image built successfully$(RESET)"

build: setup ## Build all services
	@echo -e "$(BLUE)Building all services...$(RESET)"
	$(DOCKER_COMPOSE) -p $(DOCKER_PROJECT) build
	@echo -e "$(GREEN)Build complete$(RESET)"

start: ## Start the development environment
	@echo -e "$(BLUE)Starting development environment...$(RESET)"
	$(DOCKER_COMPOSE) -p $(DOCKER_PROJECT) up -d
	@echo -e "$(GREEN)Environment started$(RESET)"

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
	@cd backend/services/$(SERVICE) && npm test

test-all: ## Run tests for all services
	@echo -e "$(BLUE)Running tests for all services...$(RESET)"
	@for service in $(SERVICES); do \
		echo -e "$(BLUE)Testing $$service...$(RESET)"; \
		cd backend/services/$$service && npm test || exit 1; \
		cd ../../../; \
	done
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
	@for port in {5001..5007}; do \
		echo -e "Checking service on port $$port..."; \
		curl -s http://localhost:$$port/health || echo -e "$(RED)Failed$(RESET)"; \
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