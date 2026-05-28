import { Routes, Route } from 'react-router-dom'
import ApiTestPage from '../pages/ApiTestPage'

const AppRoutes = () => {
  return (
    <Routes>
      <Route path='/' element={<ApiTestPage />} />
    </Routes>
  )
}

export default AppRoutes
