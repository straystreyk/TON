import { filter } from '../../../store/reactiveVars'
import { IGroupedTransactions, ITransactionAmounts, ITransactionCounts } from '../../../@types/graph'
import moment from 'moment'
import { groupBy } from '../accountGraph/helpers'
import { initialFilterConfig } from '../../../helpers/filter'

export const initialTransactionsBtns = [
  {
    id: 'day',
    name: 'Day',
    onClick: () => filter({ ...filter(), transaction: { ...initialFilterConfig.transaction, activeFilter: 'day' } }),
  },
  {
    id: 'week',
    name: 'Week',
    onClick: () => filter({ ...filter(), transaction: { ...initialFilterConfig.transaction, activeFilter: 'week' } }),
  },
  {
    id: 'month',
    name: 'Month',
    onClick: () => filter({ ...filter(), transaction: { ...initialFilterConfig.transaction, activeFilter: 'month' } }),
  },
]

export const transactGraphX = (d: { date: string }) => moment(d.date).format('D MMM YYYY')
export const transactGraphLineX = (d: IGroupedTransactions) => new Date(d.date)
export const transactGraphAmountsY = (d: IGroupedTransactions) => (+d.sum_transactions_amounts / 1e9).toFixed(0)

export const transactGraphCountY = (d: IGroupedTransactions) => d.transactions_count

export const getDayTransactions = (amounts: ITransactionAmounts[], counts: ITransactionCounts[]) => {
  const bigger = amounts.length > counts.length ? amounts : counts
  const smaller = counts.length < amounts.length ? counts : amounts

  const arr = bigger.map((item, index) => (smaller[index] ? { ...item, ...smaller[index] } : { ...item }))

  let from = arr.length - filter().transaction.difference

  if (arr.length - filter().transaction.difference <= 0) {
    from = 0
  }

  return { correctedData: arr.slice(from, arr.length), maxLength: arr.length }
}

export const getWeekOrMonthTransactions = (
  amounts: ITransactionAmounts[],
  counts: ITransactionCounts[],
  unit: 'week' | 'month'
) => {
  const bigger = amounts.length > counts.length ? amounts : counts
  const smaller = counts.length < amounts.length ? counts : amounts
  const data = bigger.map((item, index) => (smaller[index] ? { ...item, ...smaller[index] } : { ...item }))
  const weekData = data.map((item) => ({ ...item, date: moment(item.date).endOf(unit).format('MMMM D, YYYY') }))
  const groupedData = groupBy(weekData as [], 'date') as { [p: string]: IGroupedTransactions[] }
  const finalArray = Object.keys(groupedData).map((key) => {
    const item = groupedData[key as string] as IGroupedTransactions[]
    const d = item.reduce(
      (acc, currentValue) => ({
        ...currentValue,
        transactions_count: +acc.transactions_count + +currentValue.transactions_count,
        sum_transactions_amounts: (+acc.sum_transactions_amounts + +currentValue.sum_transactions_amounts).toString(),
      }),
      {
        transactions_count: 0,
        sum_transactions_amounts: '0',
      } as IGroupedTransactions
    )

    d.transactions_count = +d.transactions_count / item.length
    d.sum_transactions_amounts = (+d.sum_transactions_amounts / item.length).toString()
    return d
  })

  let from = finalArray.length - filter().transaction.difference

  if (finalArray.length - filter().transaction.difference <= 0) {
    from = 0
  }

  return { correctedData: finalArray.slice(from, finalArray.length), maxLength: finalArray.length }
}
