import * as React from 'react'
import { useStore } from '@nanostores/react'
import * as C from '#client/components/ui'
import { render } from '#client/utils/render'
import { getMe } from '#client/queries'
import * as stores from '#client/stores'
import { cn } from '../utils'

const UiLib = () => {
  const baseColor = useStore(stores.baseColor)
  const accentColor = useStore(stores.accentColor)

  React.useEffect(() => {
    // @ts-ignore
    window.s = stores
    getMe().then((user) => {
      stores.me.set(user)
    })
  }, [])

  const [selectOption, setSelectOption] = React.useState<string | undefined>(
    undefined
  )
  const [v1, setV1] = React.useState('')

  const doAction = React.useCallback(() => alert('Action!'), [])

  return (
    <C.Layout>
      <div className="flex flex-col gap-y-32">
        <div>LOT Systems UI library</div>

        <div>
          This is an example of a multiline text block.
          <br />
          This is a link to the <C.Link href="/">home page</C.Link>.
          <br />
          In case of any error, the system will show:{' '}
          <C.ErrorLine>Internal error</C.ErrorLine>.
          <br />
          Some text labels can be <C.Unknown>dimmed</C.Unknown> if the data is
          unknown.
        </div>

        <C.Block label="Clock:" blockView>
          <C.Clock format="HH:mm:ss, D MMMM, YYYY" interval={200} />
        </C.Block>

        <div>
          <C.Block label="Static block:">Value</C.Block>
          <C.Block label="Clickable label:" onLabelClick={doAction}>
            Value
          </C.Block>
          <C.Block label="Clickable value:" onChildrenClick={doAction}>
            Value
          </C.Block>
          <C.Block label="Fully clickable:" onClick={doAction}>
            Value
          </C.Block>
        </div>

        <div>
          <C.Block label="Base color:" onChildrenClick={() => null}>
            <span className={cn('inline-flex relative overflow-hidden')}>
              <input
                className="appearance-none cursor-pointer absolute -top-1 left-0 right-0 -bottom-1 opacity-0 w-full _h-full"
                type="color"
                value={baseColor}
                onChange={(x) => stores.baseColor.set(x.target.value)}
              />
              {baseColor.toUpperCase()}
            </span>
          </C.Block>
          <C.Block label="Accent color:" onChildrenClick={() => null}>
            <span className={cn('inline-flex relative overflow-hidden')}>
              <input
                className="appearance-none cursor-pointer absolute -top-1 left-0 right-0 -bottom-1 opacity-0 w-full _h-full"
                type="color"
                value={accentColor}
                onChange={(x) => stores.accentColor.set(x.target.value)}
              />
              {accentColor.toUpperCase()}
            </span>
          </C.Block>
        </div>

        {/* Tag */}
        <C.Block label="Tag:" blockView>
          <C.TagsContainer
            items={[
              <C.Tag>Regular</C.Tag>,
              <C.Tag fill>Filled</C.Tag>,
              <C.Tag fill onClick={doAction}>
                Clickable
              </C.Tag>,
            ]}
          />
        </C.Block>

        {/* Buttons */}
        <C.Block label="Primary:" blockView containsButton>
          <div className="flex items-center gap-x-16">
            <C.Button kind="primary" onClick={doAction}>
              Button
            </C.Button>
            <C.Button kind="primary" disabled onClick={doAction}>
              Disabled
            </C.Button>
            <C.Button kind="primary" size="small" onClick={doAction}>
              Button
            </C.Button>
            <C.Button kind="primary" size="small" disabled onClick={doAction}>
              Disabled
            </C.Button>
          </div>
        </C.Block>

        <C.Block label="Secondary:" blockView containsButton>
          <div className="flex items-center gap-x-16">
            <C.Button kind="secondary" onClick={doAction}>
              Button
            </C.Button>
            <C.Button kind="secondary" onClick={doAction} disabled>
              Disabled
            </C.Button>
            <C.Button kind="secondary" size="small" onClick={doAction}>
              Button
            </C.Button>
            <C.Button kind="secondary" size="small" onClick={doAction} disabled>
              Disabled
            </C.Button>
          </div>
        </C.Block>

        <C.Block label="Rounded:" blockView containsButton>
          <div className="flex items-center gap-x-16">
            <C.Button kind="secondary-rounded" onClick={doAction}>
              Button
            </C.Button>
            <C.Button kind="secondary-rounded" onClick={doAction} disabled>
              Disabled
            </C.Button>
            <C.Button kind="secondary-rounded" size="small" onClick={doAction}>
              Button
            </C.Button>
            <C.Button
              kind="secondary-rounded"
              size="small"
              onClick={doAction}
              disabled
            >
              Disabled
            </C.Button>
          </div>
        </C.Block>

        <C.Block label="Clickable label:" blockView>
          <C.GhostButton onClick={doAction}>Click me</C.GhostButton>
        </C.Block>

        {/* Inputs */}
        <C.Block label="Input:" blockView containsButton>
          <C.Input type="text" placeholder="Type here..." />
        </C.Block>
        <C.Block label="Select:" blockView containsButton>
          <C.Select
            value={selectOption}
            onChange={setSelectOption}
            placeholder="Pick an option..."
            options={[
              { value: 'a', label: 'First option' },
              { value: 'b', label: 'Second option' },
              { value: 'c', label: 'Third option (disabled)', disabled: true },
              { value: 'd', label: 'Fourth option' },
            ]}
          />
        </C.Block>
        <C.Block label="Hidden input:" blockView containsSmallButton>
          <C.ResizibleGhostInput
            value={v1}
            onChange={setV1}
            placeholder="Type here..."
            direction="vh"
            containerClassName="translate-y-[6px] mr-16"
          />
          <C.Button size="small" onClick={doAction}>
            Button
          </C.Button>
        </C.Block>

        <C.Block label="Table:" blockView containsSmallButton>
          <C.Table
            columns={[
              {
                id: 'name',
                header: 'Name',
                accessor: (x: any) => x.name,
              },
              {
                id: 'email',
                header: 'Email',
                accessor: (x: any) => (
                  <C.Link href={`mailto:${x.email}`}>{x.email}</C.Link>
                ),
              },
              {
                id: 'location',
                header: 'Location',
                accessor: (x: any) => x.location,
              },
            ]}
            data={[
              {
                name: 'John Doe',
                email: 'john@acme.com',
                location: 'New York',
              },
              {
                name: 'Jane Doe',
                email: 'jane@acme.com',
                location: 'Los Angeles',
              },
              {
                name: 'Alice Smith',
                email: 'alice@acme.com',
                location: 'Chicago',
              },
            ]}
          />
        </C.Block>
      </div>
    </C.Layout>
  )
}

render(<UiLib />)
