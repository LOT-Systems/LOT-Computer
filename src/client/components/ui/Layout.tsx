import * as React from 'react'
import { useStore } from '@nanostores/react'
import * as stores from '#client/stores'
import { Button, Page } from '#client/components/ui'
import { cn } from '#client/utils'

type NavItem = { href: string | null; label: string | null; spacer?: boolean }

type Props = {
  children: React.ReactNode
  hideNav?: boolean
}

export const Layout: React.FC<Props> = ({ children, hideNav = false }) => {
  const me = useStore(stores.me)
  const layoutView = useStore(stores.layoutView)
  const isMirrorOn = useStore(stores.isMirrorOn)
  const none = React.useMemo(() => () => {}, [])
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/'
  const navLinks = React.useMemo<NavItem[]>(() => {
    const result: NavItem[] = me
      ? [
          { href: '/sync', label: 'Sync' },
          { href: '/log', label: 'Log' },
          { href: '/', label: 'System' },
          { href: null, label: 'Basics' },
          { href: null, label: 'Self-care' },
          { href: null, label: 'Kids' },
          { href: null, label: 'Home' },
          { href: null, label: null, spacer: true },
          { href: '/settings', label: 'Settings' },
        ]
      : [
          { href: null, label: 'Sync' },
          { href: null, label: 'Logs' },
          { href: '/', label: 'System' },
          { href: null, label: 'Basics' },
          { href: null, label: 'Self-care' },
          { href: null, label: 'Kids' },
          { href: null, label: 'Home' },
          { href: null, label: null, spacer: true },
          { href: null, label: 'Settings' },
        ]
    return layoutView === 'desktop' ? result : result.reverse()
  }, [layoutView, me])

  return (
    <div className="min-h-[100dvh] grid leading-[1.5rem]">
      <Page>{children}</Page>
      {!hideNav && (
        <div
          id="nav"
          className="sticky bottom-0 left-0 right-0 self-end transition-opacity"
        >
          <div className="desktop:px-64 tablet:px-48 phone:px-32 px-16 desktop:mb-64 tablet:mb-48 phone:mb-32 mb-16">
            <nav
              className={cn(
                'flex gap-8 phone:gap-6 tablet:gap-6 -mb-4',
                'flex-wrap-reverse tablet:flex-wrap',
                'flex-row-reverse tablet:flex-row',
                'justify-end tablet:justify-start'
              )}
            >
              {navLinks.map((link, i) => {
                const isActive = link.href === currentPath
                return link.spacer ? (
                  <div
                    key={link.label ?? i}
                    className="flex-grow tablet:block hidden"
                  />
                ) : (
                  <Button
                    key={link.label}
                    href={link.href ?? undefined}
                    kind="secondary-rounded"
                    className={cn(
                      'mb-4 flex-shrink-0',
                      isActive && (isMirrorOn
                        ? 'bg-white hover:bg-white/90 mix-blend-difference text-white'
                        : 'bg-acc text-bac hover:bg-acc/90')
                    )}
                    onClick={!link.href ? none : undefined}
                    disabled={!link.href}
                  >
                    {link.label}
                  </Button>
                )
              })}
            </nav>
          </div>
        </div>
      )}
    </div>
  )
}
