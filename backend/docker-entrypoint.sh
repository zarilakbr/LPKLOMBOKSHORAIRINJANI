#!/bin/sh
set -e

rm -f bootstrap/cache/config.php

if [ -n "$DATABASE_URL" ] && [ "$DB_CONNECTION" != "pgsql" ]; then
    export DB_CONNECTION=pgsql
fi

echo "Waiting for PostgreSQL database to be ready..."

MAX_RETRIES=30
RETRY_INTERVAL=3
attempt=0

# Real health check: bootstraps Laravel and calls DB::connection()->getPdo().
# On failure it prints SAFE diagnostics (driver/host/port/database + exception
# class/message) to stderr. Passwords, usernames and full URLs are redacted.
HEALTHCHECK_SCRIPT=/tmp/lpk-db-healthcheck.php
cat > "$HEALTHCHECK_SCRIPT" <<'PHP'
<?php
$attempt = (int) ($argv[1] ?? 1);
$max = (int) ($argv[2] ?? 1);
$verbose = ($attempt === 1 || $attempt >= $max);

// Collect secret values to redact from any printed message.
$secrets = [];
foreach (['DATABASE_URL', 'DB_URL', 'DB_PASSWORD', 'APP_KEY'] as $key) {
    $value = getenv($key);
    if (is_string($value) && $value !== '') {
        $secrets[] = $value;
    }
}
foreach (['DATABASE_URL', 'DB_URL'] as $key) {
    $value = getenv($key);
    if (is_string($value) && $value !== '') {
        $parts = parse_url($value);
        if (is_array($parts) && isset($parts['pass']) && $parts['pass'] !== '') {
            $secrets[] = $parts['pass'];
            $secrets[] = rawurldecode($parts['pass']);
        }
    }
}
$secrets = array_values(array_unique(array_filter($secrets, fn ($s) => strlen($s) >= 4)));
usort($secrets, fn ($a, $b) => strlen($b) - strlen($a));

$redact = function ($text) use ($secrets) {
    $text = (string) $text;
    foreach ($secrets as $secret) {
        $text = str_replace($secret, '***', $text);
    }
    // Credentials embedded in any URL: scheme://user:pass@host -> scheme://***:***@host
    $text = preg_replace('#([a-z][a-z0-9+.\-]*://)[^\s/@]+@#i', '$1***:***@', $text);
    // Username in libpq messages: user "name" -> user "***"
    $text = preg_replace('/user "[^"]*"/i', 'user "***"', $text);
    // key=value style secrets
    $text = preg_replace('/(password|passwd|pwd)\s*=\s*\S+/i', '$1=***', $text);
    return $text;
};

$info = [
    'connection' => 'unknown',
    'driver' => 'unknown',
    'host' => 'unknown',
    'port' => 'unknown',
    'database' => 'unknown',
    'url' => 'unknown',
];

try {
    require 'vendor/autoload.php';
    $app = require 'bootstrap/app.php';
    $app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

    // Resolve the effective connection config exactly as Laravel does (URL overrides host/port).
    $name = (string) config('database.default');
    $raw = (array) config("database.connections.{$name}", []);
    $info['connection'] = $name;
    $info['url'] = !empty($raw['url']) ? 'set' : 'not set';
    $cfg = (new Illuminate\Support\ConfigurationUrlParser())->parseConfiguration($raw);
    $info['driver'] = (string) ($cfg['driver'] ?? 'unknown');
    $info['host'] = (string) ($cfg['host'] ?? 'n/a');
    $info['port'] = (string) ($cfg['port'] ?? 'n/a');
    $info['database'] = (string) ($cfg['database'] ?? 'n/a');

    Illuminate\Support\Facades\DB::connection()->getPdo();
    exit(0);
} catch (Throwable $e) {
    $error = get_class($e) . ': ' . $redact($e->getMessage());
    $previous = $e->getPrevious();
    if ($previous !== null && $previous->getMessage() !== $e->getMessage()) {
        $error .= ' | Previous ' . get_class($previous) . ': ' . $redact($previous->getMessage());
    }

    if ($verbose) {
        fwrite(STDERR, "Database connection failed (attempt {$attempt}/{$max}):\n");
        fwrite(STDERR, '  Connection: ' . $redact($info['connection']) . "\n");
        fwrite(STDERR, '  Driver:     ' . $redact($info['driver']) . "\n");
        fwrite(STDERR, '  Host:       ' . $redact($info['host']) . "\n");
        fwrite(STDERR, '  Port:       ' . $redact($info['port']) . "\n");
        fwrite(STDERR, '  Database:   ' . $redact($info['database']) . "\n");
        fwrite(STDERR, '  URL config: ' . $info['url'] . "\n");
        fwrite(STDERR, '  Error:      ' . $error . "\n");
    } else {
        fwrite(STDERR, "Database connection failed (attempt {$attempt}/{$max}): {$error}\n");
    }
    exit(1);
}
PHP

while :; do
    attempt=$((attempt + 1))

    if php "$HEALTHCHECK_SCRIPT" "$attempt" "$MAX_RETRIES"; then
        break
    fi

    if [ "$attempt" -ge "$MAX_RETRIES" ]; then
        echo "Error: Timed out waiting for PostgreSQL connection after $((MAX_RETRIES * RETRY_INTERVAL)) seconds."
        exit 1
    fi

    echo "PostgreSQL is not ready yet (attempt $attempt/$MAX_RETRIES). Retrying in ${RETRY_INTERVAL}s..."
    sleep "$RETRY_INTERVAL"
done

rm -f "$HEALTHCHECK_SCRIPT"

echo "PostgreSQL connection established successfully."

echo "Running safe idempotent migrations..."
php artisan migrate --force

echo "Ensuring production admin account exists..."

php -r '
require "vendor/autoload.php";

$app = require_once "bootstrap/app.php";
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;

$email = env("ADMIN_DEFAULT_EMAIL");
$password = env("ADMIN_DEFAULT_PASSWORD");

if (!$email || !$password) {
    echo "ADMIN_DEFAULT_EMAIL or ADMIN_DEFAULT_PASSWORD is not configured. Skipping admin creation.\n";
    exit(0);
}

$email = strtolower(trim($email));

$admin = User::where("email", $email)->first();

if (!$admin) {
    User::create([
        "name" => "Administrator Lembaga",
        "email" => $email,
        "password" => $password,
        "role" => User::ROLE_ADMIN,
        "department" => "Academic & Institutional Management",
        "status" => User::STATUS_ACTIVE,
        "email_verified_at" => now(),
    ]);

    echo "Production admin account created successfully: {$email}\n";
} else {
    echo "Production admin account already exists: {$email}\n";
}
'

# Ensure resume uploads directory exists and is writable by Apache
mkdir -p /var/www/html/public/uploads/resumes
chown -R www-data:www-data /var/www/html/public/uploads || true
chmod -R 775 /var/www/html/public/uploads || true

echo "Starting Apache web server..."

# Ensure exactly one Apache MPM (mpm_prefork) is enabled to prevent AH00534
a2dismod mpm_event mpm_worker 2>/dev/null || true
a2enmod mpm_prefork 2>/dev/null || true

if [ $# -gt 0 ]; then
    exec "$@"
else
    exec apache2-foreground
fi
