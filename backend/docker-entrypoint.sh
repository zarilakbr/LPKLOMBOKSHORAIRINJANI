#!/bin/sh
set -e

# Run safe idempotent migrations on container startup
php artisan migrate --force

# Start Apache in the foreground
exec apache2-foreground
