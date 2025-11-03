import * as React from 'react'
import { useStore } from '@nanostores/react'
import { useUpdateSettings } from '#client/queries'
import * as stores from '#client/stores'
import { Block, Button, Input, Select } from '#client/components/ui'
import { UserSettings, UserTag } from '#shared/types'
import {
  COUNTRIES,
  getUserTagByIdCaseInsensitive,
  USER_SETTING_NAME_BY_ID,
} from '#shared/constants'
import { cn } from '#client/utils'

export const Settings = () => {
  const me = useStore(stores.me)
  const baseColor = useStore(stores.baseColor)
  const accentColor = useStore(stores.accentColor)

  const { mutate: updateSettings } = useUpdateSettings({
    onSuccess: () => {
      // setChanged(false)
      window.location.href = '/'
    },
  })

  const [changed, setChanged] = React.useState(false)
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

  const onSubmit = React.useCallback(
    async (ev: React.FormEvent) => {
      ev.preventDefault()
      updateSettings(state)
    },
    [state]
  )

  const userTagIds = React.useMemo(() => {
    return (me?.tags || []).filter((x) => !!getUserTagByIdCaseInsensitive(x))
  }, [me])

  return (
    <div className="flex flex-col gap-y-48">
      <div>
        <div>{me?.firstName ? me.firstName + `'s` : 'Your'} LOT setings.</div>
        <div>You can edit the settings at any time.</div>
      </div>

      <form className="flex flex-col gap-y-48 max-w-384" onSubmit={onSubmit}>
        <div className="flex gap-x-16">
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

        <div className="flex flex-col gap-y-16">
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
            <Block label="Base color:" onChildrenClick={() => null}>
              <span className={cn('inline-flex relative overflow-hidden')}>
                <input
                  className="appearance-none cursor-pointer absolute -top-1 left-0 right-0 -bottom-1 opacity-0 w-full _h-full"
                  type="color"
                  value={baseColor}
                  onChange={(x) => stores.baseColor.set(x.target.value)}
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
                  onChange={(x) => stores.accentColor.set(x.target.value)}
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

        <div className="flex gap-x-16">
          <Button kind="primary" type="submit" disabled={!changed}>
            Save
          </Button>
          <Button kind="secondary" href="/auth/logout" rel="external">
            Log out
          </Button>
        </div>
      </form>
    </div>
  )
}
