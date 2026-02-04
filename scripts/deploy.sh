#!/bin/bash
# LOT-Computer Deployment Script
# Deploys to Akamai Connected Cloud (Linode)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DEPLOY_DIR="/opt/lot-computer"
BACKUP_DIR="/opt/lot-computer-backups"
MAX_BACKUPS=5

echo -e "${GREEN}=== LOT-Computer Deployment ===${NC}"

# Check if running as root or deploy user
if [[ $EUID -ne 0 ]] && [[ $(whoami) != "deploy" ]]; then
    echo -e "${RED}Please run as root or deploy user${NC}"
    exit 1
fi

# Create backup
echo -e "${YELLOW}Creating backup...${NC}"
mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
if [ -d "$DEPLOY_DIR" ]; then
    tar -czf "$BACKUP_DIR/backup_$TIMESTAMP.tar.gz" -C "$DEPLOY_DIR" . 2>/dev/null || true
fi

# Cleanup old backups
echo -e "${YELLOW}Cleaning up old backups...${NC}"
ls -t "$BACKUP_DIR"/backup_*.tar.gz 2>/dev/null | tail -n +$((MAX_BACKUPS + 1)) | xargs -r rm

# Pull latest changes
echo -e "${YELLOW}Pulling latest changes...${NC}"
cd "$DEPLOY_DIR"
git fetch origin
git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || true

# Pull latest images
echo -e "${YELLOW}Pulling Docker images...${NC}"
docker compose pull

# Stop old containers gracefully
echo -e "${YELLOW}Stopping old containers...${NC}"
docker compose down --timeout 30

# Start new containers
echo -e "${YELLOW}Starting new containers...${NC}"
docker compose up -d

# Wait for health checks
echo -e "${YELLOW}Waiting for health checks...${NC}"
sleep 10

# Verify deployment
echo -e "${YELLOW}Verifying deployment...${NC}"
if curl -sf http://localhost:3000/health > /dev/null; then
    echo -e "${GREEN}Health check passed!${NC}"
else
    echo -e "${RED}Health check failed! Rolling back...${NC}"
    docker compose down
    if [ -f "$BACKUP_DIR/backup_$TIMESTAMP.tar.gz" ]; then
        cd "$DEPLOY_DIR"
        docker compose up -d
    fi
    exit 1
fi

# Cleanup
echo -e "${YELLOW}Cleaning up...${NC}"
docker image prune -f
docker container prune -f

echo -e "${GREEN}=== Deployment Complete ===${NC}"
echo -e "Deployed at: $(date)"
