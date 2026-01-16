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
DOMAINS=("imrs-qcm.com" "backend.imrs-qcm.com")
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
    
    # Ensure CORS_ORIGIN is set correctly
    if ! grep -q "^CORS_ORIGIN=" .env; then
        print_warning "CORS_ORIGIN not found in .env. Adding default value..."
        echo "" >> .env
        echo "# CORS Configuration - Allows requests from these origins" >> .env
        echo "CORS_ORIGIN=http://localhost:5173,http://localhost:4010,http://$DOMAINS,https://$DOMAINS" >> .env
    fi
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
print_info "Skip DNS validation? (y/n)"
print_info "Choose 'y' if DNS and SSL are already configured"
read -r skip_dns_response

if [[ "$skip_dns_response" =~ ^[Yy]$ ]]; then
    print_success "Skipping DNS validation"
    SKIP_SSL=0
else
    print_info "Checking DNS configuration..."
    SERVER_IP=$(curl -s ifconfig.me)
    print_info "Server IP: $SERVER_IP"

    DNS_MISSING=0
    for domain in "${DOMAINS[@]}"; do
        DOMAIN_IP=$(dig +short "$domain" | tail -n1)
        if [ -z "$DOMAIN_IP" ]; then
            print_error "$domain has no DNS record"
            DNS_MISSING=1
        elif [ "$DOMAIN_IP" == "$SERVER_IP" ]; then
            print_success "$domain points to this server ($SERVER_IP)"
        else
            print_warning "$domain points to $DOMAIN_IP (expected: $SERVER_IP)"
            DNS_MISSING=1
        fi
    done

    if [ $DNS_MISSING -eq 1 ]; then
        echo ""
        print_error "DNS records are not properly configured!"
        echo ""
        print_info "Required DNS A records in your domain registrar:"
        echo "  Type    Name        Value           TTL"
        echo "  A       @           $SERVER_IP      300"
        echo "  A       backend     $SERVER_IP      300"
        echo ""
        print_info "Options:"
        echo "  1. Exit and configure DNS records (recommended)"
        echo "  2. Continue without SSL (development only)"
        echo ""
        read -p "Enter your choice (1 or 2): " dns_choice
        
        if [ "$dns_choice" != "2" ]; then
            print_info "Please configure DNS records and run the script again."
            print_info "DNS changes can take 5-30 minutes to propagate."
            exit 0
        fi
        
        print_warning "Continuing without SSL. Your site will use HTTP only."
        SKIP_SSL=1
    else
        SKIP_SSL=0
    fi
fi

if [ $SKIP_SSL -eq 0 ]; then
    # Check if SSL certificates already exist
    if [ -f "/etc/letsencrypt/live/imrs-qcm.com/fullchain.pem" ] && [ -f "/etc/letsencrypt/live/backend.imrs-qcm.com/fullchain.pem" ]; then
        print_success "Existing SSL certificates found!"
        print_info "Use existing SSL certificates? (y/n)"
        print_info "Choose 'y' to skip regeneration and use HTTPS with existing certs"
        print_info "Choose 'n' to regenerate certificates"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            print_success "Using existing SSL certificates"
            USE_EXISTING_SSL=1
            SKIP_SSL_GENERATION=1
        else
            print_info "Will regenerate SSL certificates"
            USE_EXISTING_SSL=0
            SKIP_SSL_GENERATION=0
        fi
    else
        print_info "Continue with SSL setup? (y/n)"
        read -r response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            SKIP_SSL=1
            print_warning "Skipping SSL setup - will use HTTP only"
        fi
        USE_EXISTING_SSL=0
        SKIP_SSL_GENERATION=0
    fi
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

if [ $SKIP_SSL -eq 1 ]; then
    print_header "Skipping SSL Setup"
    print_warning "Your application will run on HTTP (port 80) only"
    print_info "To add SSL later, configure DNS and run: sudo ./deploy-vps.sh again"
    
    # Use HTTP-only nginx configuration
    print_info "Configuring Nginx for HTTP only..."
    
    # Update docker-compose to use HTTP config
    if [ -f docker-compose.yml ]; then
        sed -i 's|./nginx/nginx.conf:/etc/nginx/nginx.conf:ro|./nginx/nginx-http.conf:/etc/nginx/nginx.conf:ro|g' docker-compose.yml
        sed -i 's|./nginx/nginx-hybrid.conf:/etc/nginx/nginx.conf:ro|./nginx/nginx-http.conf:/etc/nginx/nginx.conf:ro|g' docker-compose.yml
    fi
    
    # Start services without SSL
    docker-compose up -d
else
    print_header "Setting Up SSL Certificates"
    
    # Use SSL nginx configuration (will be updated based on which certs succeed)
    NGINX_CONFIG="nginx.conf"

    # Check if we're using existing certificates
    if [ "${USE_EXISTING_SSL:-0}" -eq 1 ]; then
        print_success "Skipping certificate generation - using existing SSL certificates"
        
        # Verify which certificates exist and configure nginx accordingly
        if [ -f "/etc/letsencrypt/live/imrs-qcm.com/fullchain.pem" ] && [ -f "/etc/letsencrypt/live/backend.imrs-qcm.com/fullchain.pem" ]; then
            print_success "Both domain certificates found - using full SSL"
            NGINX_CONFIG="nginx.conf"
        elif [ -f "/etc/letsencrypt/live/imrs-qcm.com/fullchain.pem" ]; then
            print_warning "Only frontend certificate found - using hybrid mode"
            NGINX_CONFIG="nginx-hybrid.conf"
        else
            print_error "No valid certificates found, falling back to HTTP"
            SKIP_SSL=1
            NGINX_CONFIG="nginx-http.conf"
        fi
        
        # Update docker-compose to use appropriate nginx config
        print_info "Configuring Nginx with $NGINX_CONFIG..."
        if [ -f docker-compose.yml ]; then
            sed -i "s|./nginx/nginx-http.conf:/etc/nginx/nginx.conf:ro|./nginx/$NGINX_CONFIG:/etc/nginx/nginx.conf:ro|g" docker-compose.yml
            sed -i "s|./nginx/nginx.conf:/etc/nginx/nginx.conf:ro|./nginx/$NGINX_CONFIG:/etc/nginx/nginx.conf:ro|g" docker-compose.yml
            sed -i "s|./nginx/nginx-hybrid.conf:/etc/nginx/nginx.conf:ro|./nginx/$NGINX_CONFIG:/etc/nginx/nginx.conf:ro|g" docker-compose.yml
        fi
    else
        # Generate new certificates
        # Install certbot if not present
        if ! command -v certbot &> /dev/null; then
            print_info "Installing certbot..."
            apt-get update
            apt-get install -y certbot python3-certbot-nginx
        fi

        # Stop Docker nginx temporarily to free port 80
        print_info "Stopping Docker containers temporarily for SSL setup..."
        docker-compose stop nginx 2>/dev/null || true
        
        # Wait a moment for port to be released
        sleep 2
        
        # Obtain SSL certificates using system certbot
        print_info "Obtaining SSL certificates..."
        
        if [ $STAGING -eq 1 ]; then
            STAGING_FLAG="--staging"
            print_warning "Using Let's Encrypt STAGING environment (for testing)"
        else
            STAGING_FLAG=""
            print_info "Using Let's Encrypt PRODUCTION environment"
        fi
        
        # Get certificate for main domain (if www exists in DNS, include it)
        print_info "Obtaining SSL certificate for imrs-qcm.com..."
        
        # Check if www subdomain exists
        WWW_EXISTS=$(dig +short www.imrs-qcm.com | tail -n1)
        if [ -n "$WWW_EXISTS" ]; then
            DOMAIN_FLAGS="-d imrs-qcm.com -d www.imrs-qcm.com"
        else
            DOMAIN_FLAGS="-d imrs-qcm.com"
        fi
        
        certbot certonly --standalone \
            --non-interactive \
            --agree-tos \
            --email "$EMAIL" \
            $STAGING_FLAG \
            $DOMAIN_FLAGS \
            --preferred-challenges http
        
        if [ $? -ne 0 ]; then
            print_error "Failed to obtain certificate for imrs-qcm.com"
            print_info "Falling back to HTTP mode..."
            SKIP_SSL=1
            sed -i 's|./nginx/nginx.conf:/etc/nginx/nginx.conf:ro|./nginx/nginx-http.conf:/etc/nginx/nginx.conf:ro|g' docker-compose.yml
            docker-compose up -d
        else
            # Get certificate for backend domain
            print_info "Obtaining SSL certificate for backend.imrs-qcm.com..."
            certbot certonly --standalone \
                --non-interactive \
                --agree-tos \
                --email "$EMAIL" \
                $STAGING_FLAG \
                -d backend.imrs-qcm.com \
                --preferred-challenges http
            
            if [ $? -ne 0 ]; then
                print_warning "Failed to obtain certificate for backend.imrs-qcm.com"
                print_warning "Using hybrid mode: Frontend with HTTPS, Backend with HTTP"
                NGINX_CONFIG="nginx-hybrid.conf"
            else
                print_success "Both SSL certificates obtained successfully"
                NGINX_CONFIG="nginx.conf"
            fi
            
            # Update docker-compose to use appropriate nginx config
            print_info "Configuring Nginx with $NGINX_CONFIG..."
            if [ -f docker-compose.yml ]; then
                sed -i "s|./nginx/nginx-http.conf:/etc/nginx/nginx.conf:ro|./nginx/$NGINX_CONFIG:/etc/nginx/nginx.conf:ro|g" docker-compose.yml
                sed -i "s|./nginx/nginx.conf:/etc/nginx/nginx.conf:ro|./nginx/$NGINX_CONFIG:/etc/nginx/nginx.conf:ro|g" docker-compose.yml
                sed -i "s|./nginx/nginx-hybrid.conf:/etc/nginx/nginx.conf:ro|./nginx/$NGINX_CONFIG:/etc/nginx/nginx.conf:ro|g" docker-compose.yml
            fi
        fi
    fi

fi  # End of SSL setup

################################################################################
# Start Full Stack
################################################################################

if [ $SKIP_SSL -eq 0 ]; then
    print_header "Starting Full Stack with SSL"
    
    # Start all services with SSL configuration
    docker-compose up -d
    
    if [ "$NGINX_CONFIG" = "nginx-hybrid.conf" ]; then
        print_success "All services started with hybrid SSL (Frontend: HTTPS, Backend: HTTP)"
    else
        print_success "All services started successfully with full SSL"
    fi
else
    print_header "Starting Services (HTTP Only)"
    print_success "All services started successfully"
fi

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

# Check CORS configuration
print_info "Checking CORS configuration..."
BACKEND_CORS=$(docker-compose exec -T backend printenv CORS_ORIGIN 2>/dev/null || echo "Not set")
print_info "Backend CORS_ORIGIN: $BACKEND_CORS"

if [[ "$BACKEND_CORS" == *"$DOMAINS"* ]]; then
    print_success "CORS is configured for your domain"
else
    print_error "CORS may not be properly configured!"
    print_warning "If you see CORS errors in browser, run:"
    print_info "  docker-compose exec backend printenv CORS_ORIGIN"
    print_info "And check if your domain (${DOMAINS[0]}) is included"
fi

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

if [ $SKIP_SSL -eq 0 ]; then
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
fi  # End of SSL auto-renewal setup

################################################################################
# Final Summary
################################################################################

print_header "Deployment Complete!"

echo ""
echo -e "${GREEN}🎉 WAFA Application Successfully Deployed!${NC}"
echo ""
if [ $SKIP_SSL -eq 0 ]; then
    echo -e "${BLUE}Access your application at:${NC}"
    echo -e "  Frontend: ${GREEN}https://imrs-qcm.com${NC}"
    echo -e "  Backend:  ${GREEN}https://backend.imrs-qcm.com${NC}"
else
    echo -e "${YELLOW}Access your application at (HTTP only):${NC}"
    echo -e "  Frontend: ${YELLOW}http://imrs-qcm.com${NC}"
    echo -e "  Backend:  ${YELLOW}http://backend.imrs-qcm.com${NC}"
    echo ""
    echo -e "${YELLOW}⚠ To enable HTTPS:${NC}"
    echo -e "  1. Add DNS A records for backend.imrs-qcm.com"
    echo -e "  2. Wait 5-30 minutes for DNS propagation"
    echo -e "  3. Run: ${GREEN}sudo ./deploy-vps.sh${NC} again"
fi
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

echo -e "${BLUE}CORS Troubleshooting:${NC}"
echo -e "  If you get CORS errors, check these steps:"
echo -e "  1. Verify CORS_ORIGIN in .env includes your domain:"
echo -e "     ${YELLOW}grep CORS_ORIGIN .env${NC}"
echo -e "  2. Check what backend is configured:"
echo -e "     ${YELLOW}docker-compose exec backend printenv CORS_ORIGIN${NC}"
echo -e "  3. If missing, update .env and restart:"
echo -e "     ${YELLOW}echo 'CORS_ORIGIN=https://imrs-qcm.com,https://backend.imrs-qcm.com' >> .env${NC}"
echo -e "     ${YELLOW}docker-compose restart backend${NC}"
echo -e "  4. Clear browser cache and try again"
echo ""

print_success "Deployment script completed successfully!"
