import { EventEmitter } from '#shared/utils'
import { SyncEvents } from '#shared/types'

export const sync = new EventEmitter<SyncEvents>()
