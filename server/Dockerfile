FROM python:3.12.0-slim-bookworm

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV APP=/app

# Set work directory
WORKDIR $APP

# Install dependencies
COPY requirements.txt $APP/
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . $APP/

# Make entrypoint executable
RUN chmod +x /app/entrypoint.sh

# Expose port
EXPOSE 8000

# Run entrypoint script and start gunicorn
ENTRYPOINT ["/bin/bash", "/app/entrypoint.sh"]
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "djangoproj.wsgi:application"]
