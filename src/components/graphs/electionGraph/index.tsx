import React from 'react'
import { ParentSize } from '@visx/responsive'
import { scaleLinear, scaleUtc } from '@visx/scale'
import { AxisBottom, AxisLeft } from '@visx/axis'
import { GridRows } from '@visx/grid'
import { Group } from '@visx/group'
import { useReactiveVar } from '@apollo/client'

import { GraphWrapper } from '../graphWrapper'
import { IElectionGraph, TGraph } from '../../../@types/graph'
import { electionData, filter } from '../../../store/reactiveVars'
import classes from '../../../styles/components/graph.module.css'

import election from '../../../mock/election.json'

import {
  electionBtns,
  getDayElections,
  getElectionGraphXTest,
  getElectionGraphY,
  getWeekOrMonthAccountsData,
} from './helpers'
import {
  commonGraphMobileMargin,
  compose,
  formatNumbers,
  getMinMax,
  getTooltipDate,
  commonGraphMargin,
  commonTickHorizontalProps,
  commonTickVerticalProps,
} from '../common'
import { Tooltip, useTooltip } from '@visx/tooltip'
import { localPoint } from '@visx/event'
import { useMediaQuery } from 'react-responsive'
import { MEDIA_CONFIG } from '../../../helpers/media'
import { useGraphHeight, useGraphScale, useNumTicks } from '../../../hooks/graph'
import { extent } from 'd3-array'
import { timeFormat } from 'd3-time-format'
import { dateFormat } from '../initiatedSupplyGraph/helpers'
import { nearestValue } from '../../../helpers/common'
import { GraphTitle } from '../graphTitle'

const opacityConf = { max: 0.6, middle: 0.3, min: 0.2 }

export const ElectionGraph: React.FC<TGraph> = React.memo(({ width, height, currentFilter }) => {
  const electionDataInfo = useReactiveVar(electionData)
  const { tooltipLeft, tooltipData, tooltipTop, tooltipOpen, hideTooltip, showTooltip } = useTooltip()
  const isMobile = useMediaQuery({ query: `(max-width: ${MEDIA_CONFIG.mobile.big}px)` })
  const ref = React.useRef<HTMLDivElement>(null)
  useGraphScale('election', ref)

  const margin = React.useMemo(() => (!isMobile ? commonGraphMargin : commonGraphMobileMargin), [isMobile])

  const { correctedData, maxLength } = React.useMemo(() => {
    if (!electionDataInfo.length) return { correctedData: [], maxLength: 0 }

    if (currentFilter.activeFilter === 'day') return getDayElections(electionDataInfo)
    if (currentFilter.activeFilter === 'week') return getWeekOrMonthAccountsData(electionDataInfo, 'isoWeek')
    if (currentFilter.activeFilter === 'month') return getWeekOrMonthAccountsData(electionDataInfo, 'month')

    return { correctedData: [], maxLength: 0 }
  }, [electionDataInfo, currentFilter])

  const numTicks = useNumTicks(correctedData.length)
  const radius = React.useMemo(
    () => (isMobile ? { max: 20, middle: 10, min: 7 } : { max: 30, middle: 20, min: 10 }),
    [isMobile]
  )
  const legendWidth = React.useMemo(
    () => (isMobile ? 0 : radius.max * 2 + margin.right * 4),
    [isMobile, margin.right, radius.max]
  )

  const graphsProps = React.useMemo(() => {
    if (!correctedData || !correctedData.length) return null

    const xMax = width - margin.left - margin.right - legendWidth
    const yMax = height - margin.top - margin.bottom

    const [minStake, maxStake] = getMinMax(correctedData, (d) => +d.stake_sum)
    const middleStake = (maxStake + minStake) / 2
    const circleStakeArray = [minStake, middleStake, maxStake]

    const [yDomainMin, yDomainMax] = getMinMax(correctedData, getElectionGraphY)

    const xScale = scaleUtc({
      domain: extent(correctedData, getElectionGraphXTest) as [Date, Date],
      range: [0, xMax],
    })

    const yScale = scaleLinear({
      range: [yMax, 0],
      round: true,
      nice: true,
      domain: [yDomainMin, yDomainMax],
    })

    const xPoint = compose(xScale, getElectionGraphXTest)
    const yPoint = compose(yScale, getElectionGraphY)

    return { xScale, xMax, yMax, yScale, xPoint, yPoint, minStake, maxStake, middleStake, circleStakeArray }
  }, [correctedData, height, legendWidth, margin.bottom, margin.left, margin.right, margin.top, width])

  const handleMouseOver = (e: React.MouseEvent, item: IElectionGraph) => {
    const cords = localPoint(e)

    showTooltip({
      tooltipTop: 0,
      tooltipLeft: cords?.x,
      tooltipData: { ...item, date: getTooltipDate(item.date) },
    })
  }

  React.useEffect(() => {
    electionData(election)
  }, [])

  React.useEffect(() => {
    if (maxLength && filter().election.maxScale !== maxLength) {
      filter({ ...filter(), election: { ...filter().election, maxScale: maxLength } })
    }
  }, [maxLength])

  if (!correctedData.length || !graphsProps || !Object.keys(graphsProps).length)
    return <div style={{ width, height }} />

  return (
    <div tabIndex={-1} ref={ref} className={`${classes.tooltipWrapper} ${classes.electionWrapper}`}>
      <svg width={width} height={height + margin.top}>
        <Group left={margin.left}>
          <GridRows scale={graphsProps?.yScale} width={width} />
          {correctedData.map((item, index) => {
            const val = nearestValue(graphsProps?.circleStakeArray, +item.stake_sum)
            let r = radius.min
            let opacity = opacityConf.min
            if (val === graphsProps?.maxStake) {
              r = radius.max
              opacity = opacityConf.max
            }
            if (val === graphsProps?.middleStake) {
              r = radius.middle
              opacity = opacityConf.middle
            }

            return (
              <circle
                className={`${classes.circle} ${classes.circleHover}`}
                key={'election-circle-' + index}
                onMouseOut={hideTooltip}
                onMouseOver={(e) => handleMouseOver(e, item)}
                fill="var(--color-1)"
                stroke="var(--color-1)"
                r={r}
                opacity={opacity}
                cx={graphsProps?.xScale(getElectionGraphXTest(item))}
                cy={graphsProps?.yScale(getElectionGraphY(item))}
              />
            )
          })}
        </Group>
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
          tickFormat={formatNumbers}
          stroke="transparent"
          numTicks={4}
          tickStroke="transparent"
          tickLabelProps={() => commonTickVerticalProps('var(--color-5)')}
        />
      </svg>
      {!isMobile && (
        <div className={classes.electionLegend} style={{ width: legendWidth, paddingBottom: margin.bottom }}>
          <div
            className={classes.electionLegendItem}
            style={{
              width: radius.max * 2,
              height: radius.max * 2,
              backgroundColor: `rgba(0, 136, 204, ${opacityConf.max})`,
            }}
          >
            <span>{formatNumbers(graphsProps.maxStake / 1e9, 1)}</span>
          </div>
          <div
            className={classes.electionLegendItem}
            style={{
              width: radius.middle * 2,
              height: radius.middle * 2,
              backgroundColor: `rgba(0, 136, 204, ${opacityConf.middle})`,
            }}
          >
            <span>{formatNumbers(graphsProps.middleStake / 1e9, 1)}</span>
          </div>
          <div
            className={classes.electionLegendItem}
            style={{
              width: radius.min * 2,
              height: radius.min * 2,
              backgroundColor: `rgba(0, 136, 204, ${opacityConf.min})`,
            }}
          >
            <span>{formatNumbers(graphsProps.minStake / 1e9, 1)}</span>
          </div>
        </div>
      )}
      {tooltipOpen && (
        <Tooltip
          unstyled={true}
          className={`${classes.tooltipBase}  ${classes.alwaysTop} ${classes.barTooltip}`}
          top={tooltipTop}
          left={tooltipLeft}
        >
          <div className={`${classes.tooltipDate} ${classes.centered}`}>{(tooltipData as IElectionGraph).date}</div>
          <div className={`${classes.tooltipInfo1} ${classes.centered} ${classes.breakWord}`}>
            {(tooltipData as IElectionGraph).validators} {!isMobile && 'validators'}
          </div>
          <div className={`${classes.tooltipInfo2} ${classes.centered} ${classes.breakWord}`}>
            {!isMobile && 'Stake:'} {(+(tooltipData as IElectionGraph).stake_sum / 1e9).toFixed(0)}
          </div>
        </Tooltip>
      )}
    </div>
  )
})

ElectionGraph.displayName = 'ElectionGraph'

export const ResizeElectionGraph = () => {
  const electionDataFilter = useReactiveVar(filter)
  const height = useGraphHeight()

  return (
    <GraphWrapper
      title="Past elections"
      filterName="election"
      dateButtons={electionBtns}
      initialButtonValue={electionDataFilter.election.activeFilter}
    >
      <GraphTitle leftTitle="Validators" className={classes.graphTitleElection} />
      <ParentSize>
        {({ width }) => <ElectionGraph currentFilter={electionDataFilter.election} width={width} height={height} />}
      </ParentSize>
    </GraphWrapper>
  )
}
