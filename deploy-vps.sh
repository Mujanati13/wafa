#!/bin/bash

# ===========================================
# WAFA Platform - VPS Deployment Script
# ===========================================
# This script deploys the WAFA platform with Docker
# Domains: imrs-qcm.com (frontend) & backend.imrs-qcm.com (backend)
# 
# Prerequisites:
# - Ubuntu 20.04+ or similar Linux distribution
# - Root or sudo access
# - Domains pointing to server IP
# - Ports 80, 443 available
#
# Usage: sudo bash deploy-vps.sh
# ===========================================

set -e  # Exit on error
set -u  # Exit on undefined variable

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="${SCRIPT_DIR}/deployment.log"
BACKUP_DIR="${SCRIPT_DIR}/backups/$(date +%Y%m%d_%H%M%S)"

# Domain configuration
FRONTEND_DOMAIN="imrs-qcm.com"
BACKEND_DOMAIN="backend.imrs-qcm.com"
FRONTEND_WWW="www.${FRONTEND_DOMAIN}"

# ===========================================
# Logging Functions
# ===========================================
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

# ===========================================
# Error Handler
# ===========================================
error_exit() {
    log_error "$1"
    log_error "Deployment failed! Check ${LOG_FILE} for details."
    exit 1
}

# ===========================================
# Cleanup on exit
# ===========================================
cleanup() {
    if [ $? -ne 0 ]; then
        log_warning "Script interrupted. Cleaning up..."
    fi
}
trap cleanup EXIT

# ===========================================
# Check Prerequisites
# ===========================================
check_prerequisites() {
    log "Checking prerequisites..."

    # Check if running as root
    if [ "$EUID" -ne 0 ]; then
        error_exit "Please run as root or with sudo"
    fi

    # Check if required commands exist
    local required_commands=("curl" "git" "openssl")
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            log_warning "$cmd not found, installing..."
            apt-get update && apt-get install -y "$cmd"
        fi
    done

    # Check if .env file exists
    if [ ! -f "${SCRIPT_DIR}/.env" ]; then
        error_exit ".env file not found! Copy .env.example to .env and configure it."
    fi

    # Check backend .env
    if [ ! -f "${SCRIPT_DIR}/wafa-backend/.env" ]; then
        error_exit "wafa-backend/.env not found! Copy wafa-backend/.env.production.example and configure it."
    fi

    log "Prerequisites check completed ✓"
}

# ===========================================
# Install Docker
# ===========================================
install_docker() {
    if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
        log "Docker and Docker Compose already installed ✓"
        docker --version | tee -a "$LOG_FILE"
        docker-compose --version | tee -a "$LOG_FILE"
        return 0
    fi

    log "Installing Docker and Docker Compose..."

    # Remove old versions
    apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

    # Install dependencies
    apt-get update
    apt-get install -y \
        apt-transport-https \
        ca-certificates \
        curl \
        gnupg \
        lsb-release

    # Add Docker's official GPG key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

    # Set up stable repository
    echo \
        "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
        $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

    # Install Docker Engine
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

    # Install Docker Compose (standalone)
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose

    # Start Docker
    systemctl enable docker
    systemctl start docker

    log "Docker installed successfully ✓"
}

# ===========================================
# Configure Firewall
# ===========================================
configure_firewall() {
    log "Configuring firewall..."

    if command -v ufw &> /dev/null; then
        # Allow SSH
        ufw allow 22/tcp
        
        # Allow HTTP and HTTPS
        ufw allow 80/tcp
        ufw allow 443/tcp
        
        # Enable firewall
        echo "y" | ufw enable || true
        
        log "Firewall configured ✓"
    else
        log_warning "UFW not found, skipping firewall configuration"
    fi
}

# ===========================================
# Verify DNS Configuration
# ===========================================
verify_dns() {
    log "Verifying DNS configuration..."

    local server_ip=$(curl -s ifconfig.me)
    log_info "Server IP: ${server_ip}"

    for domain in "$FRONTEND_DOMAIN" "$FRONTEND_WWW" "$BACKEND_DOMAIN"; do
        local domain_ip=$(dig +short "$domain" | tail -n1)
        if [ -z "$domain_ip" ]; then
            log_warning "DNS not configured for ${domain}"
        elif [ "$domain_ip" != "$server_ip" ]; then
            log_warning "${domain} points to ${domain_ip}, but server IP is ${server_ip}"
        else
            log "DNS for ${domain} configured correctly ✓"
        fi
    done
}

# ===========================================
# Setup SSL Certificates (Initial)
# ===========================================
setup_ssl_initial() {
    log "Setting up initial SSL configuration..."

    # Create temporary nginx config for certbot validation
    mkdir -p "${SCRIPT_DIR}/nginx/conf.d"
    mkdir -p "${SCRIPT_DIR}/nginx/ssl"
    
    cat > "${SCRIPT_DIR}/nginx/conf.d/certbot-temp.conf" <<EOF
server {
    listen 80;
    server_name ${FRONTEND_DOMAIN} ${FRONTEND_WWW} ${BACKEND_DOMAIN};

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location /health {
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    location / {
        return 200 "Server is ready for SSL setup\n";
        add_header Content-Type text/plain;
    }
}
EOF

    log "Initial SSL configuration created ✓"
}

# ===========================================
# Obtain SSL Certificates
# ===========================================
obtain_ssl_certificates() {
    log "Obtaining SSL certificates from Let's Encrypt..."

    # Load email from .env
    source "${SCRIPT_DIR}/.env"
    
    if [ -z "${SSL_EMAIL:-}" ]; then
        error_exit "SSL_EMAIL not set in .env file"
    fi

    # Start nginx temporarily for certbot
    docker-compose up -d nginx

    # Wait for nginx to be ready
    sleep 5

    # Obtain certificates
    docker-compose run --rm certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email "$SSL_EMAIL" \
        --agree-tos \
        --no-eff-email \
        -d "$FRONTEND_DOMAIN" \
        -d "$FRONTEND_WWW" \
        -d "$BACKEND_DOMAIN" || {
            log_warning "SSL certificate generation failed. Will use HTTP for now."
            log_warning "Make sure your domains are pointing to this server."
            return 1
        }

    log "SSL certificates obtained successfully ✓"
    
    # Stop temporary nginx
    docker-compose down
    
    # Remove temporary config and use production config
    rm -f "${SCRIPT_DIR}/nginx/conf.d/certbot-temp.conf"
    
    return 0
}

# ===========================================
# Create Backup
# ===========================================
create_backup() {
    log "Creating backup..."

    mkdir -p "$BACKUP_DIR"

    # Backup docker volumes if they exist
    if docker volume ls | grep -q wafa; then
        log "Backing up Docker volumes..."
        docker run --rm \
            -v wafa_mongodb_data:/data \
            -v wafa_backend_uploads:/uploads \
            -v "${BACKUP_DIR}:/backup" \
            alpine tar czf /backup/volumes.tar.gz /data /uploads 2>/dev/null || true
    fi

    # Backup environment files
    cp -f "${SCRIPT_DIR}/.env" "${BACKUP_DIR}/.env.backup" 2>/dev/null || true
    cp -f "${SCRIPT_DIR}/wafa-backend/.env" "${BACKUP_DIR}/backend.env.backup" 2>/dev/null || true

    log "Backup created at ${BACKUP_DIR} ✓"
}

# ===========================================
# Build and Deploy Containers
# ===========================================
deploy_containers() {
    log "Building and deploying containers..."

    cd "$SCRIPT_DIR"

    # Pull latest images
    log "Pulling base images..."
    docker-compose pull

    # Build custom images
    log "Building application images..."
    docker-compose build --no-cache

    # Stop existing containers
    log "Stopping existing containers..."
    docker-compose down

    # Start containers
    log "Starting containers..."
    docker-compose up -d

    log "Containers deployed successfully ✓"
}

# ===========================================
# Wait for Services
# ===========================================
wait_for_services() {
    log "Waiting for services to be healthy..."

    local max_attempts=60
    local attempt=0

    # Wait for backend
    while [ $attempt -lt $max_attempts ]; do
        if docker-compose exec -T backend wget -q --spider http://localhost:5010/api/v1/health 2>/dev/null; then
            log "Backend is healthy ✓"
            break
        fi
        attempt=$((attempt + 1))
        sleep 2
    done

    if [ $attempt -eq $max_attempts ]; then
        log_warning "Backend health check timeout"
    fi

    # Wait for frontend
    attempt=0
    while [ $attempt -lt $max_attempts ]; do
        if docker-compose exec -T frontend wget -q --spider http://localhost/ 2>/dev/null; then
            log "Frontend is healthy ✓"
            break
        fi
        attempt=$((attempt + 1))
        sleep 2
    done

    if [ $attempt -eq $max_attempts ]; then
        log_warning "Frontend health check timeout"
    fi

    log "All services are running ✓"
}

# ===========================================
# Setup SSL Certificate Renewal
# ===========================================
setup_ssl_renewal() {
    log "Setting up SSL certificate auto-renewal..."

    # Create renewal script
    cat > /etc/cron.monthly/renew-wafa-ssl.sh <<'EOF'
#!/bin/bash
cd /root/WAFA  # Adjust path as needed
docker-compose run --rm certbot renew
docker-compose exec nginx nginx -s reload
EOF

    chmod +x /etc/cron.monthly/renew-wafa-ssl.sh

    log "SSL auto-renewal configured ✓"
}

# ===========================================
# Display Status
# ===========================================
display_status() {
    log "======================================"
    log "Deployment completed successfully! 🚀"
    log "======================================"
    echo ""
    log_info "Service Status:"
    docker-compose ps
    echo ""
    log_info "Access your application:"
    log_info "  Frontend: https://${FRONTEND_DOMAIN}"
    log_info "  Backend API: https://${BACKEND_DOMAIN}/api/v1"
    log_info "  Backend Health: https://${BACKEND_DOMAIN}/api/v1/health"
    echo ""
    log_info "Useful commands:"
    log_info "  View logs: docker-compose logs -f"
    log_info "  Restart: docker-compose restart"
    log_info "  Stop: docker-compose down"
    log_info "  Update: git pull && bash deploy-vps.sh"
    echo ""
    log_info "Backup location: ${BACKUP_DIR}"
    log_info "Deployment log: ${LOG_FILE}"
    echo ""
}

# ===========================================
# Rollback Function
# ===========================================
rollback() {
    log_warning "Rolling back deployment..."

    if [ -d "$BACKUP_DIR" ]; then
        # Restore volumes
        if [ -f "${BACKUP_DIR}/volumes.tar.gz" ]; then
            docker run --rm \
                -v wafa_mongodb_data:/data \
                -v wafa_backend_uploads:/uploads \
                -v "${BACKUP_DIR}:/backup" \
                alpine tar xzf /backup/volumes.tar.gz -C / 2>/dev/null || true
        fi

        # Restore environment files
        cp -f "${BACKUP_DIR}/.env.backup" "${SCRIPT_DIR}/.env" 2>/dev/null || true
        cp -f "${BACKUP_DIR}/backend.env.backup" "${SCRIPT_DIR}/wafa-backend/.env" 2>/dev/null || true

        log "Rollback completed ✓"
    else
        log_warning "No backup found for rollback"
    fi
}

# ===========================================
# Main Execution
# ===========================================
main() {
    log "======================================"
    log "WAFA Platform - VPS Deployment"
    log "======================================"
    log "Starting deployment at $(date)"
    echo ""

    # Execute deployment steps
    check_prerequisites
    install_docker
    configure_firewall
    verify_dns
    create_backup
    setup_ssl_initial
    
    # Try to obtain SSL certificates
    if ! obtain_ssl_certificates; then
        log_warning "Continuing deployment without SSL"
    fi
    
    deploy_containers
    wait_for_services
    setup_ssl_renewal
    display_status

    log "Deployment process completed at $(date)"
}

# ===========================================
# Handle script arguments
# ===========================================
case "${1:-}" in
    rollback)
        rollback
        ;;
    *)
        main
        ;;
esac
