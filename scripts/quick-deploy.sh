#!/bin/bash
# Quick Deploy Script - Run from your LOCAL machine
# Usage: ./scripts/quick-deploy.sh [server-ip]

set -e

SERVER_IP="${1:-172.237.5.241}"
SSH_USER="root"
REMOTE_DIR="/opt/lot-computer"

echo "Deploying to $SERVER_IP..."

# Sync files (excluding git, node_modules, etc)
echo "[1/3] Syncing files..."
rsync -avz --progress \
    --exclude '.git' \
    --exclude 'node_modules' \
    --exclude '.env' \
    --exclude 'terraform/.terraform' \
    --exclude '*.tfstate*' \
    . $SSH_USER@$SERVER_IP:$REMOTE_DIR/

# Deploy on server
echo "[2/3] Starting containers..."
ssh $SSH_USER@$SERVER_IP "cd $REMOTE_DIR && docker-compose pull && docker-compose up -d --build"

# Check status
echo "[3/3] Checking status..."
ssh $SSH_USER@$SERVER_IP "cd $REMOTE_DIR && docker-compose ps"

echo ""
echo "Deployment complete!"
echo "Site should be available at: http://$SERVER_IP"
