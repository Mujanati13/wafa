#!/bin/bash

################################################################################
# WAFA VPS Deployment Script
# This script deploys the WAFA application stack using Docker
# Includes: MongoDB, Backend API, Frontend, Nginx Reverse Proxy with SSL
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAINS=("imrs-qcm.com" "www.imrs-qcm.com" "backend.imrs-qcm.com")
EMAIL="admin@imrs-qcm.com"  # Email for Let's Encrypt notifications
STAGING=0  # Set to 1 for testing with Let's Encrypt staging server

################################################################################
# Helper Functions
################################################################################

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

################################################################################
# Pre-flight Checks
################################################################################

print_header "WAFA VPS Deployment - Pre-flight Checks"

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run this script with sudo or as root"
    exit 1
fi

# Check Docker installation
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl enable docker
    systemctl start docker
    print_success "Docker installed successfully"
else
    print_success "Docker is installed"
fi

# Check Docker Compose installation
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    print_success "Docker Compose installed successfully"
else
    print_success "Docker Compose is installed"
fi

# Check environment files
print_info "Checking environment files..."

if [ ! -f ".env" ]; then
    print_warning "Root .env file not found. Creating from example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_warning "Please edit .env with your actual credentials"
        print_info "Important: Change SESSION_SECRET, JWT_SECRET, and MongoDB password!"
        print_info "Press Enter to continue after editing the file, or Ctrl+C to exit..."
        read
    else
        print_error "No .env.example found"
        exit 1
    fi
else
    print_success "Root .env file exists"
fi

if [ ! -f "wafa-frentend/.env.production" ]; then
    print_warning "Frontend .env.production not found. Creating from example..."
    if [ -f "wafa-frentend/.env.production.example" ]; then
        cp wafa-frentend/.env.production.example wafa-frentend/.env.production
        print_success "Frontend .env.production created"
    else
        print_error "No .env.production.example found for frontend"
        exit 1
    fi
else
    print_success "Frontend .env.production exists"
fi

# Check Firebase service account
if [ ! -f "wafa-backend/firebase-service-account.json" ]; then
    print_warning "Firebase service account file not found at wafa-backend/firebase-service-account.json"
    print_info "You can either:"
    print_info "  1. Place the firebase-service-account.json file in wafa-backend/"
    print_info "  2. Set FIREBASE_* environment variables in .env.production"
    print_info "Continue anyway? (y/n)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check DNS configuration
print_info "Checking DNS configuration..."
SERVER_IP=$(curl -s ifconfig.me)
print_info "Server IP: $SERVER_IP"

for domain in "${DOMAINS[@]}"; do
    DOMAIN_IP=$(dig +short "$domain" | tail -n1)
    if [ "$DOMAIN_IP" == "$SERVER_IP" ]; then
        print_success "$domain points to this server ($SERVER_IP)"
    else
        print_warning "$domain points to $DOMAIN_IP (expected: $SERVER_IP)"
        print_warning "Please update your DNS records to point to this server"
    fi
done

print_info "Continue with deployment? (y/n)"
read -r response
if [[ ! "$response" =~ ^[Yy]$ ]]; then
    exit 0
fi

################################################################################
# Build and Deploy
################################################################################

print_header "Building and Deploying Containers"

# Create necessary directories
mkdir -p certbot/conf certbot/www nginx/ssl

# Stop and remove existing containers
print_info "Stopping existing containers..."
docker-compose down --remove-orphans 2>/dev/null || true

# Remove any existing temp-nginx or nginx containers
print_info "Cleaning up existing nginx containers..."
docker rm -f temp-nginx 2>/dev/null || true
docker rm -f wafa-nginx 2>/dev/null || true
docker rm -f wafa_nginx_gateway 2>/dev/null || true

# Check if port 80 is in use and try to free it
if netstat -tuln | grep -q ":80 "; then
    print_warning "Port 80 is in use. Attempting to free it..."
    # Try to stop nginx if it's running as a service
    systemctl stop nginx 2>/dev/null || true
    # Kill any processes using port 80
    lsof -ti:80 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Build and start containers (without SSL first)
print_info "Building Docker images..."
docker-compose build

print_info "Starting containers..."
docker-compose up -d mongodb backend frontend

# Wait for backend to be healthy
print_info "Waiting for backend to be ready..."
for i in {1..30}; do
    if docker-compose exec -T backend wget -q --spider http://localhost:5010/api/v1/test 2>/dev/null; then
        print_success "Backend is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "Backend failed to start"
        docker-compose logs backend
        exit 1
    fi
    sleep 2
done

################################################################################
# SSL Certificate Setup
################################################################################

print_header "Setting Up SSL Certificates"

# Create initial nginx config without SSL for certbot validation
cat > nginx/nginx-initial.conf << 'EOF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name imrs-qcm.com www.imrs-qcm.com backend.imrs-qcm.com;

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 200 'Server is being configured...';
            add_header Content-Type text/plain;
        }
    }
}
EOF

# Start nginx with initial config
print_info "Starting temporary nginx for certificate validation..."
docker rm -f temp-nginx 2>/dev/null || true

docker run -d --name temp-nginx \
    -p 80:80 \
    -v "$(pwd)/nginx/nginx-initial.conf:/etc/nginx/nginx.conf:ro" \
    -v "$(pwd)/certbot/www:/var/www/certbot:ro" \
    nginx:alpine

if [ $? -ne 0 ]; then
    print_error "Failed to start temporary nginx. Port 80 may still be in use."
    print_info "Checking what's using port 80..."
    netstat -tuln | grep ":80 "
    lsof -i :80 || true
    exit 1
fi

print_success "Temporary Nginx started for certificate validation"

# Obtain SSL certificates
if [ $STAGING -eq 1 ]; then
    STAGING_FLAG="--staging"
    print_warning "Using Let's Encrypt STAGING environment (for testing)"
else
    STAGING_FLAG=""
    print_info "Using Let's Encrypt PRODUCTION environment"
fi

# Get certificate for main domain
print_info "Obtaining SSL certificate for imrs-qcm.com..."
docker run --rm \
    -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
    -v "$(pwd)/certbot/www:/var/www/certbot" \
    certbot/certbot certonly --webroot \
    --webroot-path=/var/www/certbot \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    $STAGING_FLAG \
    -d imrs-qcm.com \
    -d www.imrs-qcm.com

# Get certificate for backend domain
print_info "Obtaining SSL certificate for backend.imrs-qcm.com..."
docker run --rm \
    -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
    -v "$(pwd)/certbot/www:/var/www/certbot" \
    certbot/certbot certonly --webroot \
    --webroot-path=/var/www/certbot \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    $STAGING_FLAG \
    -d backend.imrs-qcm.com

# Stop temporary nginx
docker stop temp-nginx && docker rm temp-nginx

print_success "SSL certificates obtained successfully"

################################################################################
# Start Full Stack with SSL
################################################################################

print_header "Starting Full Stack with SSL"

# Start nginx and certbot with full configuration
docker-compose up -d

print_success "All services started successfully"

################################################################################
# Post-Deployment
################################################################################

print_header "Post-Deployment Checks"

# Wait for services to be ready
sleep 5

# Check service health
print_info "Checking service health..."

services=("mongodb" "backend" "frontend" "nginx" "certbot")
for service in "${services[@]}"; do
    if docker-compose ps | grep -q "$service.*Up"; then
        print_success "$service is running"
    else
        print_error "$service is not running"
        docker-compose logs "$service"
    fi
done

# Test endpoints
print_info "Testing endpoints..."

# Test backend
if curl -k -s -f https://backend.imrs-qcm.com/api/v1/test > /dev/null 2>&1; then
    print_success "Backend API is accessible at https://backend.imrs-qcm.com"
else
    print_warning "Backend API test failed. It may take a few moments to become available."
fi

# Test frontend
if curl -k -s -f https://imrs-qcm.com > /dev/null 2>&1; then
    print_success "Frontend is accessible at https://imrs-qcm.com"
else
    print_warning "Frontend test failed. It may take a few moments to become available."
fi

################################################################################
# Setup Auto-Renewal
################################################################################

print_header "Setting Up SSL Auto-Renewal"

# Create renewal script
cat > scripts/ssl-renew.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")/.."
docker-compose run --rm certbot renew
docker-compose exec nginx nginx -s reload
EOF

chmod +x scripts/ssl-renew.sh

# Add to crontab (run twice daily)
CRON_CMD="0 0,12 * * * $(pwd)/scripts/ssl-renew.sh >> /var/log/ssl-renew.log 2>&1"
(crontab -l 2>/dev/null | grep -v ssl-renew.sh; echo "$CRON_CMD") | crontab -

print_success "SSL auto-renewal configured (runs twice daily)"

################################################################################
# Final Summary
################################################################################

print_header "Deployment Complete!"

echo ""
echo -e "${GREEN}🎉 WAFA Application Successfully Deployed!${NC}"
echo ""
echo -e "${BLUE}Access your application at:${NC}"
echo -e "  Frontend: ${GREEN}https://imrs-qcm.com${NC}"
echo -e "  Backend:  ${GREEN}https://backend.imrs-qcm.com${NC}"
echo ""
echo -e "${BLUE}Useful Commands:${NC}"
echo -e "  View logs:        ${YELLOW}docker-compose logs -f [service]${NC}"
echo -e "  Restart service:  ${YELLOW}docker-compose restart [service]${NC}"
echo -e "  Stop all:         ${YELLOW}docker-compose down${NC}"
echo -e "  Start all:        ${YELLOW}docker-compose up -d${NC}"
echo -e "  Rebuild:          ${YELLOW}docker-compose up -d --build${NC}"
echo ""
echo -e "${BLUE}Maintenance Scripts:${NC}"
echo -e "  SSL Renewal:      ${YELLOW}./scripts/ssl-renew.sh${NC}"
echo -e "  Database Backup:  ${YELLOW}./scripts/backup-db.sh${NC}"
echo ""
echo -e "${YELLOW}Important Notes:${NC}"
echo -e "  1. SSL certificates will auto-renew every 12 hours"
echo -e "  2. Database data is persisted in Docker volumes"
echo -e "  3. Uploads are stored in wafa-backend/uploads/"
echo -e "  4. Monitor logs regularly for any issues"
echo ""
echo -e "${RED}Security Reminders:${NC}"
echo -e "  • Change default MongoDB credentials in docker-compose.yml"
echo -e "  • Keep your .env.production files secure and never commit them"
echo -e "  • Regularly update Docker images and system packages"
echo -e "  • Set up regular database backups"
echo ""

print_success "Deployment script completed successfully!"
