import React from 'react'
import { GraphWrapper } from '../graphWrapper'
import { accountData, filter } from '../../../store/reactiveVars'
import { IAccountData, TGraph } from '../../../@types/graph'
import { useReactiveVar } from '@apollo/client'
import { scaleBand, scaleLinear } from '@visx/scale'
import { AxisBottom, AxisLeft } from '@visx/axis'
import { ParentSize } from '@visx/responsive'
import { Group } from '@visx/group'
import { Tooltip, useTooltip } from '@visx/tooltip'
import { GridRows } from '@visx/grid'

import data from '../../../mock/accounts.json'
import classes from '../../../styles/components/graph.module.css'
import {
  compose,
  getTooltipDate,
  formatNumbers,
  getMinMax,
  commonGraphMobileMargin,
  commonGraphMargin,
  commonTickHorizontalProps,
  commonTickVerticalProps,
} from '../common'
import { accountBtns, accountGraphX, accountGraphY, getDayAccountsData, getWeekOrMonthAccountsData } from './helpers'
import { Bar } from '@visx/shape'
import { useMediaQuery } from 'react-responsive'
import { MEDIA_CONFIG } from '../../../helpers/media'
import { useGraphHeight, useGraphScale } from '../../../hooks/graph'
import moment from 'moment'

export const AccountGraph: React.FC<TGraph> = React.memo(({ width, height, currentFilter }) => {
  const accountDataInfo = useReactiveVar(accountData)
  const { tooltipData, tooltipLeft, tooltipTop, tooltipOpen, showTooltip, hideTooltip } = useTooltip()
  const isMobile = useMediaQuery({ query: `(max-width: ${MEDIA_CONFIG.mobile.big}px)` })
  const ref = React.useRef<HTMLDivElement>(null)
  const margin = React.useMemo(() => (!isMobile ? commonGraphMargin : commonGraphMobileMargin), [isMobile])
  const isMonth = React.useMemo(() => currentFilter.activeFilter === 'month', [currentFilter])
  const tooltipRef = React.useRef<HTMLDivElement>(null)
  useGraphScale('account', ref)

  const { correctedData, maxLength } = React.useMemo(() => {
    if (!accountDataInfo.length) return { correctedData: [], maxLength: 0 }
    if (currentFilter.activeFilter === 'day') return getDayAccountsData(accountDataInfo)
    if (currentFilter.activeFilter === 'week') return getWeekOrMonthAccountsData(accountDataInfo, 'week')
    if (currentFilter.activeFilter === 'month') return getWeekOrMonthAccountsData(accountDataInfo, 'month')

    return { correctedData: [], maxLength: 0 }
  }, [accountDataInfo, currentFilter])

  const handleMouseOver = React.useCallback(
    (
      event: React.MouseEvent,
      data: IAccountData,
      bar: { x: number; y: number; width: number; height: number; maxHeight: number }
    ) => {
      const target = event.target as HTMLElement & SVGElement

      showTooltip({
        tooltipTop: window.scrollY + target.getBoundingClientRect().top - (bar.maxHeight - bar.height),
        tooltipLeft: window.scrollX + target.getBoundingClientRect().left + bar.width / 2 - 10,
        tooltipData: data,
      })
    },
    [showTooltip]
  )

  const graphsProps = React.useMemo(() => {
    if (!correctedData || !correctedData.length) return null

    const xMax = width - margin.left
    const yMax = height - margin.top - margin.bottom
    const [min, max] = getMinMax(correctedData, accountGraphY)

    const xScale = scaleBand({
      range: [0, xMax],
      domain: correctedData.map(accountGraphX),
      paddingInner: 0.07,
      paddingOuter: 0,
    })

    const yScale = scaleLinear({
      range: [yMax, 0],
      round: true,
      nice: true,
      domain: [min - min * 0.3, max],
    })

    const xPoint = compose(xScale, accountGraphX)
    const yPoint = compose(yScale, accountGraphY)

    return { xScale, yScale, xMax, yMax, xPoint, yPoint }
  }, [correctedData, width, margin.left, margin.top, margin.bottom, height])

  React.useEffect(() => {
    // fetch logic and after pass data
    accountData(data as IAccountData[])
  }, [])

  React.useEffect(() => {
    if (maxLength && filter().account.maxScale !== maxLength) {
      filter({ ...filter(), account: { ...filter().account, maxScale: maxLength } })
    }
  }, [maxLength, currentFilter])

  if (!correctedData.length || !graphsProps || !Object.keys(graphsProps).length)
    return <div style={{ width, height }} />

  return (
    <>
      <div tabIndex={-1} ref={ref} style={{ touchAction: 'pan-y' }}>
        <svg width={width} height={height + margin.top}>
          <GridRows left={margin.left} scale={graphsProps?.yScale} width={graphsProps?.xMax} />
          <Group left={margin.left}>
            {correctedData.map((d, index) => {
              const bar = { x: 0, y: 0, width: 0, height: 0, maxHeight: 0 }
              bar.height = graphsProps?.yMax - graphsProps?.yPoint(d)
              bar.width = graphsProps?.xScale.bandwidth()
              bar.x = graphsProps?.xPoint(d)
              bar.y = graphsProps?.yMax - bar.height
              bar.maxHeight = graphsProps?.yMax - graphsProps?.yPoint(correctedData[correctedData.length - 1])

              return (
                <Bar
                  className={classes.accountBarGraph}
                  x={bar.x}
                  y={bar.y}
                  width={bar.width}
                  height={bar.height}
                  onMouseOut={hideTooltip}
                  onMouseOver={(e) => handleMouseOver(e, d, bar)}
                  key={`bar-${index}`}
                  rx={bar.width * 0.08}
                />
              )
            })}
          </Group>
          <AxisBottom
            left={margin.left}
            top={height - margin.top}
            scale={graphsProps.xScale}
            tickStroke="transparent"
            stroke="transparent"
            tickFormat={(tick) =>
              isMonth ? moment(new Date(tick)).format('MMM') : moment(new Date(tick)).format('D MMM')
            }
            tickLabelProps={() => {
              return { ...commonTickHorizontalProps, textAnchor: 'middle' }
            }}
          />
          <AxisLeft
            left={margin.axis}
            numTicks={4}
            scale={graphsProps.yScale}
            tickFormat={(tick) => formatNumbers(tick)}
            stroke="transparent"
            tickStroke="transparent"
            tickLabelProps={() => commonTickVerticalProps('var(--color-2)')}
          />
        </svg>
        {tooltipOpen && (
          <Tooltip
            ref={tooltipRef}
            unstyled={true}
            className={`${classes.tooltipBase} ${classes.barTooltip}`}
            top={tooltipTop}
            left={tooltipLeft}
          >
            <div className={`${classes.tooltipDate} ${classes.centered}`}>
              {getTooltipDate((tooltipData as IAccountData).date)}
            </div>
            <div className={`${classes.tooltipInfo1} ${classes.centered} ${classes.breakWord}`}>
              {(tooltipData as IAccountData).total_accounts}
            </div>
          </Tooltip>
        )}
      </div>
    </>
  )
})

AccountGraph.displayName = 'AccountGraph'

export const AccountSizeGraph = () => {
  const accountDataFilter = useReactiveVar(filter)
  const height = useGraphHeight()

  return (
    <GraphWrapper
      title="Number of accounts"
      dateButtons={accountBtns}
      initialButtonValue={accountDataFilter.account.activeFilter}
      filterName="account"
    >
      <ParentSize>
        {({ width }) => <AccountGraph currentFilter={accountDataFilter.account} width={width} height={height} />}
      </ParentSize>
    </GraphWrapper>
  )
}
