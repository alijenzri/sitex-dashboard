# ----------- Build Frontend -----------
FROM node:18 AS frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# ----------- Build Backend -----------
FROM python:3.10-slim AS backend-build

WORKDIR /app/backend
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .

# ----------- Final Stage -----------
FROM python:3.10-slim

# Install Nginx and Supervisor
RUN apt-get update && \
    apt-get install -y nginx supervisor && \
    rm -rf /var/lib/apt/lists/*

# Copy backend from build
COPY --from=backend-build /app/backend /app/backend

# Copy frontend build to Nginx html directory
COPY --from=frontend-build /app/frontend/dist /var/www/frontend

# Nginx config
COPY ./nginx.conf /etc/nginx/nginx.conf

# Supervisor config
COPY ./supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Expose ports
EXPOSE 80

# Start Supervisor (which runs both Nginx and Gunicorn)
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"] 