# PHC Evaluation System - Agent Instructions

## Project Structure

```
/                     → Root (monorepo)
/backend              → Laravel 13 API (PHP 8.5, Sanctum, MySQL)
/frontend             → React 19 + Vite + TypeScript + Tailwind
```

## Development Commands

**Backend:**
- `php artisan serve` - Start Laravel server on port 8000
- `php artisan test --compact` - Run PHPUnit tests
- `vendor/bin/pint --dirty --format agent` - Format PHP code
- `npm run dev` - Run Vite dev server (from backend dir)

**Frontend:**
- `cd frontend && npm run dev` - Start React dev server
- `cd frontend && npm run build` - Production build
- `cd frontend && npm run lint` - ESLint check

## Key Files

- `backend/AGENTS.md` → Laravel-specific rules (READ FIRST for backend work)
- `backend/AGENTS.md` contains: PHP 8.5, Laravel 13, Pint, PHPUnit, Laravel Boost tools

## Important Context

- This is a new PHC Evaluation System - not yet built
- Full task spec in: `~/.local/share/opencode/plans/phc_evaluation_system_plan.md`
- Stack: Laravel 13 + React 19 + MySQL + Tailwind CSS
- Database: MySQL (host: 127.0.0.1, port: 3306, db: evaluation_system)

## Agent Notes

- Use Laravel Boost tools for database operations (prefer `database-query` over raw SQL)
- Backend has extensive AGENTS.md - follow those rules strictly
- Frontend is minimal - may need additional packages (TanStack Query, Zustand, React Router)
- Both apps run independently; frontend proxies API to backend
- Images must use approved sources (Unsplash, picsum.photos) - NO Pexels (403 errors)