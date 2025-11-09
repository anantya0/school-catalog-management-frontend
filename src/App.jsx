import { Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@mui/material'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Equipment from './pages/Equipment'
import EquipmentDetail from './pages/EquipmentDetail'
import BorrowingRequests from './pages/BorrowingRequests'
import MyBorrowings from './pages/MyBorrowings'
import Users from './pages/Users'
import Profile from './pages/Profile'
import Notifications from './pages/Notifications'
import LoadingSpinner from './components/common/LoadingSpinner'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/equipment" element={<Equipment />} />
        <Route path="/equipment/:id" element={<EquipmentDetail />} />
        <Route path="/borrowing-requests" element={<BorrowingRequests />} />
        <Route path="/my-borrowings" element={<MyBorrowings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/notifications" element={<Notifications />} />
        
        {/* Admin/Staff only routes */}
        {(user.role === 'admin' || user.role === 'staff') && (
          <Route path="/users" element={<Users />} />
        )}
        
        <Route path="/login" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  )
}

export default App