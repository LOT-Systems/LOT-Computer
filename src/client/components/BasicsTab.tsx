/**
 * LOT SYSTEMS CORPORATION
 * BASICS tab inside the authenticated app: same ledger, audience by tier.
 */

import * as React from 'react'
import { useStore } from '@nanostores/react'
import * as stores from '#client/stores'
import { Basics, BasicsAudience } from '#client/components/Basics'
import { UserTag } from '#shared/types'

export const BasicsTab = React.memo(function BasicsTab() {
  const me = useStore(stores.me)
  const audience: BasicsAudience = React.useMemo(() => {
    if (!me) return 'PUBLIC'
    const t = me.tags.map((x) => x.toLowerCase())
    return me.isAdmin || t.includes(UserTag.Usership.toLowerCase())
      ? 'USERSHIP'
      : 'PUBLIC'
  }, [me])
  return <Basics audience={audience} />
})
