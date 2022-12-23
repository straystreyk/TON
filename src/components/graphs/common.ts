import moment from 'moment'
import { bisector } from 'd3-array'

export const commonGraphHeight = {
  big: 450,
  medium: 400,
  small: 250,
}

export const commonGraphMargin = {
  top: 20,
  right: 20,
  left: 100,
  bottom: 20,
  axis: 45,
}

export const commonGraphMobileMargin = {
  top: 20,
  right: 0,
  left: 0,
  bottom: 0,
  axis: 35,
}

/* eslint-disable */
export const commonTickVerticalProps: any = (fill?: string) => ({
  fontSize: '1.125rem',
  stroke: 'transparent',
  textAnchor: 'middle',
  fill: fill ?? 'var(--color-1)',
})

export const commonTickHorizontalProps: any = {
  fontSize: '0.875rem',
  textAnchor: 'middle',
  fill: 'var(--color-5)',
}

export const DEFAULT_NUM_TICKS_LARGEST_DESKTOP = 10
export const DEFAULT_NUM_TICKS_DESKTOP = 7
export const DEFAULT_NUM_TICKS_MOBILE = 4

export const getMinMax = <D>(d: D[], accessor: (d: D) => number) => [
  Math.floor(Math.min(...d.map(accessor))),
  Math.ceil(Math.max(...d.map(accessor))),
]

export const bisectDate = bisector((d: { date: string }) => new Date(d.date)).left

export const compose =
  <D>(scale: any, accessor: (d: D) => string | number | Date) =>
  (data: D) =>
    scale(accessor(data))

export const getTooltipDate = (date: Date | string) => moment(date).format('D MMM YYYY')

export const formatNumbers: any = (tick: any, fixed?: number) => {
  if (tick > 1e18 - 1) return fixed ? (tick / 1e18).toFixed(fixed) + 'E' : tick / 1e18 + 'E'
  if (tick > 1e15 - 1) return fixed ? (tick / 1e15).toFixed(fixed) + 'P' : tick / 1e15 + 'P'
  if (tick > 1e12 - 1) return fixed ? (tick / 1e12).toFixed(fixed) + 'T' : tick / 1e12 + 'T'
  if (tick > 1e9 - 1) return fixed ? (tick / 1e9).toFixed(fixed) + 'B' : tick / 1e9 + 'B'
  if (tick > 1e6 - 1) return fixed ? (tick / 1e6).toFixed(fixed) + 'M' : tick / 1e6 + 'M'
  if (tick > 1e3 - 1) return fixed ? (tick / 1e3).toFixed(fixed) + 'K' : tick / 1e3 + 'K'

  return tick
}
