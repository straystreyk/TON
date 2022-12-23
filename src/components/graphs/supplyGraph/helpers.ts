import { IAccountData } from '../../../@types/graph'
import { filter } from '../../../store/reactiveVars'
import { groupBy } from '../accountGraph/helpers'
import moment from 'moment'
import { initialFilterConfig } from '../../../helpers/filter'

export const supplyBtns = [
  {
    id: 'day',
    name: 'Day',
    onClick: () => filter({ ...filter(), supply: initialFilterConfig.supply }),
  },
  {
    id: 'week',
    name: 'Week',
    onClick: () => filter({ ...filter(), supply: { ...initialFilterConfig.supply, activeFilter: 'week' } }),
  },
  {
    id: 'month',
    name: 'Month',
    onClick: () => filter({ ...filter(), supply: { ...initialFilterConfig.supply, activeFilter: 'month' } }),
  },
]

export const getWeekOrMonthSupply = (data: IAccountData[], unit: 'isoWeek' | 'month') => {
  const weekData = data.map((item) => ({ ...item, date: moment(item.date).endOf(unit).format('MMMM D, YYYY') }))
  const groupedData = groupBy(weekData as [], 'date') as { [p: string]: IAccountData[] }
  const finalArray = Object.keys(groupedData).map((key) => {
    const item = groupedData[key as string] as IAccountData[]
    const d = item.reduce(
      (acc, currentValue) => ({
        ...currentValue,
        total_accounts: +acc.circulating_supply + +currentValue.circulating_supply,
        total_supply: (+acc.total_supply + +currentValue.total_supply).toString(),
      }),
      {
        total_accounts: 0,
        total_supply: '0',
      } as IAccountData
    )
    d.total_accounts = +d.initiated_supply / item.length
    d.total_supply = (+d.total_supply / item.length).toString()
    return d
  })

  let from = finalArray.length - filter().supply.difference

  if (finalArray.length - filter().supply.difference <= 0) {
    from = 0
  }

  return { correctedData: finalArray.slice(from, finalArray.length), maxLength: finalArray.length }
}

export const getSupplyTotalGraphY = (d: IAccountData) => +(+d.total_supply / 1e9)
export const getSupplyCirculatingGraphY = (d: IAccountData) => +(+d.circulating_supply / 1e9)

export const getSupplyDayData = (data: IAccountData[] /* pos: IAccountData | undefined*/) => {
  // const mouseIndex = pos ? data.indexOf(pos) : -1
  const difference = filter().supply.difference
  const scaleStep = filter().supply.scaleStep
  // const scrolling = filter().supply.scrolling

  // if (mouseIndex > -1) {
  // if (scrolling === 'top') {
  //   const leftIndex = mouseIndex - Math.floor(difference / 2)
  //   const rightIndex = mouseIndex + Math.floor(difference / 2)
  //   const left = data.slice(leftIndex, mouseIndex)
  //   const right = data.slice(mouseIndex, rightIndex)
  //   return { correctedData: [...left, ...right], maxLength: data.length }
  // }
  // if (scrolling === 'bottom') {
  // }
  // }

  let from = data.length - difference

  if (data.length - difference <= scaleStep) {
    from = 0
  }

  return { correctedData: data.slice(from, data.length), maxLength: data.length }
}
