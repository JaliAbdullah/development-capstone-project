#!/bin/bash

# Exit on any error
set -e

echo "Starting Django application setup..."

# Make migrations and migrate the database
echo "Making migrations and migrating the database..."
python manage.py makemigrations --noinput
python manage.py migrate --noinput

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Setup completed successfully!"

# Execute the main command
exec "$@"
