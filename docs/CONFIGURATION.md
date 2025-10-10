# LOT Systems Configuration Guide

## Current Working Configuration (as of $(date))

### Server Setup
- Backend Port: 4400
- Environment: Development
- Database: PostgreSQL on DigitalOcean
- Email: Resend.com
- AI: OpenAI Integration

### Critical Dependencies
- Node.js >=22.x
- PostgreSQL
- Resend API
- OpenAI API

### Environment Variables
Required environment variables and their purposes:
\`\`\`env
# App Configuration
APP_NAME="LOT Systems"
APP_HOST="http://localhost:4400"
APP_DESCRIPTION="LOT is a subscription service..."

# Database Configuration
DB_HOST=db-postgresql-nyc3...
DB_PORT=25060
DB_NAME=defaultdb
DB_USER=doadmin
DB_SSL=true

# Email Configuration
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=support@lot-systems.com
RESEND_FROM_NAME="LOT"

# OpenAI Configuration
OPENAI_API_KEY=sk-proj-...

# JWT Configuration
JWT_SECRET=your-secret
\`\`\`

### Known Working State
- ✅ Server starts successfully
- ✅ Database connects
- ✅ OpenAI integration working
- ❌ Login form needs fixing
- ❌ Email integration needs debugging

### Development Commands
- Start server: \`yarn dev:local\`
- Build: \`yarn build\`
- Test email: \`yarn test:email\`

### Current Issues
1. Login form returns "Unknown error"
2. Resend email integration not connecting

### Last Known Good Version
Git Tag: v0.1.1-restored
