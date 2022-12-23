import React from 'react'
import { TIcon } from '../../@types/customIcon'
import { iconConfig } from './config'

export const CustomIcon: React.FC<{ iconName: TIcon }> = ({ iconName }) => {
  const Component = iconConfig?.[iconName] ?? null

  return Component ? <Component /> : null
}
