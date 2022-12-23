import React from 'react'
import { ParentSize } from '@visx/responsive'
import { scaleLinear, scaleUtc } from '@visx/scale'
import { AxisBottom, AxisLeft } from '@visx/axis'
import { AreaClosed, Bar, Line, LinePath } from '@visx/shape'
import { Group } from '@visx/group'
import { GridRows } from '@visx/grid'
import { Tooltip, useTooltip } from '@visx/tooltip'
import { localPoint } from '@visx/event'
import { useReactiveVar } from '@apollo/client'
import { extent } from 'd3-array'
import { timeFormat } from 'd3-time-format'
import { IAccountData, TGraph } from '../../../@types/graph'
import { GraphWrapper } from '../graphWrapper'
import {
  getInitiatedSupplyDayData,
  initiatedSupplyBtns,
  getInitiatedSupplyGraphY,
  getInitiatedSupplyGraphX,
  getWeekOrMonthInitiatedSupply,
  dateFormat,
} from './helpers'
import { accountData, filter } from '../../../store/reactiveVars'
import {
  bisectDate,
  compose,
  getMinMax,
  getTooltipDate,
  formatNumbers,
  commonGraphMobileMargin,
  commonGraphMargin,
  commonTickHorizontalProps,
  commonTickVerticalProps,
} from '../common'
import classes from '../../../styles/components/graph.module.css'
import { curveMonotoneX } from '@visx/curve'
import { useMediaQuery } from 'react-responsive'
import { MEDIA_CONFIG } from '../../../helpers/media'
import { useGraphHeight, useGraphScale, useNumTicks } from '../../../hooks/graph'

const InitiatedSupplyGraph: React.FC<TGraph> = React.memo(({ width, height, currentFilter }) => {
  const accountDataInfo = useReactiveVar(accountData)
  const { hideTooltip, showTooltip, tooltipOpen, tooltipLeft, tooltipTop, tooltipData } = useTooltip()
  const isMobile = useMediaQuery({ query: `(max-width: ${MEDIA_CONFIG.mobile.big}px)` })
  const ref = React.useRef<HTMLDivElement>(null)
  const { isPinching } = useGraphScale('initiatedSupply', ref)

  const margin = React.useMemo(() => (!isMobile ? commonGraphMargin : commonGraphMobileMargin), [isMobile])

  const { correctedData, maxLength } = React.useMemo(() => {
    if (!accountDataInfo.length) return { correctedData: [], maxLength: 0 }

    if (currentFilter.activeFilter === 'day') return getInitiatedSupplyDayData(accountDataInfo)
    if (currentFilter.activeFilter === 'week') return getWeekOrMonthInitiatedSupply(accountDataInfo, 'isoWeek')
    if (currentFilter.activeFilter === 'month') return getWeekOrMonthInitiatedSupply(accountDataInfo, 'month')

    return { correctedData: [], maxLength: 0 }
  }, [accountDataInfo, currentFilter])

  const numTicks = useNumTicks(correctedData.length)

  const graphsProps = React.useMemo(() => {
    if (!correctedData || !correctedData.length) return null

    const xMax = width - margin.left - margin.right
    const yMax = height - margin.top - margin.bottom
    const [minYScale, maxYScale] = getMinMax(correctedData, getInitiatedSupplyGraphY)

    const xScale = scaleUtc({
      domain: extent(correctedData, getInitiatedSupplyGraphX) as [Date, Date],
      range: [0, xMax],
    })

    const yScale = scaleLinear({
      range: [yMax, 0],
      round: true,
      nice: true,
      domain: [minYScale, maxYScale],
    })

    const xPoint = compose(xScale, getInitiatedSupplyGraphX)
    const yPoint = compose(yScale, getInitiatedSupplyGraphY)

    return { yScale, xMax, yMax, xScale, xPoint, yPoint }
  }, [correctedData, height, margin.bottom, margin.left, margin.right, margin.top, width])

  const handleTooltip = React.useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const cords = localPoint(e) || { x: 0 }
      if (!cords) return
      const x0 = graphsProps?.xScale.invert(cords?.x - margin.left)
      if (!x0) return
      const index = bisectDate(correctedData, x0, 1)
      const d0 = correctedData[index - 1]
      const d1 = correctedData[index]
      let d = d0
      if (d1 && getInitiatedSupplyGraphX(d1)) {
        d =
          x0.valueOf() - getInitiatedSupplyGraphX(d0).valueOf() > getInitiatedSupplyGraphX(d1).valueOf() - x0.valueOf()
            ? d1
            : d0
      }

      showTooltip({
        tooltipData: d,
        tooltipLeft: cords?.x,
        tooltipTop: 0,
      })
    },
    [correctedData, graphsProps?.xScale, margin.left, showTooltip]
  )

  React.useEffect(() => {
    if (maxLength && filter().initiatedSupply.maxScale !== maxLength) {
      filter({ ...filter(), initiatedSupply: { ...filter().initiatedSupply, maxScale: maxLength } })
    }
  }, [maxLength])

  if (!correctedData.length || !graphsProps || !Object.keys(graphsProps).length)
    return <div style={{ width, height }} />

  return (
    <div ref={ref} className={classes.tooltipWrapper}>
      <svg width={width} height={height + margin.top}>
        <GridRows left={margin.left} scale={graphsProps.yScale} top={0} width={width - margin.left - margin.right} />
        <Group left={margin.left} width={width} height={height}>
          {correctedData.map((item, index) => {
            const isCurrentHover = (tooltipData as IAccountData)?.date === item.date
            return (
              <React.Fragment key={index}>
                {isCurrentHover && !isPinching && (
                  <>
                    <circle
                      className={classes.circle}
                      fill="var(--color-1)"
                      stroke="var(--color-1)"
                      key={index}
                      r={4}
                      cx={graphsProps?.xScale(getInitiatedSupplyGraphX(item))}
                      cy={graphsProps?.yScale(getInitiatedSupplyGraphY(item))}
                    />
                    <Line
                      from={{ x: graphsProps?.xScale(getInitiatedSupplyGraphX(item)), y: 0 }}
                      to={{
                        x: graphsProps?.xScale(getInitiatedSupplyGraphX(item)),
                        y: height - margin.bottom - margin.top,
                      }}
                      stroke="var(--color-1)"
                      className={classes.line}
                      pointerEvents="none"
                    />
                  </>
                )}
              </React.Fragment>
            )
          })}
          <LinePath
            data={correctedData}
            x={(d) => graphsProps?.xPoint(d)}
            y={(d) => graphsProps?.yPoint(d)}
            stroke="var(--color-1)"
            strokeWidth={2}
            curve={curveMonotoneX}
          />
          <AreaClosed
            data={correctedData}
            x={(d) => graphsProps?.xPoint(d)}
            y={(d) => graphsProps?.yPoint(d)}
            yScale={graphsProps?.yScale}
            fill="var(--color-1)"
            fillOpacity="0.1"
            curve={curveMonotoneX}
          />
        </Group>
        <Bar
          width={width}
          height={height}
          fill="transparent"
          rx={14}
          onTouchStart={handleTooltip}
          onTouchMove={handleTooltip}
          onMouseMove={handleTooltip}
          onMouseLeave={() => hideTooltip()}
        />
        <AxisBottom
          left={margin.left}
          top={height - margin.top}
          scale={graphsProps.xScale}
          numTicks={numTicks}
          /* eslint-disable */
          tickFormat={(v: any) => timeFormat(dateFormat[filter().initiatedSupply.activeFilter])(v)}
          tickStroke="transparent"
          stroke="transparent"
          tickLabelProps={() => commonTickHorizontalProps}
        />
        <AxisLeft
          left={margin.axis}
          scale={graphsProps.yScale}
          tickFormat={(tick) => formatNumbers(tick)}
          stroke="transparent"
          numTicks={4}
          tickStroke="transparent"
          tickLabelProps={() => commonTickVerticalProps('var(--color-1)')}
        />
      </svg>
      {tooltipOpen && tooltipData && !isPinching && (
        <Tooltip
          className={`${classes.tooltipBase} ${classes.alwaysTop} ${classes.barTooltip}`}
          unstyled={true}
          top={tooltipTop}
          left={tooltipLeft}
        >
          <div className={`${classes.tooltipDate} ${classes.centered}`}>
            {getTooltipDate((tooltipData as IAccountData).date)}
          </div>
          <div className={`${classes.tooltipInfo1} ${classes.centered} ${classes.breakWord}`}>
            {getInitiatedSupplyGraphY(tooltipData as IAccountData)}
          </div>
        </Tooltip>
      )}
    </div>
  )
})

InitiatedSupplyGraph.displayName = 'InitiatedSupplyGraph'

export const InitiatedSupplyResizeGraph = () => {
  const supplyFilter = useReactiveVar(filter)
  const height = useGraphHeight()

  return (
    <GraphWrapper
      title="Initiated Supply"
      filterName="initiatedSupply"
      dateButtons={initiatedSupplyBtns}
      initialButtonValue={supplyFilter.initiatedSupply.activeFilter}
    >
      <ParentSize>
        {({ width }) => (
          <InitiatedSupplyGraph currentFilter={supplyFilter.initiatedSupply} width={width} height={height} />
        )}
      </ParentSize>
    </GraphWrapper>
  )
}
