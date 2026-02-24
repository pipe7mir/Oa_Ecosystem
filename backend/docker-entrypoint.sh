#!/bin/bash
set -e

# Get port from environment or use default
PORT=${PORT:-8080}

echo "Starting PHP development server on 0.0.0.0:$PORT"

# Start the PHP server
exec php -S 0.0.0.0:$PORT -t public
