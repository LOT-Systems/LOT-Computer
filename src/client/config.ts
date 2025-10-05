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
