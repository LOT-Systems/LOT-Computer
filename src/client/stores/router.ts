import { createRouter, openPage } from '@nanostores/router'

type Routes = {
  system: void
  settings: void
  sync: void
  status: void
  adminUsers: void
  adminUser: 'userId'
  logs: void
}

export const router = createRouter<Routes>({
  system: '/',
  settings: '/settings',
  sync: '/sync',
  status: '/status',
  adminUsers: '/us',
  adminUser: '/us/:userId',
  logs: '/log',
})

export const goTo = <P extends keyof Routes>(
  page: P,
  params: Record<string, string> = {}
  // @ts-ignore FIXME:
) => openPage(router, page, params)
