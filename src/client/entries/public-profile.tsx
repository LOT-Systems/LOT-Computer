import * as React from 'react'
import { PublicProfile } from '#client/components/PublicProfile'
import { render } from '#client/utils/render'
import '#client/stores/theme'
import { Layout } from '#client/components/ui'

const App = () => {
  return (
    <Layout hideNav={true}>
      <PublicProfile />
    </Layout>
  )
}

render(<App />)
