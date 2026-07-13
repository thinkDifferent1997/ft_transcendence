# ============================================================
#   ft_transcendence — Makefile
#   Run `make help` to see what's available.
# ============================================================

COMPOSE       := docker compose
COMPOSE_PROD  := -f docker-compose.yml
COMPOSE_DEV   := -f docker-compose.yml -f docker-compose.dev.yml

CERT_DIR      := nginx/certs
CERT_KEY      := $(CERT_DIR)/selfsigned.key
CERT_CRT      := $(CERT_DIR)/selfsigned.crt

# Default goal when running `make` with no args
.DEFAULT_GOAL := help

# ============================================================
#   Help
# ============================================================

help: ## Show this help message
	@echo ""
	@echo "  ft_transcendence — available targets:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "    \033[36m%-14s\033[0m %s\n", $$1, $$2}'
	@echo ""

# ============================================================
#   First-time setup
# ============================================================

env: ## Create .env from .env.example if it does not exist
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo ".env created from .env.example — review it before running!"; \
	else \
		echo ".env already exists, skipping."; \
	fi

certs: $(CERT_CRT) ## Generate self-signed TLS certificates (idempotent)

$(CERT_CRT):
	@mkdir -p $(CERT_DIR)
	@echo "Generating self-signed certificates in $(CERT_DIR)..."
	@openssl req -x509 -nodes -newkey rsa:4096 \
		-keyout $(CERT_KEY) \
		-out $(CERT_CRT) \
		-days 365 \
		-subj "/C=FR/ST=IDF/L=Paris/O=42/OU=ft_transcendence/CN=localhost" \
		2>/dev/null
	@echo "Certificates ready."

# ============================================================
#   Production / evaluation (single-command requirement)
# ============================================================

up: env certs ## Build and start the stack in detached mode
	$(COMPOSE) $(COMPOSE_PROD) up --build -d
	@echo ""
	@echo "  Stack is up. Open https://localhost"
	@echo "  (Self-signed cert — your browser will warn, that's expected.)"
	@echo ""

down: ## Stop the stack (keeps volumes)
	$(COMPOSE) $(COMPOSE_PROD) down

re: down up ## Restart the stack from scratch

# ============================================================
#   Development (hot reload, bind mounts)
#   Requires docker-compose.dev.yml — to be added later.
# ============================================================

dev: env certs ## Start the stack in development mode (foreground, hot reload)
	$(COMPOSE) $(COMPOSE_DEV) up --build

dev-down: ## Stop the dev stack
	$(COMPOSE) $(COMPOSE_DEV) down

# ============================================================
#   Dev workflow shortcuts
# ============================================================

test-backend: ## Run backend tests
	$(COMPOSE) $(COMPOSE_DEV) exec backend npm test

test-frontend: ## Run frontend tests
	$(COMPOSE) $(COMPOSE_DEV) exec frontend npm test

lint-backend: ## Lint backend
	$(COMPOSE) $(COMPOSE_DEV) exec backend npm run lint

lint-frontend: ## Lint frontend
	$(COMPOSE) $(COMPOSE_DEV) exec frontend npm run lint

sh-backend: ## Open a shell inside the backend container
	$(COMPOSE) $(COMPOSE_DEV) exec backend sh

sh-frontend: ## Open a shell inside the frontend container
	$(COMPOSE) $(COMPOSE_DEV) exec frontend sh

sh-db: ## Open psql inside the postgres container
	$(COMPOSE) $(COMPOSE_DEV) exec postgres psql -U $$POSTGRES_USER -d $$POSTGRES_DB

# ============================================================
#   Database (Prisma)
# ============================================================

migrate: ## Apply pending migrations inside the backend container
	$(COMPOSE) $(COMPOSE_PROD) exec backend npx prisma migrate deploy

migrate-dev: ## Create a new migration from schema changes (dev only)
	$(COMPOSE) $(COMPOSE_DEV) exec backend npx prisma migrate dev

studio: ## Open Prisma Studio (browse the DB)
	$(COMPOSE) $(COMPOSE_DEV) exec backend npx prisma studio

# ============================================================
#   Inspection
# ============================================================

logs: ## Tail logs from all services
	$(COMPOSE) $(COMPOSE_PROD) logs -f

ps: ## List running containers
	$(COMPOSE) $(COMPOSE_PROD) ps

# ============================================================
#   Cleanup
# ============================================================

clean: ## Stop everything and remove named volumes (wipes the DB!)
	$(COMPOSE) $(COMPOSE_DEV) down -v 2>/dev/null || true
	$(COMPOSE) $(COMPOSE_PROD) down -v

fclean: clean ## Full clean: also remove certs and prune Docker images
	rm -rf $(CERT_DIR)
	rm -rf backend/node_modules frontend/node_modules
	rm -rf backend/dist
	docker system prune -af

.PHONY: help env certs up down re dev dev-down migrate migrate-dev studio logs \
	ps clean fclean test-backend test-frontend lint-backend lint-frontend \
	sh-backend sh-frontend sh-db
