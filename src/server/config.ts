import dotenv from 'dotenv'
dotenv.config()

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4400', 10),
  appName: process.env.APP_NAME || 'Your App',
  appHost: process.env.APP_HOST || 'http://localhost:4400',
  appDescription: process.env.APP_DESCRIPTION || 'Your App Description',
  
  admins: process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [],
  
  email: {
    resendApiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.RESEND_FROM_EMAIL || 'support@lot-systems.com',
    fromName: process.env.RESEND_FROM_NAME || 'Your App',
  },

  db: {
    host: process.env.DB_HOST || 'db-postgresql-nyc3-92053-do-user-22640384-0.f.db.ondigitalocean.com',
    port: parseInt(process.env.DB_PORT || '25060', 10),
    database: process.env.DB_NAME || 'defaultdb',
    username: process.env.DB_USER || 'doadmin',
    password: process.env.DB_PASSWORD || 'AVNS_8V6Hqzuxwj0JkMxgNvR',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'your-jwt-secret',
    cookieKey: 'auth_token',
    expiresIn: '30d',
  },

  geonamesUsername: process.env.GEONAMES_USERNAME || ''
  // Note: Weather now uses Open-Meteo (free, no API key required)
}

validateConfig()

function validateConfig() {
  const required = [
    'DB_HOST',
    'DB_PORT',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD',
    // Optionally require these:
    // 'GEONAMES_USERNAME',
  ]

  const missing = required.filter(key => !process.env[key])
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing)
    process.exit(1)
  }
}

export default config