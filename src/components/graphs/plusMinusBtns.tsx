import React from 'react'
import { TNameFilter } from '../../helpers/filter'
import { plusScaleGraph, minusScaleGraph } from '../../helpers/common'

import classes from '../../styles/components/graph.module.css'
import { CustomIcon } from '../customIcon'

export const PlusMinusBtns: React.FC<{ filterName: TNameFilter }> = React.memo(({ filterName }) => {
  return (
    <div className={classes.plusMinusWrapper}>
      <button className={classes.plusMinusBtn} onClick={() => minusScaleGraph(filterName)}>
        <CustomIcon iconName="minus" />
      </button>
      <button className={classes.plusMinusBtn} onClick={() => plusScaleGraph(filterName)}>
        <CustomIcon iconName="plus" />
      </button>
    </div>
  )
})

PlusMinusBtns.displayName = 'PlusMinusBtns'
