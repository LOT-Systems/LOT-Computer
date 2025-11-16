import * as React from 'react'
import { useStore } from '@nanostores/react'
import * as stores from '#client/stores'
import {
  Button,
  Input,
  Link,
  Table,
  Tag,
  TagsContainer,
  Unknown,
} from '#client/components/ui'
import {
  useUpdateLiveMessage,
  useLiveMessage,
  usePaginatedUsers,
} from '#client/queries'
import { USER_TAGS_BY_ID, COUNTRY_BY_ALPHA3 } from '#shared/constants'
import { User, UserTag, AdminUsersSort } from '#shared/types'
import { fp } from '#shared/utils'
import dayjs from '#client/utils/dayjs'
import { useDebounce, useDocumentTitle } from '#client/utils/hooks'

const LIMIT = 100

const SORT_OPTIONS: { id: AdminUsersSort; name: string }[] = [
  { id: 'newest', name: 'Newest' },
  { id: 'oldest', name: 'Oldest' },
  { id: 'last_seen', name: 'Last seen' },
]

export const AdminUsers = () => {
  useDocumentTitle('Us')
  const me = useStore(stores.me)
  const [liveMessageChanged, setLiveMessageChanged] = React.useState('')
  const [query, setQuery] = React.useState('')
  const [sort, setSort] = React.useState<AdminUsersSort>(SORT_OPTIONS[0].id)
  const [page, setPage] = React.useState(0)
  const [selectedTags, setSelectedTags] = React.useState<UserTag[]>([])

  const {
    data: liveMessageRecord = { message: '' },
    refetch: refetchLiveMessage,
  } = useLiveMessage()
  const { mutate: updateLiveMessage } = useUpdateLiveMessage({
    onSuccess: () => refetchLiveMessage(),
  })

  const isCurrentUserAdmin = React.useMemo(() => {
    return me?.isAdmin || false
  }, [me])

  const throrrledQuery = useDebounce(query, 400)

  const { data: paginatedUsers, isLoading } = usePaginatedUsers({
    limit: LIMIT,
    skip: page * LIMIT,
    sort,
    tags: selectedTags,
    query: throrrledQuery,
  })

  const users = React.useMemo(() => {
    return paginatedUsers?.data || []
  }, [paginatedUsers])

  const hasNextPage = React.useMemo(() => {
    return paginatedUsers && paginatedUsers.total > (page + 1) * LIMIT
  }, [paginatedUsers])

  const hasPrevPage = React.useMemo(() => {
    return paginatedUsers && page > 0
  }, [paginatedUsers, page])

  const onChangePage = React.useCallback(
    (dir: 1 | -1) => (ev: React.MouseEvent) => {
      ev.preventDefault()
      setPage((value) => value + dir)
    },
    []
  )

  const liveMessage = React.useMemo(
    () => liveMessageRecord.message,
    [liveMessageRecord]
  )

  React.useEffect(() => {
    setLiveMessageChanged(liveMessage)
  }, [liveMessage])

  const columns = React.useMemo(() => {
    return [
      {
        id: 'name',
        header: 'Name',
        accessor: (x: User) => {
          const name = ((x.firstName || '') + ' ' + (x.lastName || '')).trim()
          return (
            <div className="flex gap-x-8">
              <Link href={`/us/${x.id}`}>{name || <Unknown />}</Link>
              {!!x.tags.length && (
                <TagsContainer
                  className="flex-nowrap"
                  items={x.tags.map((x) => {
                    const tag = USER_TAGS_BY_ID[x] || {
                      name: x,
                      color: 'gray',
                    }
                    return (
                      <Tag key={x} fill>
                        {tag.name}
                      </Tag>
                    )
                  })}
                />
              )}
            </div>
          )
        },
      },
      {
        id: 'active',
        header: 'Active',
        accessor: (x: User) => (!!x.joinedAt ? 'Yes' : <Unknown>No</Unknown>),
      },
      {
        id: 'email',
        header: 'Email',
        accessor: (x: User) => (
          <Link href={`mailto:${x.email}`}>{x.email}</Link>
        ),
      },
      {
        id: 'location',
        header: 'Location',
        accessor: (x: User) => {
          let country = ''
          if (x.country) {
            country = COUNTRY_BY_ALPHA3[x.country]?.name || x.country
          }
          return (
            [country, x.city].filter(Boolean).join(', ') || (
              <Unknown children="-" />
            )
          )
        },
      },
      {
        id: 'createdAt',
        header: 'Joined',
        accessor: (x: User) => dayjs(x.createdAt).format('D MMMM YYYY'),
      },
    ]
  }, [])

  const onSubmitLiveMessage = React.useCallback(
    (ev: React.FormEvent) => {
      ev.preventDefault()
      const value = liveMessageChanged.trim()
      updateLiveMessage({ message: value })
    },
    [liveMessageChanged]
  )

  return (
    <div className="flex flex-col desktop:gap-y-64 tablet:gap-y-48 phone:gap-y-32 gap-y-16">
      <div>
        <Link href="/system" rel="external">
          /system
        </Link>
      </div>

      {isCurrentUserAdmin && (
        <form onSubmit={onSubmitLiveMessage} className="flex gap-x-16">
          <Input
            name="live-message"
            type="text"
            value={liveMessageChanged}
            onChange={setLiveMessageChanged}
            placeholder="Live message"
            containerClassName="flex-1"
            className="w-full"
          />
          <Button
            type="submit"
            kind="secondary"
            disabled={liveMessageChanged === liveMessage}
          >
            {!liveMessageChanged.trim() && !!liveMessage ? 'Remove' : 'Post'}
          </Button>
        </form>
      )}

      <div className="flex flex-col gap-y-16">
        <Input
          type="text"
          value={query}
          onChange={setQuery}
          placeholder="Search"
          className="w-full"
        />

        <div className="flex flex-wrap">
          <div className="mr-8">Filters:</div>
          <TagsContainer
            items={Object.values(UserTag).map((tagId) => {
              const tag = USER_TAGS_BY_ID[tagId] || {
                name: tagId,
                color: 'gray',
              }
              return (
                <Tag
                  key={tagId}
                  fill={selectedTags.includes(tagId)}
                  onClick={() => {
                    setSelectedTags(fp.toggleInArray(selectedTags, tagId))
                  }}
                >
                  {tag.name}
                </Tag>
              )
            })}
          />
        </div>

        <div className="flex flex-wrap">
          <div className="mr-8">Sort:</div>
          <TagsContainer
            items={SORT_OPTIONS.map((x) => (
              <Tag
                key={x.id}
                fill={sort === x.id}
                onClick={() => {
                  setSort(x.id)
                }}
              >
                {x.name}
              </Tag>
            ))}
          />
        </div>
      </div>

      <div className="flex flex-col gap-y-8">
        <div>Total: {paginatedUsers?.total || 0}</div>
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-x-16">
            <div>
              Page: {page + 1} /{' '}
              {Math.ceil((paginatedUsers?.total || 0) / LIMIT)}
            </div>
            <div className="flex gap-x-8">
              <Button
                size="small"
                onClick={onChangePage(-1)}
                disabled={!hasPrevPage}
                kind="secondary"
              >
                Prev
              </Button>
              <Button
                size="small"
                onClick={onChangePage(1)}
                disabled={!hasNextPage}
                kind="secondary"
              >
                Next
              </Button>
            </div>

            <Button
              size="small"
              onClick={() => {
                setPage(0)
                setQuery('')
                setSort(SORT_OPTIONS[0].id)
                setSelectedTags([])
              }}
              kind="secondary"
              className="ml-8"
              disabled={
                !(
                  page !== 0 ||
                  selectedTags.length ||
                  query ||
                  sort !== SORT_OPTIONS[0].id
                )
              }
            >
              Reset
            </Button>
          </div>
        </div>

        {!users.length && isLoading ? (
          <Unknown>Loading...</Unknown>
        ) : !users.length ? (
          <Unknown>No data</Unknown>
        ) : (
          <Table
            columns={columns}
            data={users}
            className="desktop:-mx-64 tablet:-mx-48 phone:-mx-32 -mx-16"
            paddingClassName="desktop:px-64 tablet:px-48 phone:px-32 px-16"
          />
        )}
      </div>
    </div>
  )
}
