import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { CssBaseline, Container } from '@mui/material'
import { ThemeProvider, createTheme, responsiveFontSizes } from '@mui/material/styles'
import useBrandConfig from './hooks/useBrandConfig.js'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Pending from './pages/Pending.jsx'
import './setupAxiosNotifications'
import Landing from './pages/Landing.jsx'
import InductionWizard from './pages/InductionWizard.jsx'
import ReviewQueue from './pages/ReviewQueue.jsx'
import SlidesViewer from './pages/SlidesViewer.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminProjects from './pages/admin/Projects.jsx'
import AdminReviews from './pages/admin/Reviews.jsx'
import AdminUsers from './pages/admin/Users.jsx'
import AdminSettings from './pages/admin/Settings.jsx'
import ManagerDashboard from './pages/manager/ManagerDashboard.jsx'
import WorkerDashboard from './pages/worker/WorkerDashboard.jsx'
import AppNav from './layout/AppNav.jsx'
import MainLayout from './components/layout/MainLayout.jsx'
import AdminLayout from './components/layout/AdminLayout.jsx'
import ManagerLayout from './components/layout/ManagerLayout.jsx'
import WorkerLayout from './components/layout/WorkerLayout.jsx'
import { useAuthStore } from './context/authStore.js'

function getDashboardPath(user) {
  if (!user) return '/login'
  if (user.role === 'admin') return '/admin/dashboard'
  if (user.role === 'manager') return '/manager/dashboard'
  return '/worker/dashboard'
}

function RequireAuth({ children, roles }) {
  const { user } = useAuthStore()
  if (!user) {
    return <Navigate to="/login" replace />
  }
  if (roles?.length && !roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }
  return children
}

function AppRoutes() {
  const { user } = useAuthStore()
  const dashboardPath = getDashboardPath(user)

  return (
    <Routes>
      <Route path="/" element={!user ? <Landing /> : <Navigate to={dashboardPath} replace />} />
      <Route path="/login" element={!user ? <Login /> : <Navigate to={dashboardPath} replace />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to={dashboardPath} replace />} />
      <Route path="/pending" element={<Pending />} />
      <Route path="/wizard" element={<RequireAuth><InductionWizard /></RequireAuth>} />
      <Route path="/review" element={<RequireAuth roles={['admin', 'manager']}><ManagerLayout><ReviewQueue /></ManagerLayout></RequireAuth>} />
      <Route path="/slides-viewer" element={<SlidesViewer />} />
      <Route path="/admin/dashboard" element={<RequireAuth roles={['admin']}><AdminLayout><AdminDashboard /></AdminLayout></RequireAuth>} />
      <Route path="/admin/projects" element={<RequireAuth roles={['admin']}><AdminLayout><AdminProjects /></AdminLayout></RequireAuth>} />
      <Route path="/admin/reviews" element={<RequireAuth roles={['admin']}><AdminLayout><AdminReviews /></AdminLayout></RequireAuth>} />
      <Route path="/admin/users" element={<RequireAuth roles={['admin']}><AdminLayout><AdminUsers /></AdminLayout></RequireAuth>} />
      <Route path="/admin/settings" element={<RequireAuth roles={['admin']}><AdminLayout><AdminSettings /></AdminLayout></RequireAuth>} />
      <Route path="/manager/dashboard" element={<RequireAuth roles={['manager']}><ManagerLayout><ManagerDashboard /></ManagerLayout></RequireAuth>} />
      <Route path="/worker/dashboard" element={<RequireAuth roles={['worker']}><WorkerLayout><WorkerDashboard /></WorkerLayout></RequireAuth>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App({ brand }) {
  return (
    <BrowserRouter>
      <CssBaseline />
      <AppNav brand={brand} />
      <MainLayout>
        <Container maxWidth={false} disableGutters sx={{ mt: 2, px: { xs: 2, md: 3 } }}>
          <AppRoutes />
        </Container>
      </MainLayout>
    </BrowserRouter>
  )
}

function ThemedRoot() {
  const { brandConfig } = useBrandConfig()
  const primary = brandConfig?.primaryColor || '#1976d2'
  const secondary = brandConfig?.secondaryColor || '#6b7280'
  const theme = React.useMemo(() => responsiveFontSizes(createTheme({
    palette: { primary: { main: primary }, secondary: { main: secondary } }
  })), [primary, secondary])

  return (
    <ThemeProvider theme={theme}>
      <App brand={brandConfig} />
    </ThemeProvider>
  )
}

createRoot(document.getElementById('root')).render(<ThemedRoot />)
