import { filter } from '../../../store/reactiveVars'
import { IAccountData } from '../../../@types/graph'
import { groupBy } from '../accountGraph/helpers'
import moment from 'moment'
import { initialFilterConfig } from '../../../helpers/filter'

export const initiatedSupplyBtns = [
  {
    id: 'day',
    name: 'Day',
    onClick: () => filter({ ...filter(), initiatedSupply: initialFilterConfig.initiatedSupply }),
  },
  {
    id: 'week',
    name: 'Week',
    onClick: () =>
      filter({ ...filter(), initiatedSupply: { ...initialFilterConfig.initiatedSupply, activeFilter: 'week' } }),
  },
  {
    id: 'month',
    name: 'Month',
    onClick: () =>
      filter({ ...filter(), initiatedSupply: { ...initialFilterConfig.initiatedSupply, activeFilter: 'month' } }),
  },
]

export const getInitiatedSupplyGraphY = (d: IAccountData) => +(+d.initiated_supply / 1e9).toFixed(0)
export const getInitiatedSupplyGraphX = (d: IAccountData) => new Date(d.date)

export const getInitiatedSupplyDayData = (data: IAccountData[]) => {
  let from = data.length - filter().initiatedSupply.difference

  if (data.length - filter().initiatedSupply.difference <= 0) {
    from = 0
  }

  return { correctedData: data.slice(from, data.length), maxLength: data.length }
}

export const getWeekOrMonthInitiatedSupply = (data: IAccountData[], unit: 'isoWeek' | 'month') => {
  const weekData = data.map((item) => ({ ...item, date: moment(item.date).endOf(unit).format('MMMM D, YYYY') }))
  const groupedData = groupBy(weekData as [], 'date') as { [p: string]: IAccountData[] }
  const finalArray = Object.keys(groupedData).map((key) => {
    const item = groupedData[key as string] as IAccountData[]
    const d = item.reduce(
      (acc, currentValue) => ({
        ...currentValue,
        total_accounts: +acc.initiated_supply + +currentValue.initiated_supply,
      }),
      {
        total_accounts: 0,
      } as IAccountData
    )
    d.total_accounts = Math.round(+(+d.initiated_supply / 1e9) / item.length)
    return d
  })

  let from = finalArray.length - filter().initiatedSupply.difference

  if (finalArray.length - filter().initiatedSupply.difference <= 0) {
    from = 0
  }

  return { correctedData: finalArray.slice(from, finalArray.length), maxLength: finalArray.length }
}

/*eslint-disable*/
export const dateFormat: any = {
  day: '%d %b',
  week: '%d %b',
  month: '%b',
}
