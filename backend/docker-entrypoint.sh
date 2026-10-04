#!/bin/sh
set -e

echo "Waiting for PostgreSQL database to be ready..."

MAX_RETRIES=30
RETRY_INTERVAL=3
attempt=0

until php -r "require 'vendor/autoload.php'; \$app = require_once 'bootstrap/app.php'; \$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap(); try { Illuminate\Support\Facades\DB::connection()->getPdo(); exit(0); } catch (\Throwable \$e) { exit(1); }" >/dev/null 2>&1; do
    attempt=$((attempt + 1))
    if [ "$attempt" -ge "$MAX_RETRIES" ]; then
        echo "Error: Timed out waiting for PostgreSQL connection after $((MAX_RETRIES * RETRY_INTERVAL)) seconds."
        exit 1
    fi
    echo "PostgreSQL is not ready yet (attempt $attempt/$MAX_RETRIES). Retrying in ${RETRY_INTERVAL}s..."
    sleep "$RETRY_INTERVAL"
done

echo "PostgreSQL connection established successfully."

# Run safe idempotent migrations on container startup
echo "Running safe idempotent migrations..."
php artisan migrate --force

# Start Apache in the foreground
echo "Starting Apache web server..."
if [ $# -gt 0 ]; then
    exec "$@"
else
    exec apache2-foreground
fi
