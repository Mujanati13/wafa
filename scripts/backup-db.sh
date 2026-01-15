#!/bin/bash

################################################################################
# MongoDB Backup Script
# Creates timestamped backups of the MongoDB database
################################################################################

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
BACKUP_DIR="./backups/mongodb"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="wafa_backup_${TIMESTAMP}"
RETENTION_DAYS=7

# MongoDB credentials (from docker-compose.yml)
MONGO_USER="${MONGO_ROOT_USERNAME:-admin}"
MONGO_PASS="${MONGO_ROOT_PASSWORD:-changeme123}"
MONGO_DB="wafa"

# Change to project directory
cd "$(dirname "$0")/.."

echo -e "${YELLOW}Starting MongoDB backup...${NC}"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Perform backup
echo -e "${YELLOW}Creating backup: ${BACKUP_NAME}${NC}"

docker-compose exec -T mongodb mongodump \
    --username="$MONGO_USER" \
    --password="$MONGO_PASS" \
    --authenticationDatabase=admin \
    --db="$MONGO_DB" \
    --archive > "${BACKUP_DIR}/${BACKUP_NAME}.archive"

# Compress backup
echo -e "${YELLOW}Compressing backup...${NC}"
gzip "${BACKUP_DIR}/${BACKUP_NAME}.archive"

BACKUP_FILE="${BACKUP_DIR}/${BACKUP_NAME}.archive.gz"
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)

echo -e "${GREEN}✓ Backup created successfully${NC}"
echo -e "${GREEN}  File: ${BACKUP_FILE}${NC}"
echo -e "${GREEN}  Size: ${BACKUP_SIZE}${NC}"

# Remove old backups
echo -e "${YELLOW}Cleaning up old backups (older than ${RETENTION_DAYS} days)...${NC}"
find "$BACKUP_DIR" -name "wafa_backup_*.archive.gz" -type f -mtime +${RETENTION_DAYS} -delete

REMAINING_BACKUPS=$(find "$BACKUP_DIR" -name "wafa_backup_*.archive.gz" -type f | wc -l)
echo -e "${GREEN}✓ Cleanup complete. ${REMAINING_BACKUPS} backup(s) retained${NC}"

# Optional: Upload to remote storage (uncomment and configure)
# echo -e "${YELLOW}Uploading to remote storage...${NC}"
# aws s3 cp "$BACKUP_FILE" s3://your-bucket/backups/mongodb/ || true
# rclone copy "$BACKUP_FILE" remote:backups/mongodb/ || true

echo -e "${GREEN}MongoDB backup completed successfully!${NC}"

################################################################################
# Restore Instructions
################################################################################
# To restore from a backup:
# 1. Uncompress: gunzip wafa_backup_TIMESTAMP.archive.gz
# 2. Restore: docker-compose exec -T mongodb mongorestore \
#               --username=admin \
#               --password=changeme123 \
#               --authenticationDatabase=admin \
#               --archive < wafa_backup_TIMESTAMP.archive
################################################################################
