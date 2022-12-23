import React from 'react'
import { IGraphWrapper } from '../../@types/graph'

import classes from '../../styles/components/graph.module.css'
import { GraphDateButtons } from './graphDateButtons'
import { useMediaQuery } from 'react-responsive'
import { MEDIA_CONFIG } from '../../helpers/media'
import { PlusMinusBtns } from './plusMinusBtns'

export const GraphWrapper: React.FC<IGraphWrapper> = ({
  title,
  children,
  initialButtonValue,
  className,
  dateButtons,
  filterName,
}) => {
  const isMobile = useMediaQuery({ query: `(max-width: ${MEDIA_CONFIG.mobile.big}px)` })

  return (
    <div className={`${classes.graphWrapper} ${className ?? ''}`}>
      <div className={classes.graphWrapperHeader}>
        {title && <h2>{title}</h2>}
        <div className={classes.graphBtns}>
          {!isMobile && (
            <>
              <PlusMinusBtns filterName={filterName} />
              {dateButtons?.length && (
                <GraphDateButtons buttons={dateButtons} initialButtonValue={initialButtonValue} />
              )}
            </>
          )}
        </div>
      </div>
      {children}
      {isMobile && dateButtons?.length && (
        <div className={classes.mobileDtnWrapper}>
          <GraphDateButtons buttons={dateButtons} initialButtonValue={initialButtonValue} />
          <PlusMinusBtns filterName={filterName} />
        </div>
      )}
    </div>
  )
}
