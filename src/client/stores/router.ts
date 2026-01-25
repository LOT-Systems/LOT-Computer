import { createRouter, openPage } from '@nanostores/router'

type Routes = {
  system: void
  settings: void
  api: void
  sync: void
  status: void
  adminUsers: void
  adminUser: 'userId'
  logs: void
  dm: 'userId'
}

export const router = createRouter<Routes>({
  system: '/',
  settings: '/settings',
  api: '/api',
  sync: '/sync',
  status: '/status',
  adminUsers: '/us',
  adminUser: '/us/:userId',
  logs: '/log',
  dm: '/dm/:userId',
})

// Debounce navigation to prevent rapid clicks causing issues
let navigationTimeout: NodeJS.Timeout | null = null
const NAVIGATION_DEBOUNCE_MS = 200

export const goTo = <P extends keyof Routes>(
  page: P,
  params: Record<string, string> = {}
  // @ts-ignore FIXME:
) => {
  // Clear any pending navigation
  if (navigationTimeout) {
    clearTimeout(navigationTimeout)
  }

  // Debounce navigation to prevent rapid clicks
  navigationTimeout = setTimeout(() => {
    openPage(router, page, params)
    navigationTimeout = null
  }, NAVIGATION_DEBOUNCE_MS)
}
