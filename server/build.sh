#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
pip install -r requirements.txt

# Build frontend if it exists
if [ -d "frontend" ]; then
    echo "Building frontend..."
    cd frontend
    
    # Install Node.js dependencies (including dev dependencies for build)
    npm ci
    
    # Build the React app
    npm run build
    
    # Go back to root directory
    cd ..
    
    echo "Frontend build completed."
    
    # Debug: List the contents of the build directory
    if [ -d "frontend/build" ]; then
        echo "Build directory contents:"
        ls -la frontend/build/
    else
        echo "ERROR: frontend/build directory not found after build!"
    fi
fi

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --no-input --clear

# Run migrations
echo "Running migrations..."
python manage.py migrate

# Create superuser if needed (optional)
# python manage.py shell -c "from django.contrib.auth.models import User; User.objects.create_superuser('admin', 'admin@example.com', 'admin') if not User.objects.filter(username='admin').exists() else None"

echo "Build completed successfully!"
