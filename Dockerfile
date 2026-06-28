# Backend (Laravel 13 + PHP 8.5)
FROM php:8.5-fpm-alpine AS backend

RUN apk add --no-cache \
    postgresql-dev \
    libzip-dev \
    unzip \
    curl \
    && docker-php-ext-install pdo pdo_mysql zip bcmath

# Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app/backend

COPY backend/composer.json backend/composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction

COPY backend/ .
RUN php artisan optimize && \
    php artisan view:cache && \
    php artisan route:cache && \
    php artisan event:cache

# Frontend (React 19 + Vite)
FROM node:22-alpine AS frontend

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --ignore-scripts && npm cache clean --force

COPY frontend/ .
RUN npm run build

# Production image
FROM php:8.5-fpm-alpine AS production

RUN apk add --no-cache \
    nginx \
    supervisor \
    libzip-dev \
    unzip \
    curl \
    && docker-php-ext-install pdo pdo_mysql zip bcmath

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copy backend
COPY --from=backend /app/backend /app/backend
# Copy frontend build
COPY --from=frontend /app/frontend/dist /app/frontend/dist

# Nginx config
COPY docker/nginx.conf /etc/nginx/http.d/default.conf
# Supervisor config
COPY docker/supervisord.conf /etc/supervisor/supervisord.conf

# Storage permissions
RUN chown -R www-data:www-data /app/backend/storage /app/backend/bootstrap/cache

EXPOSE 80

CMD ["supervisord", "-c", "/etc/supervisor/supervisord.conf"]
