import * as React from 'react'
import { useStore } from '@nanostores/react'
import {
  Block,
  Button,
  Link,
  ResizibleGhostInput,
  Tag,
  TagsContainer,
  Textarea,
  Unknown,
} from '#client/components/ui'
import {
  useCompleteMemoryPrompt,
  useUpdateUser,
  useUser,
  useUserMemoryPrompt,
  useUserSummary,
  useUserMemoryStory,
} from '#client/queries'
import { getUserTagByIdCaseInsensitive, USER_TAGS_BY_ID, COUNTRY_BY_ALPHA3 } from '#shared/constants'
import { DefaultQuestion, UserTag } from '#shared/types'
import * as stores from '#client/stores'
import * as fp from '#shared/utils/fp'
import dayjs from '#client/utils/dayjs'
import { cn } from '#client/utils'
import { useDocumentTitle } from '#client/utils/hooks'

export const AdminUser = () => {
  const [tagsEditorIsOn, setTagsEditorIsOn] = React.useState(false)
  const [tagsChanged, setTagsChanged] = React.useState<UserTag[]>([])
  const [isMemoryPromptShown, setIsMemoryPromptShown] = React.useState(false)
  const [isMemoryPromptChanged, setIsMemoryPromptChanged] =
    React.useState(false)
  const [memoryQuestion, setMemoryQuestion] =
    React.useState<DefaultQuestion | null>(null)
  const [memoryPromptChanged, setMemoryPromptChanged] =
    React.useState<string>('')
  const router = useStore(stores.router)

  const { data: user, refetch: refetchUser } = useUser(
    router?.route === 'adminUser' ? router.params.userId : ''
  )
  const { data: memoryPrompt } = useUserMemoryPrompt(user?.id!)
  const { data: userSummaryData, isLoading: isSummaryLoading } = useUserSummary(user?.id!)
  const { data: memoryStoryData, isLoading: isStoryLoading } = useUserMemoryStory(user?.id!)
  const { mutate: updateUser } = useUpdateUser({
    onSuccess: () => refetchUser(),
  })
  const { mutate: completeMemoryPrompt, isLoading: isMemoryPromptLoading } =
    useCompleteMemoryPrompt({
      onSuccess: (x) => setMemoryQuestion(x),
    })
  useDocumentTitle(user?.email ?? null)

  const country = React.useMemo(() => {
    if (!user?.country) return ''
    return COUNTRY_BY_ALPHA3[user.country]?.name || ''
  }, [user])

  const toggleTagsEditor = React.useCallback(() => {
    if (!user) return
    if (!tagsEditorIsOn) {
      setTagsChanged(user?.tags || [])
      setTagsEditorIsOn(true)
      return
    }
    const userTags = user?.tags || []
    const hasChanges = !fp.compareArrays(userTags, tagsChanged)
    if (hasChanges) {
      if (window.confirm('Do you want to save changes?')) {
        const sortedTagsChanged = Object.values(UserTag).filter((x) =>
          tagsChanged.includes(x)
        )
        updateUser({ id: user.id, tags: sortedTagsChanged })
      } else {
        setTagsChanged(userTags)
      }
    }
    setTagsEditorIsOn(false)
  }, [tagsEditorIsOn, tagsChanged, user])

  const onCompleteMemoryPrompt = React.useCallback(() => {
    completeMemoryPrompt({ userId: user?.id!, prompt: memoryPromptChanged })
  }, [user, memoryPromptChanged])

  React.useEffect(() => {
    if (tagsEditorIsOn) {
      const listener = (ev: KeyboardEvent) => {
        if (ev.key === 'Enter') {
          toggleTagsEditor()
        }
        if (ev.key === 'Escape') {
          setTagsChanged(user?.tags || [])
          setTagsEditorIsOn(false)
        }
      }
      window.addEventListener('keydown', listener)
      return () => {
        window.removeEventListener('keydown', listener)
      }
    }
  }, [tagsEditorIsOn, user, toggleTagsEditor])

  React.useEffect(() => {
    if (user) {
      setTagsChanged(user.tags)
    }
  }, [user])

  React.useEffect(() => {
    if (memoryPrompt && !isMemoryPromptChanged) {
      setMemoryPromptChanged(memoryPrompt.prompt)
    }
  }, [memoryPrompt, isMemoryPromptChanged])

  return (
    <div>
      <div className="mb-32 flex gap-x-16">
        <Link href="/system" rel="external">
          /system
        </Link>
        <Link href="/us">/us</Link>
      </div>

      {!user ? (
        <div>Loading...</div>
      ) : (
        <div className="grid gap-y-16">
          <div>
            <Block label="Email:">
              <Link href={`mailto:${user.email}`}>{user.email}</Link>
            </Block>
            <Block label="Name:" children={user.firstName || <Unknown />} />
            <Block label="Surname:" children={user.lastName || <Unknown />} />
          </div>
          <div>
            <Block
              label="Tags:"
              onClick={!tagsEditorIsOn ? toggleTagsEditor : undefined}
              onLabelClick={toggleTagsEditor}
              blockView
              contentClassName={cn(tagsEditorIsOn && 'blink')}
            >
              <TagsContainer
                items={
                  tagsEditorIsOn
                    ? Object.values(UserTag).map((tagId) => {
                        const tag = USER_TAGS_BY_ID[tagId] || {
                          name: tagId,
                          color: 'gray',
                        }
                        return (
                          <Tag
                            key={tagId}
                            color={tag.color}
                            fill={tagsChanged.includes(tagId)}
                            onClick={() => {
                              setTagsChanged(
                                fp.toggleInArray(tagsChanged, tagId)
                              )
                            }}
                          >
                            {tag.name}
                          </Tag>
                        )
                      })
                    : !user.tags.length
                    ? [<Unknown>None</Unknown>]
                    : user.tags.map((x) => {
                        const tag = getUserTagByIdCaseInsensitive(x) || {
                          name: x,
                        }
                        return (
                          <Tag key={x} color={tag.color} fill>
                            {tag.name}
                          </Tag>
                        )
                      })
                }
              />
            </Block>
          </div>
          <div>
            <Block
              label="Joined at:"
              children={dayjs(user.createdAt).format('D MMMM YYYY')}
            />
            <Block label="Active:">
              {user.joinedAt ? 'Yes' : <Unknown>No</Unknown>}
            </Block>
          </div>
          <div>
            <Block label="Country:" children={country || <Unknown />} />
            <Block label="City:" children={user.city || <Unknown />} />
            <Block label="Address:" children={user.address || <Unknown />} />
            <Block label="Phone:" children={user.phone || <Unknown />} />
          </div>
          {!!user.lastSeenAt && (
            <div className="mt-32">
              Last seen {dayjs(user.lastSeenAt).fromNow()}
            </div>
          )}

          <Block
            className="mt-32"
            label="Memory engine:"
            containsButton
            blockView
          >
            {!isMemoryPromptShown ? (
              <Button onClick={() => setIsMemoryPromptShown(true)}>
                Show prompt editor
              </Button>
            ) : (
              <div className="flex flex-col gap-y-16">
                <Textarea
                  className="w-full"
                  rows={16}
                  value={memoryPromptChanged}
                  onChange={(v) => {
                    setIsMemoryPromptChanged(true)
                    setMemoryPromptChanged(v)
                  }}
                />
                <div>
                  <Button
                    kind="primary"
                    onClick={onCompleteMemoryPrompt}
                    disabled={isMemoryPromptLoading}
                  >
                    {isMemoryPromptLoading ? 'Completing...' : 'Complete'}
                  </Button>
                </div>
                {!!memoryQuestion && (
                  <div>
                    <div className="mb-16">{memoryQuestion.question}</div>
                    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-8 sm:-mb-8">
                      {(memoryQuestion.options || []).map((option) => (
                        <Button
                          key={option}
                          className="w-full sm:w-auto sm:mb-8"
                          onClick={() => null}
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Block>

          {user && (
            <div className="mt-32">
              <Block label="Memory Story (What we know about user):" blockView>
                {isStoryLoading ? (
                  <div className="opacity-60">Generating story...</div>
                ) : memoryStoryData?.story ? (
                  <div className="whitespace-pre-wrap">{memoryStoryData.story}</div>
                ) : (
                  <div className="opacity-60">No Memory answers yet</div>
                )}
              </Block>
            </div>
          )}

          {user && (
            <div className="mt-32">
              <Block label="AI-Generated Profile Summary:" blockView>
                {isSummaryLoading ? (
                  <div className="opacity-60">Generating summary...</div>
                ) : userSummaryData?.summary ? (
                  <div className="whitespace-pre-wrap">{userSummaryData.summary}</div>
                ) : (
                  <div className="opacity-60">No summary available</div>
                )}
              </Block>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
