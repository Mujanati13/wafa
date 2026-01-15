#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Starting WAFA deployment..."

# 1. Update system and install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    sudo apt-get update
    sudo apt-get install -y ca-certificates curl gnupg
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg

    echo \
      "deb [arch=\"$(dpkg --print-architecture)\" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
else
    echo "Docker is already installed."
fi

# 2. Setup Environment Variables
echo "Setting up environment variables..."

# Define domains
FRONTEND_DOMAIN="imrs-qcm.com"
BACKEND_DOMAIN="backend.imrs-qcm.com"
PROTOCOL="http" # Change to https if you setup SSL

# Create .env file for Docker Compose
cat > .env <<EOL
NODE_ENV=production
PORT=5010

# Database
MONGO_URL=mongodb://mongodb:27017/wafa

# Domains & URLs
FRONTEND_URL=${PROTOCOL}://${FRONTEND_DOMAIN}
CORS_ORIGIN=${PROTOCOL}://${FRONTEND_DOMAIN},${PROTOCOL}://www.${FRONTEND_DOMAIN}

# Vite Build Args (Must be public URLs)
VITE_API_URL=${PROTOCOL}://${BACKEND_DOMAIN}/api/v1
VITE_BASED_URL=${PROTOCOL}://${BACKEND_DOMAIN}/api/v1

# Secrets (You should update these for production security)
SESSION_SECRET=wafa_production_secret_$(openssl rand -hex 16)
JWT_SECRET=wafa_production_jwt_$(openssl rand -hex 16)

# PayPal (From your backend .env - Update with real production keys)
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox

# Cloudinary (From your backend .env)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# AI & Other
GEMINI_API_KEY=AIzaSyBVbTbuUDr6kttcblDbF5J82sJLtSyC5f4
EMAIL_SERVICE=gmail
ADMIN_EMAIL=admin@wafa.com
EOL

echo ".env file created with production settings."

# 3. Build and Run containers
echo "Building and starting containers..."
docker compose down # Stop existing if any
docker compose up -d --build

echo "Deployment finished successfully!"
echo "Frontend: ${PROTOCOL}://${FRONTEND_DOMAIN}"
echo "Backend: ${PROTOCOL}://${BACKEND_DOMAIN}"
