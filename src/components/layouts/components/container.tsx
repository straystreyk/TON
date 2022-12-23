import React from 'react'

import classes from '../../../styles/components/layouts.module.css'

export const Container: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return <div className={`${classes.container} ${className ?? ''}`}>{children}</div>
}
