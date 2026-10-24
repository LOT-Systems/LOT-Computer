/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

type ClientAppConfig = {
  appHost: string
  appName: string
  appDescription: string
}

const config: ClientAppConfig = {
  appHost: process.env.APP_HOST as unknown as string,
  appName: process.env.APP_NAME as unknown as string,
  appDescription: process.env.APP_DESCRIPTION as unknown as string,
}

export default config
