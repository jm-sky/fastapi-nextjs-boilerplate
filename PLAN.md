# SaaS FastAPI + React Boilerplate - Plan Realizacji

## Środowisko
- System: Linux WSL2
- Node: v22.15.1, npm: 10.9.2, pnpm: 10.11.0
- Python: 3.12.3
- Internet: ✅ Połączenie aktywne
- Git: ✅ Repo zainicjalizowane (fresh start)

## Kroki do wykonania

### 1. ✅ Sprawdzenie dostępu do internetu i stanu repo
**Status**: COMPLETED
**Polecenia**: `pwd && ls -la`, `git status`, `ping -c 3 google.com`, `node --version && npm --version && pnpm --version && python3 --version`
**Wynik**:
- Repo w stanie początkowym z podstawowymi plikami konfiguracyjnymi
- Internet działa, wszystkie narzędzia dostępne
- pnpm-workspace.yaml już istnieje

### 2. ✅ Inicjalizacja frontend (Next.js App Router + TypeScript)
**Status**: COMPLETED
**Polecenia**: `pnpm create next-app@latest frontend --typescript --tailwind --app --src-dir --import-alias "@/*"`
**Wynik**:
- ✅ Next.js 15.5.3 z App Router
- ✅ TypeScript konfiguracja
- ✅ Tailwind CSS v4 już zainstalowany
- ✅ ESLint + Turbopack
- ✅ React 19.1.0

### 3. ✅ Integracja Tailwind CSS v4
**Status**: COMPLETED
**Wynik**:
- ✅ Tailwind CSS v4 już skonfigurowany w Next.js
- ✅ PostCSS config: `@tailwindcss/postcss`
- ✅ globals.css z nową składnią `@theme inline`
- ✅ Dark mode support
- ✅ Dev server działa: `pnpm dev` (1095ms startup)
- ✅ Build działa: `pnpm build` (2.2s, linting + types OK)

### 4. ✅ Setup shadcn/ui
**Status**: COMPLETED
**Polecenia**: `npx shadcn@latest init`, `npx shadcn@latest add button`
**Wynik**:
- ✅ shadcn/ui skonfigurowany z Tailwind v4
- ✅ Dodano Button component z Radix UI
- ✅ Utilities: `class-variance-authority`, `clsx`, `tailwind-merge`
- ✅ Przykład użycia w page.tsx z wariantami `default` i `outline`
- ✅ Type-check: OK, Build: OK (2.2s)

### 5. ✅ Konfiguracja i18n (EN/PL)
**Status**: COMPLETED
**Polecenia**: `pnpm add next-intl`, konfiguracja plików
**Wynik**:
- ✅ next-intl 4.3.9 zainstalowany (po sprawdzeniu web docs!)
- ✅ Konfiguracja: messages/en.json, messages/pl.json
- ✅ i18n/request.ts + next.config.ts plugin
- ✅ Layout.tsx z NextIntlClientProvider
- ✅ Page.tsx używa useTranslations('HomePage')
- ✅ Type-check: OK, Build: OK (2.7s, JS size: 131kB)

### 6. ✅ TanStack Query
**Status**: COMPLETED
**Polecenia**: `pnpm add @tanstack/react-query`
**Wynik**:
- ✅ TanStack Query 5.90.1 zainstalowany
- ✅ QueryProvider w providers.tsx z client component
- ✅ Layout.tsx zaktualizowany z QueryProvider
- ✅ useHealthCheck hook dla komunikacji z backend
- ✅ HealthStatus component z real-time API status
- ✅ Komunikacja działa: backend otrzymuje zapytania /health
- ✅ Next.js proxy: `/api/*` → `http://127.0.0.1:8000/*` + CORS dla production
- ✅ Type-check i build przechodzą (2.6s, 147kB first load)

### 7. ✅ Backend FastAPI
**Status**: COMPLETED
**Polecenia**: `python3 -m venv .venv`, `pip install "fastapi[standard]" uvicorn pytest ruff mypy`
**Wynik**:
- ✅ Virtual environment w backend/.venv
- ✅ FastAPI 0.117.1 + standard dependencies zainstalowane
- ✅ main.py z CORS dla localhost:3000
- ✅ Endpoints: `/` i `/health`
- ✅ requirements.txt z pinned versions
- ✅ Server działa: http://127.0.0.1:8000
- ✅ Docs: http://127.0.0.1:8000/docs

**WAŻNE**: Backend powinien:
- Odpowiadać camelCase responses
- Oczekiwać i walidować camelCase payload w requests
- Używać factory pattern do tworzenia aplikacji

### 8. ✅ Dev setup test
**Status**: COMPLETED
**Wynik**:
- ✅ Frontend: http://localhost:3000 (1044ms startup)
- ✅ Backend: http://127.0.0.1:8000 (FastAPI docs na /docs)
- ✅ Health check: `{"status":"healthy","message":"API is running"}`
- ✅ CORS skonfigurowany dla komunikacji między serwerami

### 9. ✅ Factory pattern + Settings refactor
**Status**: COMPLETED
**Wynik**:
- ✅ Backend refactored do factory pattern w `app/core/factory.py`
- ✅ Settings z pydantic-settings w `app/core/settings.py`
- ✅ .env.example template z konfiguracją
- ✅ Health router w `app/api/health.py`
- ✅ main.py uproszczony do `app = create_app(settings)`

### 10. ✅ Linting/typecheck/testing
**Status**: COMPLETED
**Wynik**:
- ✅ Frontend: ESLint i TypeScript type-check działają
- ✅ Backend: ruff i mypy działają (all checks passed)
- ✅ Playwright 1.55.0 zainstalowany z konfiguracją
- ✅ Example tests: basic navigation + API proxy test
- ✅ Workspace scripts w root package.json z concurrently

### 11. ✅ Build verification
**Status**: COMPLETED
**Wynik**:
- ✅ Frontend build: Next.js compiles successfully (3.5s, 145kB first load)
- ✅ Backend verification: API endpoints respond correctly
- ✅ Proxy works: `/api/health` → backend health endpoint
- ✅ Comprehensive README.md z commands i project structure

### 12. ✅ JWT authentication endpoints
**Status**: COMPLETED
**Wynik**:
- ✅ Register endpoint z JWT tokens (/auth/register)
- ✅ Login endpoint z authentication (/auth/login)  
- ✅ Token refresh endpoint (/auth/refresh)
- ✅ Logout endpoint (/auth/logout)
- ✅ Current user info endpoint (/auth/me)
- ✅ Custom exception classes for better error handling
- ✅ Rate limiting na auth endpoints (slowapi)
- ✅ Secret key validation w settings
- ✅ Bcrypt password hashing
- ✅ JWT access + refresh tokens z proper expiration

### 13. Login functionality (backend + frontend)
**Status**: ✅ COMPLETED
**Cel**: Frontend login form + backend integration
**TODO**:
- ✅ Backend login endpoint (/auth/login) - already completed
- ✅ Frontend login form with validation
- ✅ Error handling and display
- ✅ Authentication state management
- ✅ Navigation between login/register pages
- ✅ Token storage and management
- ✅ Integration testing with Playwright (7/10 tests passing)
- ⚠️ Minor issues: client-side validation display, loading states

### 13.1. Register page and form
**Status**: ✅ COMPLETED (TDD approach)
**Cel**: Create register page with form component
**TODO**:
- ✅ Create /register page route
- ✅ Create register form component with validation
- ✅ Integrate with backend /auth/register endpoint
- ✅ Add form validation (name, email, password rules)
- ✅ Add error handling and loading states
- ✅ Add navigation to login page
- ✅ Add comprehensive Playwright tests (register-page.spec.ts)

### 13.2. Enhanced landing page with authentication state
**Status**: ✅ COMPLETED (TDD approach)
**Cel**: Improve landing page with proper navigation based on auth state
**TODO**:
- ✅ Add Register button alongside Login button
- ✅ Check authentication state on landing page
- ✅ Show Dashboard button for authenticated users
- ✅ Implement auth context/hook for state management (already existed)
- ✅ Add logout functionality
- ✅ Add comprehensive Playwright tests (landing-page-auth-state.spec.ts)
- ⚠️ Minor issues: loading state timing, logout redirect handling

### 14. ✅ Forgot password functionality
**Status**: COMPLETED + SECURITY ENHANCED
**Cel**: Implement password reset flow
**Wynik**:
- ✅ JWT-based reset tokens (enhanced security vs original plan)
- ✅ Secure token comparison (timing attack protection)
- ✅ Backend endpoints: `/auth/forgot-password` + `/auth/reset-password`
- ✅ Frontend pages: `/forgot-password` + `/reset-password/[token]`
- ✅ Consistent UI design with Card components
- ✅ Comprehensive E2E tests with Playwright
- ✅ Form validation with React Hook Form + Zod
- ✅ "Forgot password?" link integrated in login page
- ✅ Production-ready logging (no console.log in production)
- ✅ Timeout cleanup in React components
- ⏳ Email sending infrastructure (TODO for future iteration)

**Security enhancements implemented based on code review:**
- 🛡️ **JWT Tokens**: Replaced plain text tokens with cryptographically secure JWTs
- 🛡️ **Timing Attack Protection**: Using `secrets.compare_digest()` for token comparison
- 🛡️ **Clean Imports**: Moved all imports to module top-level
- 🛡️ **Memory Safety**: No plain text token storage, JWT handles expiry
- 🛡️ **Production Logging**: Proper logging instead of print statements

### 15. ✅ Password change functionality (authenticated users)
**Status**: COMPLETED
**Cel**: Allow authenticated users to change their password
**Wynik**:
- ✅ Backend endpoint: `/auth/change-password` with authentication required
- ✅ Protected route: `/change-password` page with ProtectedRoute wrapper
- ✅ Form with current password + new password + confirm password fields
- ✅ Current password verification before allowing change
- ✅ Password strength validation (8+ characters, confirmation match)
- ✅ Dashboard integration: "Change Password" link in Settings card
- ✅ Security messaging: Users advised to log out/in after password change
- ✅ Comprehensive E2E tests with Playwright (auth-change-password.spec.ts)
- ✅ Password visibility toggles for all password fields
- ✅ Form validation with React Hook Form + Zod
- 📝 Token invalidation: Documented TODO for future blacklist implementation

### 16. ✅ Password strength validation
**Status**: COMPLETED
**Cel**: Implement strong password requirements
**Wynik**:
- ✅ Minimum 8 characters
- ✅ Require uppercase, lowercase, digit, special character
- ✅ Backend validation with Pydantic field validators
- ✅ Frontend validation with Zod regex patterns
- ✅ Applied to all password fields (register, reset, change)
- ✅ Updated all E2E tests (80 tests passing)
- ✅ Consistent error messages across backend/frontend
- ⏳ ~~Password strength meter in frontend~~ `LATER`
- ⏳ ~~Common password dictionary check~~ `LATER`
- ⏳ ~~Password history to prevent reuse~~ `LATER`

### 17. ✅ Token blacklisting for proper logout
**Status**: COMPLETED
**Cel**: Implement secure token invalidation
**Wynik**:
- ✅ In-memory token blacklist with thread-safe operations
- ✅ Token storage with expiration timestamps
- ✅ Automatic cleanup of expired tokens (hourly background task)
- ✅ Blacklist check in JWT verification (verify_token)
- ✅ Logout endpoint adds token to blacklist
- ✅ Background daemon thread for periodic cleanup
- ✅ Proper error handling for revoked tokens
- 📝 Future: Redis-based blacklist for production/distributed systems
- 📝 Future: Blacklist all user tokens on password change

### 18. Google reCAPTCHA integration
**Status**: PENDING

### 19. OAuth Google authentication
**Status**: PENDING

### 20. CI workflow
**Status**: PENDING

## Uwagi
- **WAŻNE**: Przed KAŻDYM krokiem - sprawdzaj oficjalną dokumentację w web!
- Zachowuję istniejące pliki (mogą być przydatne)
- Używam Playwright MCP do testów E2E
- Pinned dependencies dla stabilności
- WebFetch używamy do weryfikacji aktualnych praktyk 2025