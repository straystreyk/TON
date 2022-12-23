import { makeVar, ReactiveVar } from '@apollo/client'
import { rehydrate } from '../helpers'
import { persistedStore } from '../store'

export const testVar = makeVar<string>('')

export const setTestVar = (value: string) => {
  testVar(value)
  persistedStore.setItem('testVarKey', value)
}

const dataToPersist: { storeKey: string; reactiveVar: ReactiveVar<any> }[] = [
  { storeKey: 'testVarKey', reactiveVar: testVar },
]

dataToPersist.forEach((data) => rehydrate(data))
