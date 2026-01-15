#!/bin/bash

# ===========================================
# WAFA Platform - Health Check Script
# ===========================================
# This script verifies the health of all services
# Can be run manually or scheduled via cron
#
# Usage: bash healthcheck.sh
# Exit codes: 0 = healthy, 1 = unhealthy
# ===========================================

set -u  # Exit on undefined variable

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_URL="https://imrs-qcm.com"
BACKEND_URL="https://backend.imrs-qcm.com"
HEALTH_ENDPOINT="/api/v1/health"
TIMEOUT=10

# Counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# ===========================================
# Logging Functions
# ===========================================
log_success() {
    echo -e "${GREEN}✓${NC} $1"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
}

log_failure() {
    echo -e "${RED}✗${NC} $1"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# ===========================================
# Check Docker Containers
# ===========================================
check_docker_containers() {
    log_info "Checking Docker containers..."
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

    local containers=("wafa-frontend" "wafa-backend" "wafa-mongodb" "wafa-nginx")
    local all_running=true

    for container in "${containers[@]}"; do
        if docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
            local status=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "no-healthcheck")
            if [ "$status" = "healthy" ] || [ "$status" = "no-healthcheck" ]; then
                log_success "Container ${container} is running"
            else
                log_failure "Container ${container} is unhealthy (status: ${status})"
                all_running=false
            fi
        else
            log_failure "Container ${container} is not running"
            all_running=false
        fi
    done

    if [ "$all_running" = true ]; then
        return 0
    else
        return 1
    fi
}

# ===========================================
# Check Frontend Availability
# ===========================================
check_frontend() {
    log_info "Checking frontend at ${FRONTEND_URL}..."
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

    local response=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout "$TIMEOUT" "$FRONTEND_URL" 2>/dev/null)

    if [ "$response" = "200" ]; then
        log_success "Frontend is accessible (HTTP $response)"
        return 0
    else
        log_failure "Frontend returned HTTP $response (expected 200)"
        return 1
    fi
}

# ===========================================
# Check Backend API
# ===========================================
check_backend() {
    log_info "Checking backend API at ${BACKEND_URL}${HEALTH_ENDPOINT}..."
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

    local response=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout "$TIMEOUT" "${BACKEND_URL}${HEALTH_ENDPOINT}" 2>/dev/null)

    if [ "$response" = "200" ]; then
        log_success "Backend API is healthy (HTTP $response)"
        return 0
    else
        log_failure "Backend API returned HTTP $response (expected 200)"
        return 1
    fi
}

# ===========================================
# Check MongoDB Connection
# ===========================================
check_mongodb() {
    log_info "Checking MongoDB connection..."
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

    # Check if backend can connect to MongoDB through the health endpoint
    local health_response=$(curl -s --connect-timeout "$TIMEOUT" "${BACKEND_URL}${HEALTH_ENDPOINT}" 2>/dev/null)

    if echo "$health_response" | grep -q "healthy\|ok\|success"; then
        log_success "MongoDB connection is healthy"
        return 0
    else
        # Fallback: Check if MongoDB container is running
        if docker exec wafa-mongodb mongosh --eval "db.adminCommand('ping')" &>/dev/null; then
            log_success "MongoDB container is responding"
            return 0
        else
            log_failure "MongoDB connection failed"
            return 1
        fi
    fi
}

# ===========================================
# Check SSL Certificates
# ===========================================
check_ssl_certificates() {
    log_info "Checking SSL certificates..."
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

    local domains=("imrs-qcm.com" "backend.imrs-qcm.com")
    local all_valid=true

    for domain in "${domains[@]}"; do
        local expiry_date=$(echo | openssl s_client -servername "$domain" -connect "${domain}:443" 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
        
        if [ -n "$expiry_date" ]; then
            local expiry_epoch=$(date -d "$expiry_date" +%s 2>/dev/null)
            local current_epoch=$(date +%s)
            local days_until_expiry=$(( (expiry_epoch - current_epoch) / 86400 ))
            
            if [ $days_until_expiry -gt 30 ]; then
                log_success "SSL certificate for ${domain} is valid (expires in ${days_until_expiry} days)"
            elif [ $days_until_expiry -gt 0 ]; then
                log_warning "SSL certificate for ${domain} expires soon (${days_until_expiry} days)"
            else
                log_failure "SSL certificate for ${domain} has expired"
                all_valid=false
            fi
        else
            log_failure "Could not retrieve SSL certificate for ${domain}"
            all_valid=false
        fi
    done

    if [ "$all_valid" = true ]; then
        return 0
    else
        return 1
    fi
}

# ===========================================
# Check Disk Space
# ===========================================
check_disk_space() {
    log_info "Checking disk space..."
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

    local disk_usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')

    if [ "$disk_usage" -lt 80 ]; then
        log_success "Disk usage is healthy (${disk_usage}%)"
        return 0
    elif [ "$disk_usage" -lt 90 ]; then
        log_warning "Disk usage is high (${disk_usage}%)"
        return 0
    else
        log_failure "Disk usage is critical (${disk_usage}%)"
        return 1
    fi
}

# ===========================================
# Check Memory Usage
# ===========================================
check_memory() {
    log_info "Checking memory usage..."
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

    local mem_usage=$(free | awk 'NR==2 {printf "%.0f", $3*100/$2}')

    if [ "$mem_usage" -lt 80 ]; then
        log_success "Memory usage is healthy (${mem_usage}%)"
        return 0
    elif [ "$mem_usage" -lt 90 ]; then
        log_warning "Memory usage is high (${mem_usage}%)"
        return 0
    else
        log_failure "Memory usage is critical (${mem_usage}%)"
        return 1
    fi
}

# ===========================================
# Check Docker Volumes
# ===========================================
check_docker_volumes() {
    log_info "Checking Docker volumes..."
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

    local volumes=("wafa_mongodb_data" "wafa_backend_uploads")
    local all_exist=true

    for volume in "${volumes[@]}"; do
        if docker volume ls | grep -q "$volume"; then
            log_success "Volume ${volume} exists"
        else
            log_failure "Volume ${volume} not found"
            all_exist=false
        fi
    done

    if [ "$all_exist" = true ]; then
        return 0
    else
        return 1
    fi
}

# ===========================================
# Display Summary
# ===========================================
display_summary() {
    echo ""
    echo "======================================"
    echo "Health Check Summary"
    echo "======================================"
    echo -e "Total Checks: ${TOTAL_CHECKS}"
    echo -e "${GREEN}Passed: ${PASSED_CHECKS}${NC}"
    echo -e "${RED}Failed: ${FAILED_CHECKS}${NC}"
    echo "======================================"
    echo ""

    if [ $FAILED_CHECKS -eq 0 ]; then
        echo -e "${GREEN}✓ All checks passed! System is healthy.${NC}"
        return 0
    else
        echo -e "${RED}✗ Some checks failed. Please investigate.${NC}"
        return 1
    fi
}

# ===========================================
# Get Container Logs (if checks fail)
# ===========================================
get_container_logs() {
    if [ $FAILED_CHECKS -gt 0 ]; then
        log_info "Fetching recent container logs..."
        echo ""
        
        for container in "wafa-frontend" "wafa-backend" "wafa-nginx"; do
            if docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
                echo "===== ${container} (last 20 lines) ====="
                docker logs --tail 20 "$container" 2>&1
                echo ""
            fi
        done
    fi
}

# ===========================================
# Main Execution
# ===========================================
main() {
    echo "======================================"
    echo "WAFA Platform - Health Check"
    echo "======================================"
    echo "Running health checks at $(date)"
    echo ""

    # Run all checks
    check_docker_containers
    check_frontend
    check_backend
    check_mongodb
    check_ssl_certificates
    check_disk_space
    check_memory
    check_docker_volumes

    # Display results
    display_summary
    local exit_code=$?

    # Show logs if there are failures
    if [ $exit_code -ne 0 ]; then
        get_container_logs
        
        log_info "Troubleshooting tips:"
        echo "  1. Check container logs: docker-compose logs -f"
        echo "  2. Restart services: docker-compose restart"
        echo "  3. Check environment variables in .env files"
        echo "  4. Verify DNS configuration for domains"
        echo "  5. Check firewall rules: sudo ufw status"
    fi

    exit $exit_code
}

# Execute main function
main
