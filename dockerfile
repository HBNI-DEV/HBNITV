# --------- Stage 1: Build frontend ---------
FROM node:23.11-alpine3.20 AS frontend-builder

WORKDIR /app

# Copy only package.json/package-lock.json first for better caching
COPY package.json package-lock.json ./

# Install only what's needed
RUN npm install

# Copy the rest of the app
COPY . .

# Build the frontend
RUN npm run build

# --------- Stage 2: Python backend ---------
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend files
COPY . .

# Copy built frontend (from first stage) into the correct place
COPY --from=frontend-builder /app/public ./public

# Expose the port your Tornado app listens on
EXPOSE 5000

# Start the app
CMD ["python", "main.py"]
