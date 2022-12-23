import React from 'react'

import { Container } from './container'
import { HeaderContent } from './header'
import { footerLinkItems } from '../config'

import classes from '../../../styles/components/footer.module.css'
import layoutClasses from '../../../styles/components/layouts.module.css'

export const Footer = React.memo(() => {
  return (
    <footer className={classes.footer}>
      <Container className={layoutClasses.offContainer}>
        <h5>Sources</h5>
        <div className={classes.footerTop}>
          {footerLinkItems.map((item, index) => {
            return (
              <a key={index} className={classes.footerLinkItem} href={item.href}>
                {item.name}
              </a>
            )
          })}
        </div>
        <div className={classes.footerBottom}>
          <HeaderContent />
        </div>
      </Container>
    </footer>
  )
})

Footer.displayName = 'Footer'
