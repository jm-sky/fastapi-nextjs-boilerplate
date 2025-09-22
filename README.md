# SaaS FastAPI React Boilerplate

Modern SaaS application boilerplate built with Next.js and FastAPI.

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

Start both servers concurrently:

**Frontend (port 3000):**
```bash
cd frontend
pnpm dev
```

**Backend (port 8000):**
```bash
cd backend
source .venv/bin/activate
fastapi dev main.py
```

The frontend proxy configuration automatically routes `/api/*` requests to the backend.

### Available Commands

#### Frontend
```bash
cd frontend
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript type checking
```

#### Backend
```bash
cd backend
source .venv/bin/activate
fastapi dev main.py   # Start development server
ruff check .         # Run linter
mypy .              # Run type checker
pytest              # Run tests (when implemented)
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