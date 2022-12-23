import { ReactiveVar } from '@apollo/client'
import { persistedStore } from './store'

export const rehydrate = async (store: { storeKey: string; reactiveVar: ReactiveVar<any> }) => {
  const { storeKey, reactiveVar } = store
  const rehydratedValue = (await persistedStore.getItem(storeKey)) as any
  if (typeof rehydratedValue === 'boolean' || rehydratedValue) reactiveVar(rehydratedValue)
}
