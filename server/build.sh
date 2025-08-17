#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
pip install -r requirements.txt

# Build frontend if it exists
if [ -d "frontend" ]; then
    cd frontend
    npm install
    npm run build
    cd ..
fi

# Collect static files
python manage.py collectstatic --no-input

# Run migrations
python manage.py migrate
