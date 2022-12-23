import React from 'react'
import { IGraphDateButton } from '../../@types/graph'

import classes from '../../styles/components/graph.module.css'

export const GraphDateButtons: React.FC<{ buttons: IGraphDateButton[]; initialButtonValue?: string }> = React.memo(
  ({ buttons, initialButtonValue }) => {
    const sliderRef = React.useRef<HTMLSpanElement>(null)
    const [disabled, setDisabled] = React.useState(false)
    const [active, setActive] = React.useState(initialButtonValue ?? buttons[0].id)

    const removeDisable = () => setDisabled(false)

    const onClickBtn = (e: React.MouseEvent, btnClick?: () => void) => {
      if (!sliderRef.current) return
      const slider = sliderRef.current
      const target = e.target
      const targetPos = (target as HTMLButtonElement).getBoundingClientRect().left
      const sliderPos = (slider as HTMLSpanElement).getBoundingClientRect().left
      const difference = Math.abs(targetPos - sliderPos)
      if (difference !== 0) {
        setDisabled(true)
        setActive((target as HTMLButtonElement).id || 'day')
        const left = sliderRef.current.style.left ? +sliderRef.current.style.left.split('px')[0] : 0
        if (sliderPos > targetPos) {
          sliderRef.current.style.left = left - difference + 'px'
          btnClick && btnClick()
          return
        }
        if (targetPos > sliderPos) {
          sliderRef.current.style.left = left + difference + 'px'
          btnClick && btnClick()
          return
        }
      } else {
        btnClick && btnClick()
      }
    }

    return (
      <div className={classes.graphDateButtonsWrapper}>
        <span onTransitionEnd={removeDisable} ref={sliderRef} className={classes.graphDateSlider} />
        {buttons.map((btn, index) => {
          return (
            <button
              disabled={disabled}
              className={`${classes.graphDateBtn} ${active === btn.id ? classes.graphDateBtnActive : ''}`}
              key={btn.name + index}
              id={btn.id}
              name={btn.name}
              title={btn.name}
              onClick={(e) => onClickBtn(e, btn.onClick)}
            >
              {btn.name}
            </button>
          )
        })}
      </div>
    )
  }
)

GraphDateButtons.displayName = 'GraphDateButtons'
