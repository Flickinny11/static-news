FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Create directories
RUN mkdir -p /audio/live /app/data

# Expose ports
EXPOSE 8000 8080

# Start server
CMD ["python", "-m", "streaming_server"]