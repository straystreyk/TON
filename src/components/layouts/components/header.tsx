import React from 'react'
import { Container } from './container'
import { CustomIcon } from '../../customIcon'
import classes from '../../../styles/components/header.module.css'
import layoutClasses from '../../../styles/components/layouts.module.css'
import { HeaderLogo } from './logo'

export const HeaderContent = () => (
  <div className={classes.headerContent}>
    <HeaderLogo />
    <a className={classes.tonLink} rel="noreferrer" target="_blank" href="https://ton.org/">
      TON.org <CustomIcon iconName="arrowRight" />
    </a>
  </div>
)

export const Header: React.FC = React.memo(() => (
  <header className={classes.header}>
    <Container className={layoutClasses.offContainer}>
      <HeaderContent />
    </Container>
  </header>
))

Header.displayName = 'Header'
