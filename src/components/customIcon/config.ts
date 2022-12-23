import { FC } from 'react'
import { ReactComponent as Logo } from '../../assets/icons/logo.svg'
import { ReactComponent as ArrowRight } from '../../assets/icons/arrowRight.svg'
import { ReactComponent as Plus } from '../../assets/icons/plus.svg'
import { ReactComponent as Minus } from '../../assets/icons/minus.svg'
import { TIcon } from '../../@types/customIcon'

export const iconConfig: { [p in TIcon]: FC } = {
  logo: Logo,
  arrowRight: ArrowRight,
  plus: Plus,
  minus: Minus,
}
