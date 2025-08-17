FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Create static directory
RUN mkdir -p /app/static

# Run Django commands
RUN python manage.py collectstatic --noinput
RUN python manage.py migrate --noinput

# Expose port
EXPOSE 8000

# Start gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "2", "djangoproj.wsgi:application"]
