export type TNameFilter = 'initiatedSupply' | 'account' | 'election' | 'yld' | 'transaction' | 'supply'

type TGraphFilter = 'day' | 'week' | 'month'
export type TFilter = {
  activeFilter: TGraphFilter
  maxScale: number
  difference: number
  scaleStep: number
  scrolling: 'bottom' | 'top' | ''
  currentlyDisplayed: []
}

export const initialFilterConfig: { [p in TNameFilter]: TFilter } = {
  initiatedSupply: {
    activeFilter: 'day',
    maxScale: 0,
    difference: 7,
    scaleStep: 7,
    scrolling: '',
    currentlyDisplayed: [],
  },
  account: { activeFilter: 'day', maxScale: 0, difference: 7, scaleStep: 7, scrolling: '', currentlyDisplayed: [] },
  election: { activeFilter: 'day', maxScale: 0, difference: 7, scaleStep: 7, scrolling: '', currentlyDisplayed: [] },
  yld: { activeFilter: 'day', maxScale: 0, difference: 7, scaleStep: 7, scrolling: '', currentlyDisplayed: [] },
  transaction: { activeFilter: 'day', maxScale: 0, difference: 7, scaleStep: 7, scrolling: '', currentlyDisplayed: [] },
  supply: { activeFilter: 'day', maxScale: 0, difference: 7, scaleStep: 7, scrolling: '', currentlyDisplayed: [] },
}
