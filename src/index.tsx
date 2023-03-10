import { createRoot } from 'react-dom/client'
import { App } from './App'

const container = document.getElementById('root')
const root = container ? createRoot(container) : undefined

root?.render(<App />)
