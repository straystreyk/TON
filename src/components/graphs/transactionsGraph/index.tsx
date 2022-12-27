import React from 'react'
import { ParentSize } from '@visx/responsive'
import { useReactiveVar } from '@apollo/client'
import { scaleBand, scaleLinear, scaleUtc } from '@visx/scale'

import { GraphWrapper } from '../graphWrapper'
import { IGroupedTransactions, TGraph } from '../../../@types/graph'
import {
  getDayTransactions,
  getWeekOrMonthTransactions,
  initialTransactionsBtns,
  transactGraphAmountsY,
  transactGraphCountY,
  transactGraphLineX,
  transactGraphX,
} from './helpers'

import { transactionAmounts, transactionCounts, filter } from '../../../store/reactiveVars'
import classes from '../../../styles/components/graph.module.css'

import transactionAmountsData from '../../../mock/transactions-amounts.json'
import transactionCountsData from '../../../mock/transactions-count.json'
import {
  commonGraphMobileMargin,
  compose,
  formatNumbers,
  getMinMax,
  commonGraphMargin,
  commonTickHorizontalProps,
  commonTickVerticalProps,
  bisectDate,
  getTooltipDate,
} from '../common'
import { Bar, Line, LinePath } from '@visx/shape'
import { Group } from '@visx/group'
import { AxisBottom, AxisLeft, AxisRight } from '@visx/axis'
import { curveMonotoneX } from '@visx/curve'
import { GridRows } from '@visx/grid'
import { useMediaQuery } from 'react-responsive'
import { MEDIA_CONFIG } from '../../../helpers/media'
import { extent } from 'd3-array'
import { GraphTitle } from '../graphTitle'
import { localPoint } from '@visx/event'
import { Tooltip, useTooltip } from '@visx/tooltip'
import { useGraphHeight, useGraphScale } from '../../../hooks/graph'
import moment from 'moment'

export const TransactionsGraph: React.FC<TGraph> = React.memo(({ width, height, currentFilter }) => {
  const transactionAmountsDataInfo = useReactiveVar(transactionAmounts)
  const transactionCountsDataInfo = useReactiveVar(transactionCounts)
  const isMobile = useMediaQuery({ query: `(max-width: ${MEDIA_CONFIG.mobile.big}px)` })
  const { hideTooltip, showTooltip, tooltipOpen, tooltipLeft, tooltipTop, tooltipData } = useTooltip()
  const ref = React.useRef<HTMLDivElement>(null)
  const { isPinching } = useGraphScale('transaction', ref)
  const isMonth = React.useMemo(() => currentFilter.activeFilter === 'month', [currentFilter])

  const margin = React.useMemo(() => (!isMobile ? commonGraphMargin : commonGraphMobileMargin), [isMobile])

  const { correctedData, maxLength } = React.useMemo(() => {
    if (!transactionAmountsDataInfo.length || !transactionCountsDataInfo.length)
      return { correctedData: [], maxLength: 0 }

    if (currentFilter.activeFilter === 'day')
      return getDayTransactions(transactionAmountsDataInfo, transactionCountsDataInfo)

    if (currentFilter.activeFilter === 'week')
      return getWeekOrMonthTransactions(transactionAmountsDataInfo, transactionCountsDataInfo, 'week')

    if (currentFilter.activeFilter === 'month')
      return getWeekOrMonthTransactions(transactionAmountsDataInfo, transactionCountsDataInfo, 'month')

    return { correctedData: [], maxLength: 0 }
  }, [transactionAmountsDataInfo, transactionCountsDataInfo, currentFilter])

  const graphsProps = React.useMemo(() => {
    if (!correctedData || !correctedData.length) return null

    const xMax = width - margin.left - (!isMobile ? margin.axis * 2 : 0)
    const yMax = height - margin.top - margin.bottom
    const [min, max] = getMinMax(correctedData, transactGraphAmountsY as any)
    const [minCount, maxCount] = getMinMax(correctedData, transactGraphCountY as any)

    const xScale = scaleBand({
      range: [0, xMax],
      domain: correctedData.map(transactGraphX),
      padding: 0.07,
      paddingOuter: 0,
    })

    const xScaleLine = scaleUtc({
      domain: extent(correctedData as any, transactGraphLineX) as [Date, Date],
      range: [0, xMax],
    })

    const yAmountsScale = scaleLinear({
      range: [yMax, 0],
      round: true,
      nice: true,
      domain: [min - min * 0.3, max],
    })

    const yCountScale = scaleLinear({
      range: [yMax, 0],
      round: true,
      domain: [minCount - minCount * 0.1, maxCount + maxCount * 0.1],
    })

    const xPoint = compose(xScale, transactGraphX)
    const xLinePoint = compose(xScaleLine, transactGraphLineX)
    const yAmountPoint = compose(yAmountsScale, transactGraphAmountsY)
    const yCountPoint = compose(yCountScale, transactGraphCountY)

    return { xMax, yMax, xScale, xScaleLine, yAmountsScale, yCountScale, xLinePoint, xPoint, yAmountPoint, yCountPoint }
  }, [correctedData, width, margin.left, margin.axis, margin.top, margin.bottom, isMobile, height])

  const handleTooltip = React.useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const cords = localPoint(e) || { x: 0 }
      if (!cords) return
      const x0 = graphsProps?.xScaleLine.invert(cords?.x - margin.left)
      if (!x0) return
      const index = bisectDate(correctedData, x0, 1)
      const d0 = correctedData[index - 1]
      const d1 = correctedData[index]
      let d = d0
      if (d1 && transactGraphLineX(d1 as any)) {
        d =
          x0.valueOf() - transactGraphLineX(d0 as any).valueOf() >
          transactGraphLineX(d1 as any).valueOf() - x0.valueOf()
            ? d1
            : d0
      }

      showTooltip({
        tooltipData: d,
        tooltipLeft: cords?.x,
        tooltipTop: 0,
      })
    },
    [correctedData, graphsProps?.xScaleLine, margin.left, showTooltip]
  )

  React.useEffect(() => {
    //fetch logic

    transactionAmounts(transactionAmountsData)
    transactionCounts(transactionCountsData)
  }, [])

  React.useEffect(() => {
    if (maxLength && filter().transaction.maxScale !== maxLength) {
      filter({ ...filter(), transaction: { ...filter().transaction, maxScale: maxLength } })
    }
  }, [maxLength, currentFilter])

  if (!correctedData.length || !graphsProps || !Object.keys(graphsProps).length)
    return <div style={{ width, height }} />

  return (
    <div tabIndex={-1} ref={ref} className={classes.tooltipWrapper}>
      <svg width={width} height={height + margin.top}>
        <GridRows left={margin.left} scale={graphsProps.yAmountsScale} top={0} width={graphsProps.xMax} />
        <Group left={margin.left}>
          {correctedData.map((d, index) => {
            const bar = { x: 0, y: 0, width: 0, height: 0, maxHeight: 0 }
            const isCurrentHover = (tooltipData as IGroupedTransactions)?.date === d.date
            bar.height = graphsProps?.yMax - graphsProps?.yAmountPoint(d as any)
            bar.width = graphsProps?.xScale.bandwidth()
            bar.x = graphsProps?.xPoint(d)
            bar.y = graphsProps?.yMax - bar.height

            return (
              <React.Fragment key={index}>
                <Bar
                  className={`${classes.accountBarGraph} ${isCurrentHover ? classes.active : ''}`}
                  x={bar.x}
                  y={bar.y}
                  width={bar.width}
                  height={bar.height}
                  rx={bar.width * 0.08}
                />
                {isCurrentHover && !isPinching && (
                  <>
                    <circle
                      className={classes.circle}
                      fill="var(--color-1)"
                      stroke="var(--color-1)"
                      r={4}
                      cx={graphsProps?.xScaleLine(transactGraphLineX(d as any))}
                      cy={graphsProps?.yCountScale(transactGraphCountY(d as any))}
                    />
                    <Line
                      from={{ x: graphsProps?.xScaleLine(transactGraphLineX(d as any)), y: 0 }}
                      to={{
                        x: graphsProps?.xScaleLine(transactGraphLineX(d as any)),
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
            x={(d) => graphsProps?.xLinePoint(d as any)}
            y={(d) => graphsProps?.yCountPoint(d as any)}
            stroke="var(--color-1)"
            strokeWidth={2}
            curve={curveMonotoneX}
          />
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
        </Group>
        <AxisBottom
          left={margin.left}
          top={height - margin.top}
          scale={graphsProps.xScale}
          tickFormat={(tick) =>
            isMonth ? moment(new Date(tick)).format('MMM') : moment(new Date(tick)).format('D MMM')
          }
          tickStroke="transparent"
          stroke="transparent"
          tickLabelProps={() => commonTickHorizontalProps}
        />
        <AxisLeft
          left={margin.axis}
          scale={graphsProps.yCountScale}
          tickFormat={(tick) => formatNumbers(tick)}
          stroke="transparent"
          numTicks={4}
          tickStroke="transparent"
          tickLabelProps={() => commonTickVerticalProps('var(--color-1)')}
        />
        <AxisRight
          left={width - margin.axis}
          scale={graphsProps.yAmountsScale}
          tickFormat={(tick) => formatNumbers(tick)}
          stroke="transparent"
          numTicks={4}
          tickStroke="transparent"
          tickLabelProps={() => commonTickVerticalProps(isMobile ? 'var(--color-5)' : 'var(--color-2)')}
        />
      </svg>
      {tooltipOpen && tooltipData && !isPinching && (
        <Tooltip
          className={`${classes.tooltipBase} ${classes.barTooltip} ${classes.alwaysTop}`}
          unstyled={true}
          top={tooltipTop}
          left={tooltipLeft}
        >
          <div className={`${classes.tooltipDate}`}>{getTooltipDate((tooltipData as IGroupedTransactions).date)}</div>
          <div className={`${classes.tooltipInfo1} ${classes.breakWord}`}>
            {!isMobile && 'Count:'} {(tooltipData as IGroupedTransactions).transactions_count.toFixed(0)}
          </div>
          <div className={`${classes.tooltipInfo2} ${classes.breakWord}`}>
            {!isMobile && 'Sum:'} {(+(tooltipData as IGroupedTransactions).sum_transactions_amounts / 1e9).toFixed(0)}
          </div>
        </Tooltip>
      )}
    </div>
  )
})

TransactionsGraph.displayName = 'TransactionsGraph'

export const TransactionsResizeGraph = () => {
  const transactionsDataFilter = useReactiveVar(filter)
  const height = useGraphHeight()

  return (
    <GraphWrapper
      filterName="transaction"
      dateButtons={initialTransactionsBtns}
      title="Transactions"
      initialButtonValue={transactionsDataFilter.transaction.activeFilter}
    >
      <GraphTitle leftTitle="Number of transactions" rightTitle="Sum of amount" />
      <ParentSize>
        {({ width }) => (
          <TransactionsGraph currentFilter={transactionsDataFilter.transaction} width={width} height={height} />
        )}
      </ParentSize>
    </GraphWrapper>
  )
}
