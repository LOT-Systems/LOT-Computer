import * as React from 'react'
import { useStore } from '@nanostores/react'
import { useUpdateSettings, useMyMemoryStory } from '#client/queries'
import * as stores from '#client/stores'
import { Block, Button, GhostButton, Input, Select, Link } from '#client/components/ui'
import { UserSettings, UserTag } from '#shared/types'
import {
  COUNTRIES,
  getUserTagByIdCaseInsensitive,
  USER_SETTING_NAME_BY_ID,
} from '#shared/constants'
import { cn } from '#client/utils'

interface StatusData {
  version: string
  overall: 'ok' | 'degraded' | 'error'
}

export const Settings = () => {
  const me = useStore(stores.me)
  const baseColor = useStore(stores.baseColor)
  const accentColor = useStore(stores.accentColor)
  const isCustomThemeEnabled = useStore(stores.isCustomThemeEnabled)
  const { data: storyData } = useMyMemoryStory()

  const { mutate: updateSettings } = useUpdateSettings({
    onSuccess: () => {
      // Ensure custom theme colors are saved before redirect
      if (isCustomThemeEnabled) {
        stores.customTheme.set({
          base: baseColor,
          acc: accentColor
        })
      }

      // Add small delay to ensure localStorage is flushed before redirect
      setTimeout(() => {
        window.location.href = '/'
      }, 150)
    },
  })

  const [changed, setChanged] = React.useState(false)
  const [statusData, setStatusData] = React.useState<StatusData | null>(null)
  const [state, setState] = React.useState<UserSettings>({
    firstName: me!.firstName,
    lastName: me!.lastName,
    city: me!.city,
    phone: me!.phone,
    address: me!.address,
    country: me!.country,
    hideActivityLogs: me!.hideActivityLogs,
  })

  const counties = React.useMemo(() => {
    return COUNTRIES.map((x) => ({
      label: x.name,
      value: x.alpha3,
    }))
  }, [])

  const onChange = React.useCallback(
    (field: keyof UserSettings) => (value: string) => {
      setState((state) => ({
        ...state,
        [field]: value,
      }))
      setChanged(true)
    },
    []
  )

  const onToggleActivityLogs = React.useCallback(() => {
    setState((state) => ({
      ...state,
      hideActivityLogs: !state.hideActivityLogs,
    }))
    setChanged(true)
  }, [])

  // Log theme change to server
  const logThemeChange = React.useCallback(async (themeData: {
    theme: string
    baseColor?: string
    accentColor?: string
    customThemeEnabled: boolean
  }) => {
    try {
      await fetch('/api/theme-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(themeData),
      })
    } catch (error) {
      console.error('Failed to log theme change:', error)
    }
  }, [])

  const onToggleCustomTheme = React.useCallback(() => {
    const newValue = !isCustomThemeEnabled
    stores.isCustomThemeEnabled.set(newValue)
    if (newValue) {
      stores.theme.set('custom')
      logThemeChange({
        theme: 'custom',
        baseColor,
        accentColor,
        customThemeEnabled: true,
      })
    } else {
      // Switch back to automatic theme based on time
      stores.theme.set('light')
      logThemeChange({
        theme: 'light',
        customThemeEnabled: false,
      })
    }
  }, [isCustomThemeEnabled, baseColor, accentColor, logThemeChange])

  const onSubmit = React.useCallback(
    async (ev: React.FormEvent) => {
      ev.preventDefault()
      updateSettings(state)
    },
    [state]
  )

  const userTagIds = React.useMemo(() => {
    // Convert database tags (lowercase) to enum values (proper case) for comparison
    const tags = (me?.tags || [])
      .map((tag) => {
        // Find the matching enum value by case-insensitive comparison
        const enumValue = Object.values(UserTag).find(
          (enumTag) => enumTag.toLowerCase() === tag.toLowerCase()
        )
        return enumValue
      })
      .filter(Boolean) as UserTag[]

    // Debug logging to diagnose theme picker visibility issue
    console.log('[Settings Debug] User tags from DB:', me?.tags)
    console.log('[Settings Debug] Computed userTagIds:', tags)
    console.log('[Settings Debug] Should show theme picker:', [
      UserTag.Admin,
      UserTag.Mala,
      UserTag.RND,
      UserTag.Evangelist,
      UserTag.Onyx,
      UserTag.Usership,
      UserTag.Pro,
    ].some((x) => tags.includes(x)))

    return tags
  }, [me])

  // Fetch status data for the status link
  React.useEffect(() => {
    fetch('/api/public/status')
      .then((res) => res.json())
      .then((data) => {
        setStatusData({
          version: data.version,
          overall: data.overall,
        })
      })
      .catch((err) => {
        console.error('Failed to fetch status:', err)
      })
  }, [])

  const statusText = statusData
    ? statusData.overall === 'ok'
      ? `Status page (v${statusData.version})`
      : `Status page (v${statusData.version}) - System issues detected`
    : 'Status page (loading...)'

  return (
    <div className="flex flex-col gap-y-16">
      <div>
        <div>{me?.firstName ? me.firstName + `'s` : 'Your'} LOT setings.</div>
        <div>You can edit the settings at any time.</div>
      </div>

      <form className="flex flex-col gap-y-16 max-w-384" onSubmit={onSubmit}>
        <div className="flex gap-x-8">
          <div className="flex-grow">
            <Input
              type="text"
              name="firstName"
              value={state.firstName || ''}
              onChange={onChange('firstName')}
              placeholder={USER_SETTING_NAME_BY_ID['firstName']}
              className="w-full"
            />
          </div>
          <div className="flex-grow">
            <Input
              type="text"
              name="lastName"
              value={state.lastName || ''}
              onChange={onChange('lastName')}
              placeholder={USER_SETTING_NAME_BY_ID['lastName']}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex flex-col gap-y-8">
          <Select
            name="country"
            value={state.country || ''}
            onChange={onChange('country')}
            placeholder={USER_SETTING_NAME_BY_ID['country']}
            className="w-full"
            options={counties}
          />
          <Input
            type="text"
            name="city"
            value={state.city || ''}
            onChange={onChange('city')}
            className="w-full"
            placeholder={USER_SETTING_NAME_BY_ID['city']}
          />
          <Input
            type="text"
            name="address"
            value={state.address || ''}
            onChange={onChange('address')}
            className="w-full"
            placeholder={USER_SETTING_NAME_BY_ID['address']}
          />
          <Input
            type="text"
            name="phone"
            value={state.phone || ''}
            onChange={onChange('phone')}
            className="w-full"
            placeholder={USER_SETTING_NAME_BY_ID['phone']}
          />
        </div>

        {[
          UserTag.Admin,
          UserTag.Mala,
          UserTag.RND,
          UserTag.Evangelist,
          UserTag.Onyx,
          UserTag.Usership,
          UserTag.Pro,
        ].some((x) => userTagIds.includes(x)) && (
          <div>
            <Block label="Custom theme:" onChildrenClick={onToggleCustomTheme}>
              {isCustomThemeEnabled ? 'On' : 'Off'}
            </Block>
            <Block label="Base color:" onChildrenClick={() => null}>
              <span className={cn('inline-flex relative overflow-hidden')}>
                <input
                  className="appearance-none cursor-pointer absolute -top-1 left-0 right-0 -bottom-1 opacity-0 w-full _h-full"
                  type="color"
                  value={baseColor}
                  onChange={(x) => {
                    const newColor = x.target.value
                    stores.baseColor.set(newColor)
                    logThemeChange({
                      theme: 'custom',
                      baseColor: newColor,
                      accentColor,
                      customThemeEnabled: isCustomThemeEnabled,
                    })
                  }}
                />
                {baseColor.toUpperCase()}
              </span>
            </Block>
            <Block label="Accent color:" onChildrenClick={() => null}>
              <span className={cn('inline-flex relative overflow-hidden')}>
                <input
                  className="appearance-none cursor-pointer absolute -top-1 left-0 right-0 -bottom-1 opacity-0 w-full _h-full"
                  type="color"
                  value={accentColor}
                  onChange={(x) => {
                    const newColor = x.target.value
                    stores.accentColor.set(newColor)
                    logThemeChange({
                      theme: 'custom',
                      baseColor,
                      accentColor: newColor,
                      customThemeEnabled: isCustomThemeEnabled,
                    })
                  }}
                />
                {accentColor.toUpperCase()}
              </span>
            </Block>
          </div>
        )}

        <div>
          <Block label="Activity log:" onChildrenClick={onToggleActivityLogs}>
            {state.hideActivityLogs ? 'Off' : 'On'}
          </Block>
        </div>

        <div>
          <Block label="Memory Engine:">
            {me?.memoryEngine === 'ai' ? (
              'AI-Powered'
            ) : userTagIds.includes(UserTag.Usership) ? (
              'Standard'
            ) : (
              <a
                href="https://brand.lot-systems.com"
                target="_blank"
                rel="external"
                className="-ml-4 px-4 rounded cursor-pointer transition-[background-color] hover:bg-acc/10"
              >
                Subscribe to activate → brand.lot-systems.com
              </a>
            )}
          </Block>
          <Block label="Site systems check:">
            <a href="/status" className="-ml-4 px-4 rounded cursor-pointer transition-[background-color] hover:bg-acc/10">
              {statusText}
            </a>
          </Block>
        </div>

        {/* Subscription Section for non-Usership users */}
        {!userTagIds.includes(UserTag.Usership) && (
          <div>
            <Block label="Usership:" blockView>
              <div className="mb-16">
                Unlock premium features with Usership subscription:
              </div>
              <ul className="mb-16 ml-16 list-disc text-acc/80">
                <li>AI-powered Memory Story generation</li>
                <li>Advanced AI memory engine</li>
                <li>Personalized insights from your daily logs</li>
                <li>Priority access to new features</li>
              </ul>
              <Button
                kind="primary"
                href="https://brand.lot-systems.com"
                target="_blank"
                rel="external"
              >
                Subscribe to Usership
              </Button>
            </Block>
          </div>
        )}

        <div className="flex gap-x-8">
          <Button kind="primary" type="submit" disabled={!changed}>
            Save
          </Button>
          <Button kind="secondary" href="/auth/logout" rel="external">
            Log out
          </Button>
        </div>
      </form>

      {/* Memory Story Section - Outside form to allow wider width */}
      {storyData && (
        <div className="max-w-[700px]">
          <Block label="Memory Story:" blockView>
            {storyData.story ? (
              <>
                <div className="whitespace-pre-wrap mb-16">{storyData.story}</div>
                {storyData.answerCount && (
                  <div className="text-acc/40">
                    Based on {storyData.answerCount} answer{storyData.answerCount > 1 ? 's' : ''}
                  </div>
                )}
              </>
            ) : storyData.hasUsership ? (
              <div>Start answering Memory questions to build your story.</div>
            ) : (
              <>
                <div className="mb-8">
                  Subscribe to Usership to unlock generative Memory Story feature.
                </div>
                <Link
                  href="https://brand.lot-systems.com"
                  target="_blank"
                  rel="external"
                  className="underline block"
                >
                  Visit brand.lot-systems.com
                </Link>
              </>
            )}
          </Block>
        </div>
      )}
    </div>
  )
}
