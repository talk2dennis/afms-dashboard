import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import DashboardLayout from './pages/dashboard/DashboardLayout'
import AlertsPage from './pages/dashboard/AlertsPage'
import NotificationsPage from './pages/dashboard/NotificationsPage'
import OverviewPage from './pages/dashboard/OverviewPage'
import ReportsPage from './pages/dashboard/ReportsPage'
import UsersPage from './pages/dashboard/UsersPage'
import LoginPage from './pages/LoginPage'
import './App.css'

function App () {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path='/'
            element={<Navigate to='/dashboard/overview' replace />}
          />
          <Route path='/login' element={<LoginPage />} />
          <Route
            path='/dashboard'
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to='overview' replace />} />
            <Route path='overview' element={<OverviewPage />} />
            <Route path='users' element={<UsersPage />} />
            <Route path='reports' element={<ReportsPage />} />
            <Route path='alerts' element={<AlertsPage />} />
            <Route path='notifications' element={<NotificationsPage />} />
          </Route>
          <Route
            path='*'
            element={<Navigate to='/dashboard/overview' replace />}
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
