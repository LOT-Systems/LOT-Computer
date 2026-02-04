# Migration Guide: Digital Ocean to Akamai Connected Cloud

This guide covers the complete migration from Digital Ocean to Akamai Connected Cloud (formerly Linode).

## Why Akamai Connected Cloud?

### Cost Comparison (as of 2024)

| Spec | Digital Ocean | Akamai/Linode | Savings |
|------|---------------|---------------|---------|
| 2GB RAM, 1 CPU | $12/mo | $12/mo | Same |
| 4GB RAM, 2 CPU | $24/mo | $24/mo | Same |
| 8GB RAM, 4 CPU | $48/mo | $48/mo | Same |
| Object Storage | $5/mo + egress | $5/mo + egress | Same |

### Advantages of Akamai Connected Cloud

1. **Global CDN Integration** - Native integration with Akamai CDN
2. **DDoS Protection** - Enterprise-grade DDoS mitigation included
3. **More Data Centers** - 25+ global locations
4. **Predictable Pricing** - No unexpected bandwidth charges
5. **Better Uptime SLA** - 99.99% uptime guarantee

### Considerations

1. **Different API** - Requires updating automation scripts
2. **UI Differences** - Control panel is different
3. **Some Feature Gaps** - App Platform, Functions not available

## Migration Steps

### Phase 1: Setup Infrastructure

1. **Create Linode Account**
   - Sign up at https://cloud.linode.com
   - Generate API token at Profile > API Tokens

2. **Initialize Terraform**
   ```bash
   cd terraform
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your values
   terraform init
   terraform plan
   terraform apply
   ```

3. **Note the Server IP**
   ```bash
   terraform output server_ip
   ```

### Phase 2: DNS Migration

1. **Update DNS Records** (at your registrar or DNS provider)
   ```
   A    @     <new-server-ip>
   A    www   <new-server-ip>
   AAAA @     <new-ipv6>
   AAAA www   <new-ipv6>
   ```

2. **Reduce TTL First** (optional, for zero-downtime)
   - Set TTL to 300 (5 minutes) 24 hours before migration
   - After migration, increase back to 3600+

### Phase 3: Application Deployment

1. **SSH into the new server**
   ```bash
   ssh root@<server-ip>
   ```

2. **Clone your repository**
   ```bash
   cd /opt/lot-computer
   git clone <your-repo-url> .
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

4. **Deploy with Docker**
   ```bash
   docker compose up -d
   ```

5. **Setup SSL**
   ```bash
   ./scripts/ssl-setup.sh your-domain.com admin@your-domain.com
   ```

### Phase 4: Data Migration

#### Database Migration

1. **Export from Digital Ocean**
   ```bash
   # On DO server
   pg_dump -U user -h localhost dbname > backup.sql
   ```

2. **Transfer to Linode**
   ```bash
   scp backup.sql root@<linode-ip>:/tmp/
   ```

3. **Import on Linode**
   ```bash
   docker exec -i lot-computer-db psql -U lot_user lot_computer < /tmp/backup.sql
   ```

#### File Storage Migration

1. **Export from DO Spaces**
   ```bash
   s3cmd sync s3://do-bucket/ ./files/
   ```

2. **Import to Linode Object Storage**
   ```bash
   s3cmd sync ./files/ s3://linode-bucket/
   ```

### Phase 5: Verification

1. **Health Check**
   ```bash
   curl https://your-domain.com/health
   ```

2. **Monitor Logs**
   ```bash
   docker compose logs -f
   ```

3. **Test All Features**
   - User authentication
   - Database operations
   - File uploads
   - API endpoints

### Phase 6: Cleanup

1. **Keep DO running for 1 week** (rollback safety)
2. **Monitor for issues**
3. **Cancel DO resources after verification**

## Rollback Plan

If issues occur:

1. **Immediate**: Update DNS back to DO IP
2. **Short-term**: Keep DO droplet running
3. **Long-term**: Reverse data migration if needed

## GitHub Actions Secrets Required

Add these secrets to your repository:

| Secret | Description |
|--------|-------------|
| `DEPLOY_SSH_KEY` | Private SSH key for deployment |
| `SERVER_IP` | Linode server IP address |
| `LINODE_TOKEN` | Linode API token (for Terraform) |

## Support

- Linode Support: https://www.linode.com/support/
- Community: https://www.linode.com/community/
- Docs: https://www.linode.com/docs/

## Cost Monitoring

Set up billing alerts:
1. Go to Account > Billing
2. Set notification threshold
3. Enable email notifications
