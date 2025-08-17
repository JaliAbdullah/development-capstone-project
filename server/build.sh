#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
pip install -r requirements.txt

# Build frontend if it exists
if [ -d "frontend" ]; then
    echo "Building frontend..."
    cd frontend
    
    # Install Node.js dependencies
    npm ci --only=production
    
    # Build the React app
    npm run build
    
    # Go back to root directory
    cd ..
    
    echo "Frontend build completed."
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
