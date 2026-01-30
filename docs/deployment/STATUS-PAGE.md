# Public Status Page

## 🎯 Overview

A public, unauthenticated status page at **https://lot-systems.com/status** that shows real-time system health checks.

## ✨ Features

### Public Access
- ✅ **No authentication required** - Works even if login fails
- ✅ **Always accessible** - Independent of auth system
- ✅ **Cost-effective** - 2-minute caching to optimize DigitalOcean usage
- ✅ **Auto-refresh** - Automatically updates every 2 minutes

### System Health Checks

The status page monitors 9 critical components:

| Component | What It Checks |
|-----------|---------------|
| ✅ **Authentication engine** | Session model availability |
| ✅ **Sync** | CategoryEntry model availability |
| ✅ **Settings** | UserSettings model availability |
| ✅ **Admin** | User model availability |
| ✅ **Systems check** | Configuration validation |
| ✅ **Engine stack check** | Weather API functionality |
| ✅ **Database stack check** | Database connectivity |
| ✅ **Story AI stack check** | OpenAI API and UserMemory |
| ✅ **Memory Engine check** | Memory model availability |

### Display Information

- **Version**: Current application version (from package.json)
- **Build Date**: When the application was built
- **Environment**: production/development
- **Last Updated**: Timestamp of last check
- **Cache Status**: Whether results are cached
- **Response Time**: Duration for each check in milliseconds

## 🔗 Access

**URL:** https://lot-systems.com/status

No login required - just visit the URL!

## 🏗️ Architecture

### Server-Side

#### Public API Endpoint
```
GET /api/public/status
```

**Response:**
```json
{
  "version": "0.0.2",
  "timestamp": "2025-11-06T21:00:00.000Z",
  "buildDate": "2025-11-06T18:00:00.000Z",
  "environment": "production",
  "overall": "ok",
  "cached": false,
  "checks": [
    {
      "name": "Authentication engine",
      "status": "ok",
      "duration": 15
    }
    // ... more checks
  ]
}
```

#### Caching Strategy
- Results cached for **2 minutes**
- Reduces database queries
- Cost-effective for DigitalOcean
- Fresh data when needed

### Client-Side

#### Auto-Refresh
- Fetches status on page load
- Refreshes every 2 minutes automatically
- Manual refresh button available

#### Visual Indicators
- ✅ Green = Operational
- ❌ Red = Error
- ❓ Grey = Unknown

## 📊 Cost Optimization

### Why 2-Minute Caching?

1. **Database Load**: Reduces queries from 9 per request to 9 per 2 minutes
2. **API Costs**: Weather API calls limited to once per 2 minutes
3. **DigitalOcean**: Optimized for basic tier usage
4. **Performance**: Faster response times for cached results

### Frequency Recommendations

| Usage | Frequency | Cost Impact |
|-------|-----------|-------------|
| **Manual Checks** | As needed | Low (cached) |
| **Auto-Refresh** | 2 minutes | Very Low |
| **Monitoring Tools** | 5 minutes | Low |
| **External Health Check** | 10 minutes | Minimal |

## 🔧 Files Created

### Backend
```
src/server/routes/public-api.ts     - Public API routes
src/server/index.ts                 - Added /status route & public API
```

### Frontend
```
src/client/components/StatusPage.tsx  - Status page UI component
src/client/entries/status.tsx         - Status page entry point
```

### Build
```
scripts/build/client.build.ts        - Added status.tsx & us.tsx to build
```

## 🚀 Usage

### For Developers

Check system health during development:
```bash
# Local development
http://localhost:4400/status

# Production
https://lot-systems.com/status
```

### For Monitoring

Add to your monitoring tool:
```bash
# Check if site is operational
curl https://lot-systems.com/api/public/status

# Check specific component
curl https://lot-systems.com/api/public/status | jq '.checks[] | select(.name=="Database stack check")'
```

### For Users

Simply visit: https://lot-systems.com/status

- View overall system status
- See individual component health
- Check version and build date
- Verify all systems are operational

## 📈 Monitoring Integration

### DigitalOcean App Platform

The status page complements the existing `/health` endpoint:
- `/health` - Simple uptime check (required by DO)
- `/status` - Detailed system health (public status page)

### External Monitoring

Configure your monitoring service to check:
```
URL: https://lot-systems.com/api/public/status
Frequency: Every 5-10 minutes
Alert on: overall != "ok"
```

## 🐛 Troubleshooting

### If Status Page Shows Errors

1. **Check Individual Components**: See which specific check failed
2. **Review Error Messages**: Each failed check shows the error
3. **Verify Environment**: Check if all env variables are set
4. **Database**: Ensure database is accessible
5. **APIs**: Verify external API keys (Weather, OpenAI)

### Common Issues

| Error | Cause | Solution |
|-------|-------|----------|
| Database stack check failed | DB connection issue | Check DATABASE_URL |
| Story AI stack check failed | Missing API key | Set OPENAI_API_KEY |
| Engine stack check failed | Weather API issue | Check weather service |

## 💡 Benefits

### For Operations
- **Quick health checks** without logging in
- **Historical context** with timestamps
- **Detailed diagnostics** for each component

### For Users
- **Transparency** about system status
- **Trust** through visibility
- **Information** during incidents

### For Development
- **Easy debugging** of deployment issues
- **Quick verification** after deployments
- **Component isolation** for troubleshooting

## 🔐 Security

### What's Public
- System health status
- Component names
- Response times
- Version number

### What's Private
- User data (not exposed)
- Database credentials (not exposed)
- API keys (not exposed)
- Detailed error stacks (sanitized)

The status page only exposes operational metadata, not sensitive data.

---

**Status Page URL:** https://lot-systems.com/status

Built with ❤️ for transparency and reliability.
