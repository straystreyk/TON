import { makeVar } from '@apollo/client'
import { IAccountData, IElectionGraph, ITransactionAmounts, ITransactionCounts, IYldData } from '../@types/graph'
import { initialFilterConfig } from '../helpers/filter'

export const filter = makeVar(initialFilterConfig)

export const accountData = makeVar<IAccountData[]>([])
export const transactionAmounts = makeVar<ITransactionAmounts[]>([])
export const transactionCounts = makeVar<ITransactionCounts[]>([])
export const yldData = makeVar<IYldData[]>([])
export const electionData = makeVar<IElectionGraph[]>([])
