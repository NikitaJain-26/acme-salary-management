import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import EmployeeDirectory from './pages/EmployeeDirectory'
import MainLayout from './layouts/MainLayout'

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route element={<Dashboard />} path="/" />
          <Route element={<EmployeeDirectory />} path="/employees" />
          <Route element={<Navigate replace to="/" />} path="*" />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  )
}

export default App