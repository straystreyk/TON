import { filter } from '../../../store/reactiveVars'
import { IElectionGraph } from '../../../@types/graph'
import { groupBy } from '../accountGraph/helpers'
import moment from 'moment'
import { initialFilterConfig } from '../../../helpers/filter'

export const electionBtns = [
  {
    id: 'day',
    name: 'Day',
    onClick: () => filter({ ...filter(), election: { ...initialFilterConfig.election, activeFilter: 'day' } }),
  },
  {
    id: 'week',
    name: 'Week',
    onClick: () => filter({ ...filter(), election: { ...initialFilterConfig.election, activeFilter: 'week' } }),
  },
  {
    id: 'month',
    name: 'Month',
    onClick: () => filter({ ...filter(), election: { ...initialFilterConfig.election, activeFilter: 'month' } }),
  },
]

export const getElectionGraphXTest = (d: IElectionGraph) => new Date(d.date)
export const getElectionGraphY = (d: IElectionGraph) => +d.validators

export const getDayElections = (data: IElectionGraph[]) => {
  let from = data.length - filter().election.difference

  if (data.length - filter().election.difference <= 0) {
    from = 0
  }

  return { correctedData: data.slice(from, data.length), maxLength: data.length }
}

export const getWeekOrMonthAccountsData = (data: IElectionGraph[], unit: 'isoWeek' | 'month') => {
  const weekData = data.map((item) => ({ ...item, date: moment(item.date).endOf(unit).format('MMMM D, YYYY') }))
  const groupedData = groupBy(weekData as [], 'date') as { [p: string]: IElectionGraph[] }
  const finalArray = Object.keys(groupedData).map((key) => {
    const item = groupedData[key as string] as IElectionGraph[]
    const d = item.reduce(
      (acc, currentValue) => ({
        ...currentValue,
        validators: (+acc.validators + +currentValue.validators).toString(),
      }),
      {
        validators: '0',
      } as IElectionGraph
    )
    d.validators = Math.round(+d.validators / item.length).toString()
    return d
  })

  let from = finalArray.length - filter().election.difference

  if (finalArray.length - filter().election.difference <= 0) {
    from = 0
  }

  return { correctedData: finalArray.slice(from, finalArray.length), maxLength: finalArray.length }
}
