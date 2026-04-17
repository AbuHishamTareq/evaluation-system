# PHC Evaluation & Quality Management SaaS

> Primary Healthcare Centers — Saudi Arabia

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Backend | Laravel | 13.x |
| Backend | PHP | 8.4 |
| Frontend | React | 19.x |
| Frontend | TypeScript | ~6.0 |
| Frontend | Vite | 8.x |
| Styling | Tailwind CSS | 4.x |
| Database | MySQL | 8.0 |
| Cache/Queue | Redis | 7.x |
| DevOps | Docker Compose | 3.9 |

## Project Structure

```
evaluation/
├── backend/          # Laravel 13 API
├── frontend/         # React 19 PWA
├── docker/           # Docker configs
├── docs/             # Requirements & specs
│   ├── plan/         # Implementation plans
│   └── specs/        # Requirements docs
├── .github/workflows/# CI/CD pipeline
└── docker-compose.yml
```

## Quick Start

### Prerequisites

- Docker & Docker Compose
- PHP 8.4+, Composer
- Node.js 20+, npm

### Local Development

```bash
# Navigate to project
cd evaluation

# Copy environment file
cp backend/.env.example backend/.env

# Start Docker services
docker compose up -d

# Install backend dependencies
cd backend && composer install

# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate

# Install frontend dependencies
cd ../frontend && npm install
```

### Running Development Servers

```bash
# Terminal 1: Backend (Laravel)
cd backend && php artisan serve

# Terminal 2: Frontend (Vite)
cd frontend && npm run dev
```

Access points:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api/v1
- Nginx: http://localhost:8080

### Docker Workflow

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down

# Rebuild containers
docker compose build --no-cache
```

## Available Commands

### Backend

| Command | Description |
|---------|-------------|
| `php artisan serve` | Start development server |
| `php artisan test` | Run PHPUnit tests |
| `php artisan migrate` | Run database migrations |
| `php artisan db:seed` | Seed database with demo data |
| `vendor/bin/pint` | Format code |

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | TypeScript + Vite production build |
| `npm run lint` | ESLint check |
| `npm run preview` | Preview production build |

## Environment Variables

### Backend (.env)

```env
APP_NAME="PHC Evaluation"
APP_URL=http://localhost:8000
APP_ENV=local

DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=phc_eval
DB_USERNAME=phc_user
DB_PASSWORD=phc_pass

REDIS_HOST=redis
REDIS_PORT=6379

SANCTUM_STATEFUL_DOMAINS=localhost:5173
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

## API Endpoints

Base URL: `http://localhost:8000/api/v1`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login user |
| POST | `/auth/logout` | Logout user |
| GET | `/user` | Get authenticated user |

## Features

- Bilingual UI (English/Arabic with RTL)
- Role-Based Access Control (RBAC)
- Multi-tenancy support
- Offline-first PWA architecture
- Audit logging

## License

MIT