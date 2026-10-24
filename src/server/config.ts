/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import dotenv from 'dotenv'
dotenv.config()

function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] || fallback
  if (!value) {
    console.error(`Missing required environment variable: ${key}`)
    process.exit(1)
  }
  return value
}

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
    host: requireEnv('DB_HOST'),
    port: parseInt(requireEnv('DB_PORT', '25060'), 10),
    database: requireEnv('DB_NAME', 'defaultdb'),
    username: requireEnv('DB_USER'),
    password: requireEnv('DB_PASSWORD'),
  },

  jwt: {
    secret: requireEnv('JWT_SECRET'),
    cookieKey: 'auth_token',
    expiresIn: '30d',
  },

  geonamesUsername: process.env.GEONAMES_USERNAME || '',
  // Note: Weather now uses Open-Meteo (free, no API key required)

  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
  },
}

validateConfig()

function validateConfig() {
  // Warn if JWT secret is weak (less than 32 characters)
  if (config.jwt.secret.length < 32) {
    console.warn('WARNING: JWT_SECRET is too short. Use at least 32 characters. Generate one with: openssl rand -hex 32')
  }

  // Warn if running production without HTTPS
  if (config.env === 'production' && !config.appHost.startsWith('https://')) {
    console.warn('WARNING: Production should use HTTPS. Set APP_HOST to an https:// URL')
  }
}

export default config