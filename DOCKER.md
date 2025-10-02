# Docker Development Setup

This document describes how to use Docker Compose for local development with PostgreSQL and Redis.

## Quick Start

```bash
# Start all services (backend, postgres, redis)
docker compose up -d

# Start with live reload (recommended for development)
docker compose watch

# Check status
docker compose ps

# View logs
docker compose logs -f

# Stop all services
docker compose down

# Stop and remove volumes (WARNING: deletes all data)
docker compose down -v
```

## Services

### Backend (FastAPI)
- **Image**: Built from `backend/Dockerfile` (Python 3.13-slim)
- **Port**: `8000`
- **Features**:
  - Hot reload with Docker watch mode
  - Auto-connects to PostgreSQL and Redis
  - Volume mount for live code updates

### PostgreSQL
- **Image**: `postgres:17-alpine`
- **Port**: `5432`
- **Database**: `saas_dev`
- **User**: `postgres`
- **Password**: `postgres`
- **Connection URL**: `postgresql+asyncpg://postgres:postgres@localhost:5432/saas_dev`

### Redis
- **Image**: `redis:7-alpine`
- **Port**: `6379`
- **Persistence**: Enabled (AOF)
- **Connection URL**: `redis://localhost:6379/0`

## Configuration

### For Docker Development

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Customize ports and credentials in `.env` as needed:
```env
# Service Ports
POSTGRES_PORT=5432
REDIS_PORT=6379
BACKEND_PORT=8000

# PostgreSQL Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=saas_dev

# Backend Environment
BACKEND_SECRET_KEY=your-secret-key-here
BACKEND_DEBUG=true
BACKEND_CORS_ORIGINS=http://localhost:3000
```

All values have sensible defaults in `compose.yaml`, so the `.env` file is optional.

### For Local Development (without Docker)
Update your `backend/.env` file with:

```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/saas_dev
REDIS_URL=redis://localhost:6379/0
```

## Data Persistence

Data is persisted in Docker volumes:
- `postgres_data` - PostgreSQL database files
- `redis_data` - Redis persistence files

To reset databases:
```bash
docker compose down -v
docker compose up -d
```

## Health Checks

Both services include health checks:
- PostgreSQL: `pg_isready` check every 10s
- Redis: `redis-cli ping` check every 10s

## Connecting to Services

### Backend Logs
```bash
docker compose logs -f backend
```

### PostgreSQL CLI
```bash
docker compose exec postgres psql -U postgres -d saas_dev
```

### Redis CLI
```bash
docker compose exec redis redis-cli
```

### Backend Shell
```bash
docker compose exec backend bash
```

## Production Notes

For production deployment:
1. Change default passwords in `compose.yaml`
2. Use environment variables for sensitive data
3. Configure backups for PostgreSQL
4. Set up Redis authentication
5. Use production-grade configuration
