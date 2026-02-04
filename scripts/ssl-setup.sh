#!/bin/bash
# SSL Certificate Setup Script
# Uses Let's Encrypt with Certbot

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check arguments
if [ -z "$1" ]; then
    echo -e "${RED}Usage: $0 <domain> [email]${NC}"
    echo "Example: $0 example.com admin@example.com"
    exit 1
fi

DOMAIN=$1
EMAIL=${2:-"admin@$DOMAIN"}

echo -e "${GREEN}=== SSL Certificate Setup ===${NC}"
echo -e "Domain: $DOMAIN"
echo -e "Email: $EMAIL"

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}Installing certbot...${NC}"
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
fi

# Obtain certificate
echo -e "${YELLOW}Obtaining SSL certificate...${NC}"
certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos -m "$EMAIL"

# Setup auto-renewal
echo -e "${YELLOW}Setting up auto-renewal...${NC}"
systemctl enable certbot.timer
systemctl start certbot.timer

# Test renewal
echo -e "${YELLOW}Testing renewal process...${NC}"
certbot renew --dry-run

echo -e "${GREEN}=== SSL Setup Complete ===${NC}"
echo "Certificate will auto-renew before expiration."
