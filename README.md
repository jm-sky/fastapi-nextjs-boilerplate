# SaaS FastAPI React Boilerplate

Modern SaaS application boilerplate built with Next.js and FastAPI.

<img width="1247" height="721" alt="obraz" src="https://github.com/user-attachments/assets/a53cb3cf-0f56-4292-bd7b-a1c9ce5f3bf1" />


## Tech Stack

### Frontend
- **Next.js 15.5.3** with App Router and Turbopack
- **TypeScript** for type safety
- **Tailwind CSS v4** for styling
- **shadcn/ui** for UI components
- **TanStack Query** for server state management
- **next-intl** for internationalization (EN/PL)

### Backend
- **FastAPI 0.117.1** with Python 3.13
- **Pydantic Settings** for configuration management
- **Factory pattern** for application structure
- **CORS** configured for development and production

## Getting Started

### Prerequisites
- Node.js 18+ with pnpm
- Python 3.13+
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd saas-fastapi-react-boilerplate
```

2. Install frontend dependencies:
```bash
cd frontend
pnpm install
```

3. Setup backend environment:
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

4. Configure environment variables:
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your settings
```

### Development

All commands run from the project root for consistency and ease of use.

**Start both servers concurrently:**
```bash
pnpm dev
```

**Or start individually:**
```bash
pnpm dev:frontend    # Frontend only (port 3000)
pnpm dev:backend     # Backend only (port 8000)
```

The frontend proxy configuration automatically routes `/api/*` requests to the backend.

### Available Commands

All commands should be run from the project root directory:

#### Development
```bash
pnpm dev                 # Start both frontend and backend
pnpm dev:frontend        # Start frontend dev server only
pnpm dev:backend         # Start backend dev server only
```

#### Building & Production
```bash
pnpm build               # Build frontend for production
pnpm --filter frontend start  # Start production frontend server
```

#### Code Quality
```bash
# Frontend
pnpm lint                # Run ESLint on frontend
pnpm type-check          # Run TypeScript type checking

# Backend
pnpm lint:backend        # Run ruff linter on backend
pnpm type-check:backend  # Run mypy type checking on backend
```

#### Testing
```bash
pnpm test                # Run Playwright E2E tests
pnpm test:backend        # Run backend pytest (when implemented)
```

## Project Structure

```
├── frontend/          # Next.js application
│   ├── src/
│   │   ├── app/      # App Router pages
│   │   ├── components/ # React components
│   │   └── lib/      # Utilities
│   └── package.json
├── backend/           # FastAPI application
│   ├── app/
│   │   ├── api/      # API routes
│   │   ├── core/     # Core configuration
│   │   └── models/   # Data models (future)
│   ├── main.py       # Application entry point
│   └── requirements.txt
└── README.md
```

## Features

- ✅ Modern Next.js with App Router
- ✅ TypeScript throughout
- ✅ Tailwind CSS v4 with shadcn/ui
- ✅ FastAPI with factory pattern
- ✅ Environment-based configuration
- ✅ Development proxy setup
- ✅ Linting and type checking
- ✅ Playwright E2E testing setup
- ✅ Workspace scripts for easy development
- 🚧 Authentication (JWT + OAuth)
- 🚧 Database integration
- 🚧 Testing setup
- 🚧 CI/CD pipeline

## API Endpoints

- `GET /` - Root endpoint
- `GET /health` - Health check

## Contributing

1. Follow the existing code style
2. Run linting and type checking before commits
3. Test your changes thoroughly

## License

MIT License
