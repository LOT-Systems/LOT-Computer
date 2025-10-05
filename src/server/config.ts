import dotenv from 'dotenv'

dotenv.config()

type Config = {
  debug: boolean
  port: number
  appHost: string
  appName: string
  appDescription: string
  proxyHost: string
  env: string
  databaseUri: string
  googleOAuth2: {
    clientId: string
    clientSecret: string
  }
  jwt: {
    secret: string
    cookieKey: string
  }
  mailchimp: {
    fromEmail: string
    fromName: string
    mandrillApiKey: string
  }
  // shopify: {
  //   shopId: string
  //   apiToken: string
  // }
  // openai: {
  //   apiKey: string
  // }
  openWeatherApiKey: string
  geonamesUsername: string
  admins: string[]
}

const config: Config = {
  debug: process.env.DEBUG === 'true',
  port: tryParseNumber(process.env.PORT || '0') || 3000,
  appHost: process.env.APP_HOST || '',
  appName: process.env.APP_NAME || '',
  appDescription: process.env.APP_DESCRIPTION || '',
  proxyHost: process.env.PROXY_HOST || '',
  env: process.env.NODE_ENV || 'development',
  databaseUri: process.env.DATABASE_URL || '',
  googleOAuth2: {
    clientId: process.env.GOOGLE_OAUTH2_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_OAUTH2_CLIENT_SECRET || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET || '',
    cookieKey: process.env.JWT_COOKIE_KEY || '',
  },
  mailchimp: {
    fromEmail: process.env.MAILCHIMP_FROM_EMAIL || '',
    fromName: process.env.MAILCHIMP_FROM_NAME || '',
    mandrillApiKey: process.env.MAILCHIMP_MANDRILL_API_KEY || '',
  },
  // shopify: {
  //   shopId: process.env.SHOPIFY_SHOP_ID || '',
  //   apiToken: process.env.SHOPIFY_API_TOKEN || '',
  // },
  // openai: {
  //   apiKey: process.env.OPENAI_API_KEY || '',
  // },
  openWeatherApiKey: process.env.OPEN_WEATHER_API_KEY || '',
  geonamesUsername: process.env.GEONAMES_USERNAME || '',
  admins: tryParseJSON(process.env.ADMINS || '[]'),
}

function tryParseJSON(json: string, defaultValue = {}) {
  try {
    return JSON.parse(json)
  } catch (e) {
    return defaultValue
  }
}
function tryParseNumber(value: string, fallback = undefined) {
  const parsed = value && !isNaN(Number(value)) && Number(value)
  return parsed || fallback
}

export default config
