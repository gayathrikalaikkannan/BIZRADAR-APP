import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import Home from './pages/Home'
import UserLogin from './pages/UserLogin'
import UserSignup from './pages/UserSignup'
import UserDashboard from './pages/UserDashboard'
import AdminLogin from './pages/AdminLogin'
import AdminSignup from './pages/AdminSignup'
import AdminDashboard from './pages/AdminDashboard'
import LoggedOut from './pages/LoggedOut'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/logged-out" element={<LoggedOut />} />

        <Route path="/login" element={<UserLogin />} />
        <Route path="/signup" element={<UserSignup />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requireRole="user">
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/signup" element={<AdminSignup />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requireRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  )
}
