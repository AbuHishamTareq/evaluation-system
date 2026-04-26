FROM php:8.4-fpm-alpine

RUN apk add --no-cache \
    shadow \
    curl \
    git \
    unzip \
    libzip-dev \
    oniguruma-dev \
    nodejs \
    npm \
    && docker-php-ext-install pdo_mysql zip opcache

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

RUN npm install -g npm@latest

RUN echo "listen = 0.0.0.0:9000" >> /usr/local/etc/php-fpm.d/www.conf \
    && echo "pm.status_path = /status" >> /usr/local/etc/php-fpm.d/www.conf \
    && echo "pm.max_children = 50" >> /usr/local/etc/php-fpm.d/www.conf \
    && echo "pm.start_servers = 5" >> /usr/local/etc/php-fpm.d/www.conf \
    && echo "pm.min_spare_servers = 5" >> /usr/local/etc/php-fpm.d/www.conf \
    && echo "pm.max_spare_servers = 10" >> /usr/local/etc/php-fpm.d/www.conf

RUN mkdir -p /var/www/html && chown -R www-data:www-data /var/www/html

WORKDIR /var/www/html

EXPOSE 9000

CMD ["php-fpm"]