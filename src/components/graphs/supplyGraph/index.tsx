import React from 'react'
import { ParentSize } from '@visx/responsive'
import { timeFormat } from 'd3-time-format'
import { GraphWrapper } from '../graphWrapper'
import { IAccountData, TGraph } from '../../../@types/graph'
import { useReactiveVar } from '@apollo/client'
import { accountData, filter } from '../../../store/reactiveVars'
import {
  getSupplyCirculatingGraphY,
  getSupplyDayData,
  getSupplyTotalGraphY,
  getWeekOrMonthSupply,
  supplyBtns,
} from './helpers'
import {
  bisectDate,
  commonGraphMobileMargin,
  compose,
  formatNumbers,
  getMinMax,
  getTooltipDate,
  commonGraphMargin,
  commonTickVerticalProps,
  commonTickHorizontalProps,
} from '../common'
import { scaleLinear, scaleUtc } from '@visx/scale'
import { extent } from 'd3-array'
import { dateFormat, getInitiatedSupplyGraphX } from '../initiatedSupplyGraph/helpers'
import { GridRows } from '@visx/grid'
import { Group } from '@visx/group'
import { AreaClosed, Bar, Line, LinePath } from '@visx/shape'
import { curveMonotoneX } from '@visx/curve'
import { AxisBottom, AxisLeft, AxisRight } from '@visx/axis'
import { Tooltip, useTooltip } from '@visx/tooltip'
import { localPoint } from '@visx/event'
import { useMediaQuery } from 'react-responsive'
import { MEDIA_CONFIG } from '../../../helpers/media'

import classes from '../../../styles/components/graph.module.css'
import { GraphTitle } from '../graphTitle'
import { useGraphHeight, useGraphScale, useNumTicks } from '../../../hooks/graph'

export const SupplyGraph: React.FC<TGraph> = React.memo(({ width, height, currentFilter }) => {
  const supplyInfo = useReactiveVar(accountData)
  const { hideTooltip, showTooltip, tooltipLeft, tooltipTop, tooltipData } = useTooltip()
  const isMobile = useMediaQuery({ query: `(max-width: ${MEDIA_CONFIG.mobile.big}px)` })
  const ref = React.useRef(null)
  const { isPinching } = useGraphScale('supply', ref)

  const margin = React.useMemo(() => (!isMobile ? commonGraphMargin : commonGraphMobileMargin), [isMobile])

  const { correctedData, maxLength } = React.useMemo(() => {
    if (!supplyInfo.length) return { correctedData: [], maxLength: 0 }

    if (currentFilter.activeFilter === 'day') return getSupplyDayData(supplyInfo /*pos*/)
    if (currentFilter.activeFilter === 'week') return getWeekOrMonthSupply(supplyInfo, 'isoWeek')
    if (currentFilter.activeFilter === 'month') return getWeekOrMonthSupply(supplyInfo, 'month')

    return { correctedData: [], maxLength: 0 }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFilter, supplyInfo])

  const numTicks = useNumTicks(correctedData.length)

  const graphsProps = React.useMemo(() => {
    if (!correctedData || !correctedData.length) return null

    const xMax = width - margin.left - (!isMobile ? margin.axis * 2 : 0)
    const yMax = height - margin.top - margin.bottom
    const [minTotal, maxTotal] = getMinMax(correctedData, getSupplyTotalGraphY)
    const [minCalculate, maxCalculate] = getMinMax(correctedData, getSupplyCirculatingGraphY)

    const xScale = scaleUtc({
      domain: extent(correctedData, getInitiatedSupplyGraphX) as [Date, Date],
      range: [0, xMax],
      round: true,
    })

    const yScaleTotal = scaleLinear({
      range: [yMax, 0],
      round: true,
      nice: true,
      domain: [minTotal, maxTotal],
    })

    const yScaleCalculate = scaleLinear({
      range: [yMax, 0],
      round: true,
      nice: true,
      domain: [minCalculate, maxCalculate],
    })

    const xPoint = compose(xScale, getInitiatedSupplyGraphX)
    const yPointTotal = compose(yScaleTotal, getSupplyTotalGraphY)
    const yPointCalculate = compose(yScaleCalculate, getSupplyCirculatingGraphY)

    return { xMax, yMax, xScale, yScaleTotal, yScaleCalculate, xPoint, yPointTotal, yPointCalculate }
  }, [correctedData, height, isMobile, margin.axis, margin.bottom, margin.left, margin.top, width])

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

      // setPos(d)

      showTooltip({
        tooltipData: d,
        tooltipLeft: cords?.x,
        tooltipTop: 0,
      })
    },
    [correctedData, graphsProps?.xScale, margin.left, showTooltip]
  )

  React.useEffect(() => {
    if (maxLength && filter().supply.maxScale !== maxLength) {
      filter({
        ...filter(),
        supply: { ...filter().supply, maxScale: maxLength },
      })
    }
  }, [maxLength, currentFilter])

  // React.useEffect(() => {
  //   if (correctedData.length && filter().supply.currentlyDisplayed.length !== correctedData.length) {
  //     filter({
  //       ...filter(),
  //       supply: { ...filter().supply, currentlyDisplayed: correctedData as [] },
  //     })
  //   }
  // }, [correctedData])

  if (!correctedData.length || !graphsProps || !Object.keys(graphsProps).length)
    return <div style={{ width, height }} />

  return (
    <div tabIndex={-1} ref={ref} className={classes.tooltipWrapper}>
      <svg width={width} height={height + margin.top}>
        <GridRows left={margin.left} width={graphsProps.xMax} scale={graphsProps.yScaleTotal} top={0} />
        <Group left={margin.left} width={width - margin.left - margin.right}>
          <LinePath
            data={correctedData}
            x={(d) => graphsProps?.xPoint(d)}
            y={(d) => graphsProps?.yPointCalculate(d)}
            stroke="var(--color-10)"
            strokeWidth={2}
            curve={curveMonotoneX}
          />
          <AreaClosed
            data={correctedData}
            x={(d) => graphsProps?.xPoint(d)}
            y={(d) => graphsProps?.yPointCalculate(d)}
            yScale={graphsProps?.yScaleCalculate}
            fill="var(--graph-color-3)"
            curve={curveMonotoneX}
          />
          <LinePath
            data={correctedData}
            x={(d) => graphsProps?.xPoint(d)}
            y={(d) => graphsProps?.yPointTotal(d)}
            stroke="var(--color-1)"
            strokeWidth={2}
            curve={curveMonotoneX}
          />
          {correctedData.map((item, index) => {
            const isCurrentHover = (tooltipData as IAccountData)?.date === item.date

            return (
              <React.Fragment key={index}>
                {isCurrentHover && !isPinching && (
                  <>
                    <Line
                      from={{ x: graphsProps?.xScale(getInitiatedSupplyGraphX(item)), y: 0 }}
                      to={{
                        x: graphsProps?.xScale(getInitiatedSupplyGraphX(item)),
                        y: height - margin.bottom - margin.top,
                      }}
                      stroke="var(--color-1)"
                      strokeWidth={2}
                      className={classes.line}
                      pointerEvents="none"
                    />
                    <circle
                      className={classes.circle}
                      key={'calculate-circle-' + index}
                      fill="var(--color-10)"
                      stroke="var(--color-10)"
                      r={4}
                      cx={graphsProps?.xScale(getInitiatedSupplyGraphX(item))}
                      cy={graphsProps?.yScaleCalculate(getSupplyCirculatingGraphY(item))}
                    />
                    <circle
                      className={classes.circle}
                      key={'total-circle-' + index}
                      fill="var(--color-1)"
                      stroke="var(--color-1)"
                      r={4}
                      cx={graphsProps?.xScale(getInitiatedSupplyGraphX(item))}
                      cy={graphsProps?.yScaleTotal(getSupplyTotalGraphY(item))}
                    />
                  </>
                )}
              </React.Fragment>
            )
          })}
        </Group>
        <Bar
          x={margin.left}
          fill="transparent"
          onTouchStart={handleTooltip}
          onTouchMove={handleTooltip}
          onMouseMove={handleTooltip}
          onMouseLeave={() => hideTooltip()}
          width={graphsProps?.xMax > 0 ? graphsProps?.xMax : 0}
          height={height}
          rx={14}
        />
        <AxisRight
          left={width - margin.axis}
          scale={graphsProps.yScaleCalculate}
          tickFormat={(tick) => formatNumbers(tick)}
          stroke="transparent"
          numTicks={4}
          tickStroke="transparent"
          tickLabelProps={() => commonTickVerticalProps(isMobile ? 'var(--color-5)' : 'var(--color-2)')}
        />
        <AxisLeft
          left={margin.axis}
          scale={graphsProps.yScaleTotal}
          tickFormat={(tick) => formatNumbers(tick)}
          stroke="transparent"
          numTicks={4}
          tickStroke="transparent"
          tickLabelProps={() => commonTickVerticalProps('var(--color-1)')}
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
      </svg>
      {tooltipData && !isPinching && (
        <Tooltip
          className={`${classes.tooltipBase} ${classes.barTooltip} ${classes.alwaysTop} `}
          unstyled={true}
          top={tooltipTop}
          left={tooltipLeft}
        >
          <div className={`${classes.tooltipDate}`}>{getTooltipDate((tooltipData as IAccountData).date)}</div>
          <div className={`${classes.tooltipInfo1} ${classes.breakWord}`}>
            {!isMobile && 'Total:'} {Math.round(getSupplyTotalGraphY(tooltipData as IAccountData))}
          </div>
          <div className={`${classes.tooltipInfo2}  ${classes.breakWord}`}>
            {!isMobile && 'Circulating:'} {Math.round(getSupplyCirculatingGraphY(tooltipData as IAccountData))}
          </div>
        </Tooltip>
      )}
    </div>
  )
})

SupplyGraph.displayName = 'SupplyGraph'

export const ResizeSupplyGraph = () => {
  const supplyDataFilter = useReactiveVar(filter)
  const height = useGraphHeight()

  return (
    <GraphWrapper
      filterName="supply"
      title="Supply"
      dateButtons={supplyBtns}
      initialButtonValue={supplyDataFilter.supply.activeFilter}
    >
      <GraphTitle leftTitle="Total" rightTitle="Circulating" />
      <ParentSize>
        {({ width }) => <SupplyGraph currentFilter={supplyDataFilter.supply} width={width} height={height} />}
      </ParentSize>
    </GraphWrapper>
  )
}
