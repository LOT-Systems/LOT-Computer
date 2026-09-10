/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { useStore } from '@nanostores/react'
import * as stores from '#client/stores'
import { goTo } from '#client/stores/router'
// Import directly from the component files, NOT the barrel (#client/components/ui).
// Layout is itself re-exported by that barrel, so importing the barrel here
// creates a circular dependency (ui/index -> Layout -> ui/index). With esbuild
// code-splitting that cycle can initialize a chunk binding out of order and
// throw "Cannot access uninitialized variable" at render — and since Layout
// wraps every page, it takes down the whole app.
import { Button } from './Button'
import { Page } from './Page'
import { cn } from '#client/utils'

type RouteName = 'sync' | 'logs' | 'system' | 'api' | 'settings' | 'basics'

type NavItem = { label: string | null; spacer?: boolean; route?: RouteName }

const NavButton = React.memo(function NavButton({
  link,
  isActive,
  isMirrorOn,
}: {
  link: NavItem
  isActive: boolean
  isMirrorOn: boolean
}) {
  return (
    <Button
      kind="secondary-rounded"
      className={cn(
        'mb-4 flex-shrink-0',
        !link.route && 'opacity-30 pointer-events-none',
        // Active tab: solid fill, no hover effect. before:!hidden fully
        // disables the grid-fill-hover ::before (grid + opaque backdrop) so
        // hovering the active button never overpaints its solid fill.
        isActive && (isMirrorOn
          ? 'bg-white/20 hover:bg-white/20 before:!hidden'
          : 'bg-acc text-bac before:!hidden')
      )}
      onClick={link.route ? () => goTo(link.route!) : undefined}
      disabled={!link.route}
    >
      {link.label}
    </Button>
  )
})

type Props = {
  children: React.ReactNode
  hideNav?: boolean
}

export const Layout: React.FC<Props> = ({ children, hideNav = false }) => {
  const isLoggedIn = useStore(stores.isLoggedIn)
  const layoutView = useStore(stores.layoutView)
  const isMirrorOn = useStore(stores.isMirrorOn)
  const routerState = useStore(stores.router)
  const currentRoute = routerState?.route ?? 'system'
  const navLinks = React.useMemo<NavItem[]>(() => {
    const result: NavItem[] = isLoggedIn
      ? [
          { label: 'Sync', route: 'sync' },
          { label: 'Log', route: 'logs' },
          { label: 'System', route: 'system' },
          { label: 'Basics', route: 'basics' },
          { label: 'Self-care' },
          { label: 'Kids' },
          { label: 'Home' },
          { label: null, spacer: true },
          { label: 'API', route: 'api' },
          { label: 'Settings', route: 'settings' },
        ]
      : [
          { label: 'Sync' },
          { label: 'Logs' },
          { label: 'System', route: 'system' },
          { label: 'Basics', route: 'basics' },
          { label: 'Self-care' },
          { label: 'Kids' },
          { label: 'Home' },
          { label: null, spacer: true },
          { label: 'Settings' },
        ]
    return layoutView === 'desktop' ? result : result.reverse()
  }, [layoutView, isLoggedIn])

  return (
    <div className="min-h-[100dvh] grid leading-[1.5rem]" data-lot-genesis="true">
      <Page>{children}</Page>
      {!hideNav && (
        <div
          id="nav"
          className="sticky bottom-0 left-0 right-0 self-end transition-opacity z-10"
        >
          <div className="px-16 phone:px-32 tablet:px-48 desktop:px-64 mb-16 phone:mb-32 tablet:mb-48 desktop:mb-64">
            <nav
              className={cn(
                'flex gap-8 phone:gap-6 -mb-4',
                'flex-wrap-reverse tablet:flex-wrap',
                'flex-row-reverse tablet:flex-row',
                'justify-end tablet:justify-start'
              )}
            >
              {navLinks.map((link, i) =>
                link.spacer ? (
                  <div
                    key={link.label ?? i}
                    className="flex-grow tablet:block hidden"
                  />
                ) : (
                  <NavButton
                    key={link.label}
                    link={link}
                    isActive={link.route === currentRoute}
                    isMirrorOn={isMirrorOn}
                  />
                )
              )}
            </nav>
          </div>
        </div>
      )}
    </div>
  )
}
