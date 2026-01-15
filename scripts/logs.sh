#!/bin/bash

################################################################################
# View Service Logs
# Helper script to view logs from Docker containers
################################################################################

# Colors
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Change to project directory
cd "$(dirname "$0")/.."

echo -e "${BLUE}Available services:${NC}"
echo "  1) backend"
echo "  2) frontend"
echo "  3) mongodb"
echo "  4) nginx"
echo "  5) certbot"
echo "  6) all"
echo ""
echo -e "${YELLOW}Select a service (1-6):${NC}"
read -r selection

case $selection in
    1) docker-compose logs -f backend ;;
    2) docker-compose logs -f frontend ;;
    3) docker-compose logs -f mongodb ;;
    4) docker-compose logs -f nginx ;;
    5) docker-compose logs -f certbot ;;
    6) docker-compose logs -f ;;
    *) echo "Invalid selection" ;;
esac
