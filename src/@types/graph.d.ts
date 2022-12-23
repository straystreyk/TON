import { ReactNode } from 'react'
import { TFilter, TNameFilter } from '../helpers/filter'

export interface IGraphWrapper {
  title: string
  children: ReactNode
  dateButtons?: IGraphDateButton[]
  className?: string
  initialButtonValue?: string
  filterName: TNameFilter
}

export interface IGraphDateButton {
  id: string
  name: string
  onClick?: () => void
}

export interface IAccountData {
  date: string
  timestamp: number
  total_accounts: number
  total_supply: string
  circulating_supply: string
  initiated_supply: string
}

export interface ITransactionAmounts {
  date: string
  from_timestamp: number
  to_timestamp: number
  sum_transactions_amounts: string
}

export interface ITransactionCounts {
  date: string
  from_timestamp: number
  to_timestamp: number
  transactions_count: number
  users_transactions_count: number
}

export type IGroupedTransactions = ITransactionAmounts & ITransactionCounts

export interface IYldData {
  date: string
  staked: number
  rewarded: number
  annual_percent_yld: number
}

export type TGraph = { width: number; height: number; currentFilter: TFilter }

export interface IElectionGraph {
  date: string
  election_id: number
  stake_sum: string
  validators: string
}
