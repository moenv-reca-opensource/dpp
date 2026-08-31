FROM php:8.5-fpm

RUN apt-get update \
    && apt-get install -y --no-install-recommends unzip \
    && apt-get autoremove -y \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/
COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer

RUN install-php-extensions \
    mbstring \
    zip \
    opcache \
    gd

ENV TZ=Asia/Taipei

WORKDIR /var/www/html
