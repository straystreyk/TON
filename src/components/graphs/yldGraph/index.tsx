import React from 'react'
import { useReactiveVar } from '@apollo/client'
import { timeFormat } from 'd3-time-format'
import { GraphWrapper } from '../graphWrapper'
import yldDataJSON from '../../../mock/yld.json'
import { filter, yldData } from '../../../store/reactiveVars'
import { getWeekOrMonthYld, getYldGraphX, getYldGraphY, yldBtns } from './helpers'
import {
  bisectDate,
  commonGraphMobileMargin,
  compose,
  getMinMax,
  getTooltipDate,
  commonGraphMargin,
  commonTickHorizontalProps,
  commonTickVerticalProps,
} from '../common'
import { IYldData, TGraph } from '../../../@types/graph'
import { ParentSize } from '@visx/responsive'
import { scaleLinear, scaleUtc } from '@visx/scale'
import { extent } from 'd3-array'
import { GridRows } from '@visx/grid'
import { Group } from '@visx/group'
import classes from '../../../styles/components/graph.module.css'
import { AreaClosed, Bar, Line, LinePath } from '@visx/shape'
import { curveMonotoneX } from '@visx/curve'
import { AxisBottom, AxisLeft } from '@visx/axis'
import { Tooltip, useTooltip } from '@visx/tooltip'
import { localPoint } from '@visx/event'
import { useMediaQuery } from 'react-responsive'
import { MEDIA_CONFIG } from '../../../helpers/media'
import { GraphTitle } from '../graphTitle'
import { useGraphHeight, useGraphScale, useNumTicks } from '../../../hooks/graph'
import { dateFormat } from '../initiatedSupplyGraph/helpers'

const StakingApyGraph: React.FC<TGraph> = React.memo(({ width, height, currentFilter }) => {
  const yldDataInfo = useReactiveVar(yldData)
  const { hideTooltip, showTooltip, tooltipOpen, tooltipLeft, tooltipTop, tooltipData } = useTooltip()
  const isMobile = useMediaQuery({ query: `(max-width: ${MEDIA_CONFIG.mobile.big}px)` })
  const ref = React.useRef<HTMLDivElement>(null)
  const { isPinching } = useGraphScale('yld', ref)
  const margin = React.useMemo(() => (!isMobile ? commonGraphMargin : commonGraphMobileMargin), [isMobile])

  const { correctedData, maxLength } = React.useMemo(() => {
    if (!yldDataInfo.length) return { correctedData: [], maxLength: 0 }

    if (currentFilter.activeFilter === 'day') return getWeekOrMonthYld(yldDataInfo, 'day')
    if (currentFilter.activeFilter === 'week') return getWeekOrMonthYld(yldDataInfo, 'isoWeek')
    if (currentFilter.activeFilter === 'month') return getWeekOrMonthYld(yldDataInfo, 'month')

    return { correctedData: [], maxLength: 0 }
  }, [currentFilter, yldDataInfo])

  const graphsProps = React.useMemo(() => {
    if (!correctedData || !correctedData.length) return null

    const xMax = width - margin.left - margin.right
    const yMax = height - margin.top - margin.bottom
    const [min, max] = getMinMax(correctedData, getYldGraphY)

    const xScale = scaleUtc({
      domain: extent(correctedData, getYldGraphX) as [Date, Date],
      range: [0, xMax],
      round: true,
    })

    const yScale = scaleLinear({
      range: [yMax, 0],
      round: true,
      nice: true,
      domain: [min, max],
    })

    const xPoint = compose(xScale, getYldGraphX)
    const yPoint = compose(yScale, getYldGraphY)

    return { xMax, yMax, xScale, yScale, xPoint, yPoint }
  }, [correctedData, height, margin.bottom, margin.left, margin.right, margin.top, width])

  const numTicks = useNumTicks(correctedData.length)

  const handleTooltip = React.useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const cords = localPoint(e)
      if (!cords) return
      const x0 = graphsProps?.xScale.invert(cords?.x - margin.left)
      if (!x0) return
      const index = bisectDate(correctedData, x0, 1)
      const d0 = correctedData[index - 1]
      const d1 = correctedData[index]
      let d = d0
      if (d1 && getYldGraphX(d1)) {
        d = x0.valueOf() - getYldGraphX(d0).valueOf() > getYldGraphX(d1).valueOf() - x0.valueOf() ? d1 : d0
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
    //fetch logic
    yldData(yldDataJSON)
  }, [])

  React.useEffect(() => {
    if (maxLength && filter().yld.maxScale !== maxLength) {
      filter({ ...filter(), yld: { ...filter().yld, maxScale: maxLength } })
    }
  }, [maxLength, currentFilter])

  if (!correctedData.length || !graphsProps || !Object.keys(graphsProps).length)
    return <div style={{ width, height }} />

  return (
    <div tabIndex={-1} ref={ref} className={classes.tooltipWrapper}>
      <svg width={width} height={height + margin.top}>
        <GridRows left={margin.left} scale={graphsProps.yScale} top={0} width={width - margin.left - margin.right} />
        <Group left={margin.left} width={width} height={height}>
          {correctedData.map((item, index) => {
            const isCurrentHover = (tooltipData as IYldData)?.date === item.date
            return (
              <React.Fragment key={index}>
                {isCurrentHover && !isPinching && (
                  <>
                    <circle
                      className={classes.circle}
                      key={index}
                      r={4}
                      cx={graphsProps?.xScale(getYldGraphX(item))}
                      cy={graphsProps?.yScale(getYldGraphY(item))}
                      fill="var(--color-1)"
                      stroke="var(--color-1)"
                    />
                    <Line
                      from={{ x: graphsProps?.xScale(getYldGraphX(item)), y: 0 }}
                      to={{ x: graphsProps?.xScale(getYldGraphX(item)), y: height - margin.bottom - margin.top }}
                      stroke="var(--color-1)"
                      className={classes.line}
                      strokeWidth={2}
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
          x={margin.left}
          y={margin.top}
          onTouchStart={handleTooltip}
          onTouchMove={handleTooltip}
          onMouseMove={handleTooltip}
          onMouseLeave={() => hideTooltip()}
          width={width}
          height={height}
          fill="transparent"
          rx={14}
        />
        <AxisBottom
          left={margin.left}
          top={height - margin.top}
          scale={graphsProps.xScale}
          numTicks={numTicks}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          tickFormat={(v: any) => timeFormat(dateFormat[filter().initiatedSupply.activeFilter])(v)}
          tickStroke="transparent"
          stroke="transparent"
          tickLabelProps={() => commonTickHorizontalProps}
        />
        <AxisLeft
          left={margin.axis}
          scale={graphsProps.yScale}
          tickFormat={(tick) => tick + '%'}
          stroke="transparent"
          numTicks={4}
          tickStroke="transparent"
          tickLabelProps={() => commonTickVerticalProps('var(--color-1)')}
        />
      </svg>
      {tooltipOpen && tooltipData && !isPinching && (
        <Tooltip
          className={`${classes.tooltipBase} ${classes.barTooltip} ${classes.alwaysTop}`}
          unstyled={true}
          top={tooltipTop}
          left={tooltipLeft}
        >
          <div className={`${classes.tooltipDate} ${classes.centered}`}>
            {getTooltipDate((tooltipData as IYldData).date)}
          </div>
          <div className={`${classes.tooltipInfo1} ${classes.centered} ${classes.breakWord}`}>
            {getYldGraphY(tooltipData as IYldData).toFixed(2)} %
          </div>
        </Tooltip>
      )}
    </div>
  )
})

StakingApyGraph.displayName = 'StakingApyGraph'

export const SizeStackingApyGraph = () => {
  const yldDataFilter = useReactiveVar(filter)
  const height = useGraphHeight()

  return (
    <GraphWrapper
      filterName="yld"
      title="Staking APY"
      dateButtons={yldBtns}
      initialButtonValue={yldDataFilter.yld.activeFilter}
    >
      <GraphTitle leftTitle="Annual percent YLD" />
      <ParentSize>
        {({ width }) => <StakingApyGraph currentFilter={yldDataFilter.yld} width={width} height={height} />}
      </ParentSize>
    </GraphWrapper>
  )
}
