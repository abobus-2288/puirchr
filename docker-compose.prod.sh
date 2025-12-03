#!/bin/bash

# Production Docker Compose Helper Script
# Usage: ./docker-compose.prod.sh [command]

set -e

COMPOSE_FILE="docker-compose.prod.yml"

case "$1" in
  up)
    echo "🚀 Starting production services..."
    docker-compose -f $COMPOSE_FILE up -d --build
    echo "✅ Services started!"
    echo "📊 View logs with: ./docker-compose.prod.sh logs"
    ;;
  down)
    echo "🛑 Stopping production services..."
    docker-compose -f $COMPOSE_FILE down
    echo "✅ Services stopped!"
    ;;
  restart)
    echo "🔄 Restarting production services..."
    docker-compose -f $COMPOSE_FILE restart
    echo "✅ Services restarted!"
    ;;
  logs)
    docker-compose -f $COMPOSE_FILE logs -f "${2:-}"
    ;;
  ps)
    docker-compose -f $COMPOSE_FILE ps
    ;;
  migrate)
    echo "🔄 Running database migrations..."
    docker-compose -f $COMPOSE_FILE exec backend php artisan migrate --force
    echo "✅ Migrations completed!"
    ;;
  cache-clear)
    echo "🧹 Clearing Laravel cache..."
    docker-compose -f $COMPOSE_FILE exec backend php artisan cache:clear
    docker-compose -f $COMPOSE_FILE exec backend php artisan config:clear
    docker-compose -f $COMPOSE_FILE exec backend php artisan route:clear
    docker-compose -f $COMPOSE_FILE exec backend php artisan view:clear
    echo "✅ Cache cleared!"
    ;;
  cache-optimize)
    echo "⚡ Optimizing Laravel cache..."
    docker-compose -f $COMPOSE_FILE exec backend php artisan config:cache
    docker-compose -f $COMPOSE_FILE exec backend php artisan route:cache
    docker-compose -f $COMPOSE_FILE exec backend php artisan view:cache
    echo "✅ Cache optimized!"
    ;;
  shell-backend)
    docker-compose -f $COMPOSE_FILE exec backend sh
    ;;
  shell-frontend)
    docker-compose -f $COMPOSE_FILE exec frontend sh
    ;;
  backup-db)
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
    echo "💾 Creating database backup: $BACKUP_FILE"
    docker-compose -f $COMPOSE_FILE exec -T postgres pg_dump -U ${DB_USERNAME:-postgres} ${DB_DATABASE:-postgres} > "$BACKUP_FILE"
    echo "✅ Backup created: $BACKUP_FILE"
    ;;
  *)
    echo "Usage: $0 {up|down|restart|logs|ps|migrate|cache-clear|cache-optimize|shell-backend|shell-frontend|backup-db}"
    echo ""
    echo "Commands:"
    echo "  up              - Build and start all services"
    echo "  down            - Stop all services"
    echo "  restart         - Restart all services"
    echo "  logs [service]  - View logs (optionally for specific service)"
    echo "  ps              - Show running services"
    echo "  migrate         - Run database migrations"
    echo "  cache-clear     - Clear all Laravel caches"
    echo "  cache-optimize  - Optimize Laravel caches"
    echo "  shell-backend   - Open shell in backend container"
    echo "  shell-frontend  - Open shell in frontend container"
    echo "  backup-db       - Create database backup"
    exit 1
    ;;
esac

