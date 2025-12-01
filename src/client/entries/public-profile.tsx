import * as React from 'react'
import { createRoot } from 'react-dom/client'
import { PublicProfile } from '#client/components/PublicProfile'

const root = document.getElementById('app')!
createRoot(root).render(<PublicProfile />)
