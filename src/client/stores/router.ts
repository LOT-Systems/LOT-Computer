/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

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
  basics: void
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
  basics: '/basics',
})

export const goTo = <P extends keyof Routes>(
  page: P,
  params: Record<string, string> = {}
  // @ts-ignore FIXME:
) => {
  openPage(router, page, params)
}

// Cheap, subscription-free check of the current route. Read inside interval
// callbacks to pause heavy background work when its tab is not the one being
// viewed. NOTE: this is stronger than document.hidden — switching between
// in-app tabs keeps the browser tab visible (document.hidden === false), so
// document.hidden alone does not pause work when the user leaves this tab.
export const isRouteActive = (route: keyof Routes): boolean =>
  router.get()?.route === route
