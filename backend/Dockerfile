# syntax=docker/dockerfile:1

FROM php:8.3-cli

# System dependencies and PHP extensions
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       git unzip curl libpq-dev libzip-dev libonig-dev libicu-dev \
       libpng-dev libjpeg62-turbo-dev libfreetype6-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" pdo pdo_pgsql pcntl intl zip gd \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && rm -rf /var/lib/apt/lists/*

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Node.js for running Vite or tooling if needed
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get update && apt-get install -y nodejs \
    && npm i -g npm@latest \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html

# Install PHP deps early for caching
COPY composer.json composer.lock ./
RUN composer install --no-interaction --prefer-dist --no-progress || true

# Install Node deps early for caching (if present)
COPY package.json package-lock.json* ./
RUN if [ -f package.json ]; then npm ci || npm install; fi

# Copy app source
COPY . .

# Permissions for storage and cache
RUN chown -R www-data:www-data storage bootstrap/cache || true

EXPOSE 8000

# Default command can be overridden by docker-compose; keep PHP CLI available
CMD ["php", "-v"]
