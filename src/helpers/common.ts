import { FetchUrlOpts } from '../@types/common'
import { filter } from '../store/reactiveVars'
import { TNameFilter } from './filter'
import React from 'react'

const THROTTLE_PARAMS = 100

export const fetchUrl: <Data>(opts: FetchUrlOpts<Data>) => Promise<Data> = async ({
  url,
  params,
  onError,
  onSuccess,
  onFinally,
}) => {
  try {
    const res = await fetch(_API_CONNECTION_STRING_ + url, params)
    const data = await res.json()

    onSuccess && onSuccess(data)

    return data
  } catch (e) {
    if (e instanceof Error) {
      console.log(e.message)
      onError && onError(e.message)
    }
  } finally {
    onFinally && onFinally()
  }
}

export const nearestValue = (arr: number[], val: number) => {
  return arr.reduce((nearest, num) => (Math.abs(num - val) >= Math.abs(nearest - val) && nearest < num ? nearest : num))
}

/* eslint-disable */
export const throttle = (fn: Function, wait = 300) => {
  let inThrottle: boolean, lastFn: ReturnType<typeof setTimeout>, lastTime: number
  return function (this: any) {
    const context = this,
      args = arguments
    if (!inThrottle) {
      fn.apply(context, args)
      lastTime = Date.now()
      inThrottle = true
    } else {
      clearTimeout(lastFn)
      lastFn = setTimeout(() => {
        if (Date.now() - lastTime >= wait) {
          fn.apply(context, args)
          lastTime = Date.now()
        }
      }, Math.max(wait - (Date.now() - lastTime), 0))
    }
  }
}

function debdounce(func: any, timeout = 300) {
  let timer: any
  return (...args: any) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      // @ts-ignore
      func.apply(this as any, args)
    }, timeout)
  }
}
function debounce(f: Function, ms = 150) {
  let isCooldown = false

  return function () {
    if (isCooldown) return
    // @ts-ignore
    f.apply(this, arguments)
    isCooldown = true

    setTimeout(() => (isCooldown = false), ms)
  }
}

export const hideShowScroll = (s: string) => {
  if (typeof window !== 'undefined' && document.body) {
    document.body.style.overflow = s
  }
}

export const plusScaleGraph = (key: TNameFilter, scrolling?: 'top' | 'bottom') => {
  const minusData = filter()[key].difference - filter()[key].scaleStep

  filter({
    ...filter(),
    [key]: {
      ...filter()[key],
      difference: minusData <= 0 ? filter()[key].scaleStep : minusData,
      scrolling: scrolling ?? '',
    },
  })
}

export const minusScaleGraph = (key: TNameFilter, scrolling?: 'top' | 'bottom') => {
  const plusData = filter()[key].difference + filter()[key].scaleStep

  filter({
    ...filter(),
    [key]: {
      ...filter()[key],
      difference: plusData >= filter()[key].maxScale ? filter()[key].difference : plusData,
      scrolling: scrolling ?? '',
    },
  })
}

export const onWheel = (e: React.WheelEvent, key: TNameFilter) => {
  if (!e.altKey) hideShowScroll('visible')
  if (e.altKey) {
    const y = e.deltaY
    if (y > 0) plusScaleGraph(key)
    if (y < 0) minusScaleGraph(key)
  }
}

export const throttleMinus: (key: TNameFilter, scrolling?: 'top' | 'bottom') => void = throttle(
  minusScaleGraph,
  THROTTLE_PARAMS
)
export const throttlePlus: (key: TNameFilter, scrolling?: 'top' | 'bottom') => void = throttle(
  plusScaleGraph,
  THROTTLE_PARAMS
)

export const throttleOnPinch = (num: number, key: TNameFilter) => {
  if (num < 0) throttleMinus(key)
  if (num > 0) throttlePlus(key)
}

export const throttleOnWheel: (event: React.WheelEvent, key: TNameFilter, offKey?: boolean) => void = throttle(
  onWheel,
  THROTTLE_PARAMS
)
