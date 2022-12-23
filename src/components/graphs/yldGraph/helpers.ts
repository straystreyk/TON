import { IYldData } from '../../../@types/graph'
import moment from 'moment'
import { groupBy } from '../accountGraph/helpers'
import { filter } from '../../../store/reactiveVars'
import { initialFilterConfig } from '../../../helpers/filter'

export const getYldGraphY = (d: IYldData) => d.annual_percent_yld * 100
export const getYldGraphX = (d: IYldData) => new Date(d.date)

export const yldBtns = [
  {
    id: 'day',
    name: 'Day',
    onClick: () => filter({ ...filter(), yld: { ...initialFilterConfig.yld, activeFilter: 'day' } }),
  },
  {
    id: 'week',
    name: 'Week',
    onClick: () => filter({ ...filter(), yld: { ...initialFilterConfig.yld, activeFilter: 'week' } }),
  },
  {
    id: 'month',
    name: 'Month',
    onClick: () => filter({ ...filter(), yld: { ...initialFilterConfig.yld, activeFilter: 'month' } }),
  },
]

export const getWeekOrMonthYld = (data: IYldData[], unit: 'isoWeek' | 'month' | 'day') => {
  const weekData = data.map((item) => ({ ...item, date: moment(item.date).endOf(unit).format('MMMM D, YYYY') }))
  const groupedData = groupBy(weekData as [], 'date') as { [p: string]: IYldData[] }
  const finalArray = Object.keys(groupedData).map((key) => {
    const item = groupedData[key as string] as IYldData[]
    const d = item.reduce(
      (acc, currentValue) => ({
        ...currentValue,
        annual_percent_yld: +acc.annual_percent_yld + +currentValue.annual_percent_yld,
      }),
      {
        annual_percent_yld: 0,
      } as IYldData
    )
    d.annual_percent_yld = d.annual_percent_yld / item.length
    return d
  })

  let from = finalArray.length - filter().yld.difference

  if (finalArray.length - filter().yld.difference <= 0) {
    from = 0
  }

  return { correctedData: finalArray.slice(from, finalArray.length), maxLength: finalArray.length }
}
