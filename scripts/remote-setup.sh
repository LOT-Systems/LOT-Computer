#!/bin/bash
# Remote Server Setup Script for Akamai/Linode
# Run this from your LOCAL machine: ./scripts/remote-setup.sh

set -e

SERVER_IP="${1:-172.237.5.241}"
SSH_USER="${2:-root}"

echo "=============================================="
echo "  LOT-Computer Server Setup"
echo "  Target: $SSH_USER@$SERVER_IP"
echo "=============================================="

# Test connection
echo ""
echo "[1/6] Testing SSH connection..."
ssh -o ConnectTimeout=10 $SSH_USER@$SERVER_IP "echo 'Connection successful!'"

# Update system
echo ""
echo "[2/6] Updating system packages..."
ssh $SSH_USER@$SERVER_IP "apt-get update && apt-get upgrade -y"

# Install Docker
echo ""
echo "[3/6] Installing Docker..."
ssh $SSH_USER@$SERVER_IP 'bash -s' << 'DOCKER_INSTALL'
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
    echo "Docker installed successfully"
else
    echo "Docker already installed"
fi
docker --version
DOCKER_INSTALL

# Install Docker Compose
echo ""
echo "[4/6] Installing Docker Compose..."
ssh $SSH_USER@$SERVER_IP 'bash -s' << 'COMPOSE_INSTALL'
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo "Docker Compose installed successfully"
else
    echo "Docker Compose already installed"
fi
docker-compose --version
COMPOSE_INSTALL

# Install nginx
echo ""
echo "[5/6] Installing nginx..."
ssh $SSH_USER@$SERVER_IP 'bash -s' << 'NGINX_INSTALL'
apt-get install -y nginx certbot python3-certbot-nginx
systemctl enable nginx
systemctl start nginx
echo "nginx installed and running"
NGINX_INSTALL

# Security setup
echo ""
echo "[6/6] Configuring security..."
ssh $SSH_USER@$SERVER_IP 'bash -s' << 'SECURITY_SETUP'
# Install fail2ban
apt-get install -y fail2ban ufw

# Configure UFW
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https
ufw --force enable

# Start fail2ban
systemctl enable fail2ban
systemctl start fail2ban

echo "Security configured: UFW and fail2ban enabled"
SECURITY_SETUP

# Create app directory
echo ""
echo "Creating application directory..."
ssh $SSH_USER@$SERVER_IP "mkdir -p /opt/lot-computer && chown -R root:root /opt/lot-computer"

echo ""
echo "=============================================="
echo "  Setup Complete!"
echo "=============================================="
echo ""
echo "Next steps:"
echo "  1. Copy your project: scp -r . $SSH_USER@$SERVER_IP:/opt/lot-computer/"
echo "  2. SSH to server: ssh $SSH_USER@$SERVER_IP"
echo "  3. Navigate: cd /opt/lot-computer"
echo "  4. Create .env: cp .env.example .env && nano .env"
echo "  5. Start app: docker-compose up -d"
echo ""
