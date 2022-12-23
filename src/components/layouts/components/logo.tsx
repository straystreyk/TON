import React from 'react'
import classes from '../../../styles/components/header.module.css'
import { CustomIcon } from '../../customIcon'
import { Link } from 'react-router-dom'

export const HeaderLogo: React.FC = () => {
  return (
    <Link to="/">
      <div className={classes.logo}>
        <CustomIcon iconName="logo" />
        <span className={classes.logoText}>TON Status</span>
      </div>
    </Link>
  )
}
