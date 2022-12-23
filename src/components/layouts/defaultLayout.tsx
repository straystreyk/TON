import React from 'react'
import { Header } from './components/header'
import { Footer } from './components/footer'

const DefaultLayout = React.memo<{ children: React.ReactNode }>(({ children }) => {
  return (
    <>
      <Header />
      <main className="main-content">{children}</main>
      <Footer />
    </>
  )
})

DefaultLayout.displayName = 'DefaultLayout'
export { DefaultLayout }
