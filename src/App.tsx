import { memo } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { MainPage } from './components/pages/mainPage'
import './styles/index.css'

const App = memo(() => {
  return (
    <div id="App">
      <Router>
        <Routes>
          <Route path="/" element={<MainPage />} />
        </Routes>
      </Router>
    </div>
  )
})

App.displayName = 'App'
export { App }
