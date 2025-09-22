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

### 4. Setup shadcn/ui
**Status**: PENDING
**Cel**: `npx shadcn@latest init` + przykład komponentu

### 5. Konfiguracja i18n (EN/PL)
**Status**: PENDING
**Cel**: App Router i18n z next-intl

### 6. TanStack Query
**Status**: PENDING
**Cel**: Instalacja + przykładowe zapytanie do backend

### 7. Backend FastAPI
**Status**: PENDING
**Cel**: `.venv` + `fastapi[standard]` + `/health` endpoint

### 8. Dev setup test
**Status**: PENDING
**Cel**: Frontend + backend równocześnie

### 9. Linting/typecheck/testing
**Status**: PENDING
**Cel**: ESLint, TypeScript, ruff, mypy, **Playwright MCP**

### 10. Build verification
**Status**: PENDING

### 11-16. Auth features
**Status**: PENDING
**Cel**: JWT, login, password change, reCAPTCHA, OAuth

### 17. CI workflow
**Status**: PENDING

## Uwagi
- Zachowuję istniejące pliki (mogą być przydatne)
- Używam Playwright MCP do testów E2E
- Pinned dependencies dla stabilności