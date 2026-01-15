#!/bin/bash

################################################################################
# SSL Certificate Renewal Script
# Renews Let's Encrypt SSL certificates and reloads Nginx
################################################################################

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Change to project directory
cd "$(dirname "$0")/.."

echo -e "${YELLOW}[$(date)] Starting SSL certificate renewal...${NC}"

# Renew certificates
docker-compose run --rm certbot renew --quiet

# Reload Nginx to pick up new certificates
if docker-compose exec -T nginx nginx -s reload; then
    echo -e "${GREEN}[$(date)] SSL certificates renewed and Nginx reloaded successfully${NC}"
else
    echo -e "${RED}[$(date)] Failed to reload Nginx${NC}"
    exit 1
fi

# Clean up old certificates (optional)
docker-compose run --rm certbot certificates

echo -e "${GREEN}[$(date)] SSL renewal completed${NC}"
