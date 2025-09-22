# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

All commands should be run from the project root directory. The project uses a workspace setup with pnpm for consistent command execution.

### Starting Development Servers
```bash
pnpm dev                 # Start both frontend (port 3000) and backend (port 8000) concurrently
pnpm dev:frontend        # Start only Next.js frontend with Turbopack
pnpm dev:backend         # Start only FastAPI backend with hot reload
```

### Code Quality and Testing
```bash
# Linting
pnpm lint                # ESLint for frontend
pnpm lint:backend        # ruff for backend

# Type checking
pnpm type-check          # TypeScript for frontend
pnpm type-check:backend  # mypy for backend

# Testing
pnpm test                # Playwright E2E tests (starts dev servers automatically)
pnpm test:backend        # pytest for backend (when implemented)

# Building
pnpm build               # Build frontend for production with Turbopack
```

### Running Individual Tests
```bash
cd frontend
pnpm test tests/example.spec.ts              # Run specific test file
pnpm test --headed                           # Run with browser visible
pnpm test --ui                               # Run with Playwright UI
```

## Architecture Overview

### Monorepo Structure
- **Frontend**: Next.js 15.5.3 with App Router in `frontend/` directory
- **Backend**: FastAPI 0.117.1 with factory pattern in `backend/` directory
- **Root**: Workspace configuration with unified scripts via pnpm

### Backend Architecture (FastAPI)

The backend follows a **factory pattern** with centralized configuration:

1. **Application Factory** (`backend/app/core/factory.py`):
   - `create_app(settings)` function creates and configures FastAPI app
   - Registers CORS middleware with settings-based origins
   - Includes API routers dynamically

2. **Settings Management** (`backend/app/core/settings.py`):
   - Uses `pydantic-settings` for environment-based configuration
   - Loads from `.env` file in backend directory
   - Provides typed configuration with defaults
   - Settings instance exported as singleton

3. **Entry Point** (`backend/main.py`):
   - Imports factory and settings
   - Creates app instance: `app = create_app(settings)`

4. **API Structure** (`backend/app/api/`):
   - Each module exports a router (e.g., `health.py`)
   - Routers registered in factory function

### Frontend Architecture (Next.js)

1. **App Router Structure**:
   - Uses Next.js 15 App Router in `frontend/src/app/`
   - TypeScript throughout with strict configuration

2. **API Integration**:
   - Proxy configuration in `next.config.ts` routes `/api/*` to backend
   - TanStack Query for server state management
   - No direct backend calls in frontend code

3. **Styling & Components**:
   - Tailwind CSS v4 with new syntax
   - shadcn/ui components in `frontend/src/components/ui/`
   - Component provider pattern for TanStack Query

4. **Internationalization**:
   - `next-intl` configured for EN/PL support
   - Integrated with App Router

### Key Integration Points

1. **Development Proxy**: Frontend proxy (`/api/*` → `http://127.0.0.1:8000/*`) enables seamless API calls
2. **CORS Configuration**: Backend CORS allows frontend origin (`http://localhost:3000`)
3. **Environment Configuration**: Backend `.env` file for settings, frontend uses Next.js env variables
4. **Testing**: Playwright tests can hit both frontend pages and API proxy endpoints

### Configuration Files

- **Backend Config**: `backend/.env` (copy from `.env.example`)
- **Frontend Config**: Environment variables and `next.config.ts`
- **Testing Config**: `frontend/playwright.config.ts` with webServer setup
- **Workspace Config**: Root `package.json` with pnpm workspace and scripts

### Current API Endpoints

- `GET /` - Root endpoint returning API info
- `GET /health` - Health check endpoint

When adding new API endpoints:
1. Create router in `backend/app/api/`
2. Register router in `factory.py`
3. Access via frontend proxy at `/api/{endpoint}`

### Environment Setup Notes

- Backend requires Python 3.13+ with virtual environment
- Frontend requires Node.js 18+ with pnpm
- All development commands run from project root
- Use workspace scripts to avoid directory navigation issues