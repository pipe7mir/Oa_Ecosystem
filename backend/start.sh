#!/bin/bash
set -e

# Set port (Railway injects PORT, fallback to 8080 for local)
PORT=${PORT:-8080}

echo "Starting PHP server on port $PORT using public/index.php as router..."

# Use Laravel's front controller as router script so all routes work correctly
# This is the recommended pattern for running frameworks with the PHP built-in server
php -d display_errors=1 -d log_errors=1 -S 0.0.0.0:$PORT public/index.php
