#!/bin/bash

################################################################################
# MongoDB Restore Script
# Restores MongoDB database from a backup file
################################################################################

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
BACKUP_DIR="./backups/mongodb"

# MongoDB credentials (from docker-compose.yml)
MONGO_USER="${MONGO_ROOT_USERNAME:-admin}"
MONGO_PASS="${MONGO_ROOT_PASSWORD:-changeme123}"

# Change to project directory
cd "$(dirname "$0")/.."

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}MongoDB Database Restore${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    echo -e "${RED}✗ Backup directory not found: $BACKUP_DIR${NC}"
    exit 1
fi

# List available backups
echo -e "${YELLOW}Available backups:${NC}"
backups=($(find "$BACKUP_DIR" -name "wafa_backup_*.archive.gz" -type f | sort -r))

if [ ${#backups[@]} -eq 0 ]; then
    echo -e "${RED}✗ No backups found in $BACKUP_DIR${NC}"
    exit 1
fi

# Display backups with numbers
for i in "${!backups[@]}"; do
    backup_file="${backups[$i]}"
    backup_name=$(basename "$backup_file")
    backup_date=$(echo "$backup_name" | grep -oP '\d{8}_\d{6}')
    backup_size=$(du -h "$backup_file" | cut -f1)
    echo -e "  ${GREEN}[$((i+1))]${NC} $backup_name (${backup_size})"
done

echo ""
echo -e "${YELLOW}Enter the number of the backup to restore (or 'q' to quit):${NC}"
read -r selection

# Validate selection
if [[ "$selection" == "q" ]] || [[ "$selection" == "Q" ]]; then
    echo "Cancelled."
    exit 0
fi

if ! [[ "$selection" =~ ^[0-9]+$ ]] || [ "$selection" -lt 1 ] || [ "$selection" -gt ${#backups[@]} ]; then
    echo -e "${RED}✗ Invalid selection${NC}"
    exit 1
fi

# Get selected backup
BACKUP_FILE="${backups[$((selection-1))]}"
echo ""
echo -e "${YELLOW}Selected backup: $(basename "$BACKUP_FILE")${NC}"
echo ""
echo -e "${RED}⚠ WARNING: This will replace the current database!${NC}"
echo -e "${YELLOW}Type 'yes' to continue:${NC}"
read -r confirm

if [[ "$confirm" != "yes" ]]; then
    echo "Cancelled."
    exit 0
fi

# Create temporary directory for decompression
TEMP_DIR=$(mktemp -d)
TEMP_ARCHIVE="$TEMP_DIR/restore.archive"

# Decompress backup
echo -e "${YELLOW}Decompressing backup...${NC}"
gunzip -c "$BACKUP_FILE" > "$TEMP_ARCHIVE"

# Stop backend temporarily to prevent conflicts
echo -e "${YELLOW}Stopping backend service...${NC}"
docker-compose stop backend

# Perform restore
echo -e "${YELLOW}Restoring database...${NC}"
docker-compose exec -T mongodb mongorestore \
    --username="$MONGO_USER" \
    --password="$MONGO_PASS" \
    --authenticationDatabase=admin \
    --drop \
    --archive < "$TEMP_ARCHIVE"

# Clean up
rm -rf "$TEMP_DIR"

# Restart backend
echo -e "${YELLOW}Restarting backend service...${NC}"
docker-compose start backend

# Wait for backend to be ready
echo -e "${YELLOW}Waiting for backend to be ready...${NC}"
sleep 5

if docker-compose exec -T backend wget -q --spider http://localhost:5010/api/v1/test 2>/dev/null; then
    echo -e "${GREEN}✓ Backend is ready${NC}"
else
    echo -e "${RED}✗ Backend may not be fully ready yet${NC}"
fi

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✓ Database restored successfully!${NC}"
echo -e "${GREEN}================================${NC}"
