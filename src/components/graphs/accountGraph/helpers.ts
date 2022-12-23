import { IAccountData } from '../../../@types/graph'
import { TickFormatter } from '@visx/axis'
import { filter } from '../../../store/reactiveVars'
import moment from 'moment'
import { initialFilterConfig } from '../../../helpers/filter'

export const groupBy = (arr: [], key: string) => {
  return arr.reduce((item, x) => {
    ;((item[x[key]] = item[x[key]] || []) as []).push(x)
    return item
  }, {})
}

export const accountGraphX = (d: IAccountData) => moment(d.date).format('D MMM')
export const accountGraphXTest = (d: IAccountData) => new Date(d.date)
export const accountGraphY = (d: IAccountData) => d.total_accounts

/* eslint-disable*/
export const tickFormatterMonthsX: TickFormatter<any> = (tick) => {
  return tick.split(' ')[1]
}

export const accountBtns = [
  {
    id: 'day',
    name: 'Day',
    onClick: () => filter({ ...filter(), account: { ...initialFilterConfig.account, activeFilter: 'day' } }),
  },
  {
    id: 'week',
    name: 'Week',
    onClick: () => filter({ ...filter(), account: { ...initialFilterConfig.account, activeFilter: 'week' } }),
  },
  {
    id: 'month',
    name: 'Month',
    onClick: () => filter({ ...filter(), account: { ...initialFilterConfig.account, activeFilter: 'month' } }),
  },
]

export const getDayAccountsData = (data: IAccountData[]) => {
  let from = data.length - filter().account.difference

  if (data.length - filter().account.difference <= 0) {
    from = 0
  }

  return { correctedData: data.slice(from, data.length), maxLength: data.length }
}

export const getWeekOrMonthAccountsData = (data: IAccountData[], unit: 'week' | 'month') => {
  const weekData = data.map((item) => ({ ...item, date: moment(item.date).endOf(unit).format('MMMM D, YYYY') }))
  const groupedData = groupBy(weekData as [], 'date') as { [p: string]: IAccountData[] }
  const finalArray = Object.keys(groupedData).map((key) => {
    const item = groupedData[key as string] as IAccountData[]
    const d = item.reduce(
      (acc, currentValue) => ({
        ...currentValue,
        total_accounts: acc.total_accounts + currentValue.total_accounts,
      }),
      {
        total_accounts: 0,
      } as IAccountData
    )
    d.total_accounts = Math.round(d.total_accounts / item.length)
    return d
  })

  let from = finalArray.length - filter().account.difference

  if (finalArray.length - filter().account.difference <= 0) {
    from = 0
  }

  return { correctedData: finalArray.slice(from, finalArray.length), maxLength: finalArray.length }
}
