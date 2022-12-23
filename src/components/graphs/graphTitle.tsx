import React from 'react'

import classes from '../../styles/components/graph.module.css'

export const GraphTitle: React.FC<{ leftTitle: string; rightTitle?: string; className?: string }> = React.memo(
  ({ leftTitle, rightTitle, className }) => {
    return (
      <div className={`${classes.graphTitle} ${className ?? ''}`}>
        <h3 className={classes.left}>{leftTitle}</h3>
        {rightTitle && <h3 className={classes.right}>{rightTitle}</h3>}
      </div>
    )
  }
)

GraphTitle.displayName = 'GraphTitle'
