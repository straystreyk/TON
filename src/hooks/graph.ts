import React from 'react'
import { useMediaQuery } from 'react-responsive'
import { MEDIA_CONFIG } from '../helpers/media'
import {
  DEFAULT_NUM_TICKS_DESKTOP,
  commonGraphHeight,
  DEFAULT_NUM_TICKS_LARGEST_DESKTOP,
  DEFAULT_NUM_TICKS_MOBILE,
} from '../components/graphs/common'
import { TNameFilter } from '../helpers/filter'
import { useGesture } from '@use-gesture/react'
import { hideShowScroll, throttleOnPinch, throttleOnWheel } from '../helpers/common'

export const useGraphHeight = () => {
  const isLargestDesktopStart = useMediaQuery({ query: `(min-width: ${MEDIA_CONFIG.desktop.largest}px)` })
  const isDesktopStart = useMediaQuery({ query: `(min-width: ${MEDIA_CONFIG.desktop.small + 1}px)` })
  const isLaptopAndMobiles = useMediaQuery({ query: `(max-width: ${MEDIA_CONFIG.desktop.small}px)` })

  const height = React.useMemo(() => {
    if (isLargestDesktopStart) return commonGraphHeight.big
    if (isDesktopStart) return commonGraphHeight.medium
    if (isLaptopAndMobiles) return commonGraphHeight.small

    return commonGraphHeight.small
  }, [isDesktopStart, isLaptopAndMobiles, isLargestDesktopStart])

  return height
}

export const useNumTicks = (arrLength: number) => {
  const isLargestDesktopStart = useMediaQuery({ query: `(min-width: ${MEDIA_CONFIG.desktop.largest}px)` })
  const isDesktopStart = useMediaQuery({ query: `(min-width: ${MEDIA_CONFIG.desktop.small + 1}px)` })
  const isLaptopAndMobiles = useMediaQuery({ query: `(max-width: ${MEDIA_CONFIG.desktop.small}px)` })

  const numTicks = React.useMemo(() => {
    if (isLargestDesktopStart)
      return arrLength > DEFAULT_NUM_TICKS_LARGEST_DESKTOP ? DEFAULT_NUM_TICKS_LARGEST_DESKTOP : arrLength

    if (isDesktopStart) return arrLength > DEFAULT_NUM_TICKS_DESKTOP ? DEFAULT_NUM_TICKS_DESKTOP : arrLength

    if (isLaptopAndMobiles) return arrLength > DEFAULT_NUM_TICKS_MOBILE ? DEFAULT_NUM_TICKS_MOBILE : arrLength

    return arrLength > DEFAULT_NUM_TICKS_MOBILE ? DEFAULT_NUM_TICKS_MOBILE : arrLength
  }, [isLargestDesktopStart, arrLength, isDesktopStart, isLaptopAndMobiles])

  return numTicks
}

export const useGraphScale = (key: TNameFilter, ref?: React.Ref<any>) => {
  const [isPinching, setIsPinching] = React.useState(false)
  useGesture(
    {
      onPinch: ({ direction }) => {
        throttleOnPinch(direction[0], key)
        setIsPinching(true)
      },
      onWheel: ({ event }) => {
        throttleOnWheel(event as any, key)
      },
      onPinchEnd: () => {
        setIsPinching(false)
      },
      onMouseEnter: () => {
        ;((ref as any).current as HTMLDivElement)?.focus({ preventScroll: true })
      },

      onKeyDown: ({ event }) => {
        if (event.altKey) {
          hideShowScroll('hidden')
        }
      },
      onKeyUp: () => {
        if (document.body.style.overflow === 'hidden') hideShowScroll('visible')
        ;((ref as any).current as HTMLDivElement)?.focus({ preventScroll: true })
      },
    },
    {
      target: ref as any,
    }
  )

  return { isPinching }
}
