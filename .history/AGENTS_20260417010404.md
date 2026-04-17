# Evaluation Repo

## Structure

```
evaluation/
├── backend/   # Laravel 13 API (PHP 8.4)
├── frontend/  # React 19 + Vite + TypeScript
└── docs/      # Requirements & specs
```

## Working Here

- **Backend Laravel work**: See `backend/AGENTS.md` for detailed Laravel-specific guidance (PHP 8.4, Laravel 13, Pint, PHPUnit, Boost MCP tools).
- **Frontend React work**: Commands below.

## Frontend Commands

```bash
cd frontend
npm run dev      # Start dev server (http://localhost:5173)
npm run build    # TypeScript + Vite build
npm run lint     # ESLint
npm run preview  # Preview production build
```

## Cross-Part Notes

- Tailwind v4 is used in both backend (Blade) and frontend (React)
- Both use `@tailwindcss/vite` plugin
- Backend: `composer run dev` runs Vite alongside Artisan
- Frontend: Runs independently on port 5173

## Key Tech Versions

| Part     | Tech       | Version |
| -------- | ---------- | ------- |
| Backend  | PHP        | 8.4     |
| Backend  | Laravel    | 13      |
| Backend  | PHPUnit    | 12      |
| Frontend | React      | 19      |
| Frontend | TypeScript | ~6.0    |
| Both     | Tailwind   | 4       |
