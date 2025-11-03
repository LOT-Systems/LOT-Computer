# LOT Systems

### Run locally

<details>
  <summary>example.env</summary>

```
NODE_ENV="development"
DEBUG=true

APP_NAME="LOT"
APP_DESCRIPTION="LOT is a subscription service that distributes digital and physical necessities, basic wardrobes, organic self-care products, home and kids essentials."

PORT=4400
APP_HOST="http://127.0.0.1:4400"

# Database
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="lot_systems"
DB_USER="postgres"
DB_PASSWORD="..."

# Authentication
JWT_SECRET="..."
JWT_COOKIE_KEY="auth_token"

# Email (Resend)
RESEND_API_KEY="..."
RESEND_FROM_EMAIL="auth@lot-systems.com"
RESEND_FROM_NAME="LOT Systems"

# Optional - for geocoding
GEONAMES_USERNAME="..."

# Admin emails (comma-separated)
ADMIN_EMAILS="vadikmarmeladov@gmail.com"

```

</details>

```bash
# Before running
yarn migrations:up

# Run in development mode:
yarn server:watch
yarn client:watch

# Run in production mode:
yarn production:run
```

### Production server

The app is hosted on **Digital Ocean App Platform**. Deployment is automatic when pushing to the watched branch.

Production URL: https://lot-systems.com

To deploy changes:
1. Commit your changes to the main branch or feature branch
2. Push to GitHub
3. Digital Ocean automatically builds and deploys

To view logs and app status, visit the Digital Ocean dashboard.
