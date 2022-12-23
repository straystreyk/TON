import React from 'react'
import { DefaultLayout } from '../layouts/defaultLayout'
import { Container } from '../layouts/components/container'

import classes from '../../styles/components/layouts.module.css'
import graphClasses from '../../styles/components/graph.module.css'

const ResizeElectionGraphLazy = React.lazy(() =>
  import('../graphs/electionGraph').then(({ ResizeElectionGraph }) => ({ default: ResizeElectionGraph }))
)
const ResizeSupplyGraphLazy = React.lazy(() =>
  import('../graphs/supplyGraph').then(({ ResizeSupplyGraph }) => ({ default: ResizeSupplyGraph }))
)

const SizeStackingApyGraphLazy = React.lazy(() =>
  import('../graphs/yldGraph').then(({ SizeStackingApyGraph }) => ({ default: SizeStackingApyGraph }))
)

const TransactionsResizeGraphLazy = React.lazy(() =>
  import('../graphs/transactionsGraph').then(({ TransactionsResizeGraph }) => ({ default: TransactionsResizeGraph }))
)

const InitiatedSupplyResizeGraphLazy = React.lazy(() =>
  import('../graphs/initiatedSupplyGraph').then(({ InitiatedSupplyResizeGraph }) => ({
    default: InitiatedSupplyResizeGraph,
  }))
)

const AccountSizeGraphLazy = React.lazy(() =>
  import('../graphs/accountGraph').then(({ AccountSizeGraph }) => ({
    default: AccountSizeGraph,
  }))
)

const MainPage = React.memo(() => {
  return (
    <DefaultLayout>
      <Container className={classes.offContainer}>
        <div className={classes.mainTitle}>
          <h1>The&nbsp;Open Network&nbsp;Status</h1>
        </div>
        <div className={graphClasses.graphsMainWrapper}>
          <ResizeSupplyGraphLazy />
          <InitiatedSupplyResizeGraphLazy />
          <AccountSizeGraphLazy />
          <TransactionsResizeGraphLazy />
          <ResizeElectionGraphLazy />
          <SizeStackingApyGraphLazy />
        </div>
      </Container>
    </DefaultLayout>
  )
})

MainPage.displayName = 'MainPage'

export { MainPage }
