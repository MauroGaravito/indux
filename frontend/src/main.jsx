import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import { CssBaseline, AppBar, Toolbar, Typography, Container, Button, Box } from '@mui/material'
import { ThemeProvider, createTheme, responsiveFontSizes } from '@mui/material/styles'
import useBrandConfig from './hooks/useBrandConfig.js'
import Login from './pages/Login.jsx'
import './setupAxiosNotifications'
import Landing from './pages/Landing.jsx'
import InductionWizard from './pages/InductionWizard.jsx'
import ReviewQueue from './pages/ReviewQueue.jsx'
import SlidesViewer from './pages/SlidesViewer.jsx'
import DashboardLayout from './layouts/DashboardLayout.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminProjects from './pages/admin/Projects.jsx'
import AdminReviews from './pages/admin/Reviews.jsx'
import AdminUsers from './pages/admin/Users.jsx'
import AdminSettings from './pages/admin/Settings.jsx'
import ModuleEditor from './pages/admin/ModuleEditor.jsx'
import ManagerDashboard from './pages/manager/ManagerDashboard.jsx'
import ManagerProjects from './pages/manager/ManagerProjects.jsx'
import ManagerProjectDetail from './pages/manager/ManagerProjectDetail.jsx'
import ManagerModuleEditor from './pages/manager/ManagerModuleEditor.jsx'
import ManagerTeam from './pages/manager/ManagerTeam.jsx'
import WorkerDashboard from './pages/worker/WorkerDashboard.jsx'
import { useAuthStore } from './store/auth.js'

function Nav({ brand }) {
  const { user, logout } = useAuthStore()
  const dashboardPath = user?.role === 'admin'
    ? '/admin'
    : user?.role === 'manager'
      ? '/manager'
      : user
        ? '/worker/dashboard'
        : '/login'
  const brandName = brand?.companyName || 'Indux'
  const logoUrl = brand?.logoUrl || ''
  return (
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
          {logoUrl ? (
            <Box
              component="img"
              src={logoUrl}
              alt={brandName}
              onError={(e) => { e.currentTarget.style.display = 'none' }}
              sx={{ height: 28, width: 'auto', borderRadius: 0.5, bgcolor: 'rgba(255,255,255,0.12)' }}
            />
          ) : null}
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{brandName}</Typography>
        </Box>
        <Button color="inherit" component={Link} to="/">Home</Button>
        <Button color="inherit" component={Link} to={dashboardPath}>Dashboard</Button>
        {user?.role !== 'worker' && (
          <Button color="inherit" component={Link} to="/review">Review</Button>
        )}
        {user?.role === 'admin' && (
          <Button color="inherit" component={Link} to="/admin">Admin</Button>
        )}
        {user ? (
          <Button color="inherit" onClick={logout}>Logout</Button>
        ) : (
          <Button color="inherit" component={Link} to="/login">Login</Button>
        )}
      </Toolbar>
    </AppBar>
  )
}

function App({ brand }) {
  return (
    <BrowserRouter>
      <Nav brand={brand} />
      <Container maxWidth={false} disableGutters sx={{ mt: 2, px: { xs: 2, md: 3 } }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/wizard" element={<AuthGuard><WithLayout><InductionWizard /></WithLayout></AuthGuard>} />
          <Route path="/login" element={<Login />} />
          <Route path="/review" element={<AuthGuard><WithLayout><ReviewQueue /></WithLayout></AuthGuard>} />
          <Route path="/slides-viewer" element={<SlidesViewer />} />
          <Route path="/admin" element={<AdminGuard><DashboardLayout /></AdminGuard>}>
            <Route index element={<AdminDashboard />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="projects/:projectId" element={<AdminProjects />} />
            <Route path="projects/:projectId/modules/induction/:moduleId" element={<ModuleEditor />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
          <Route path="/manager" element={<ManagerGuard><DashboardLayout /></ManagerGuard>}>
            <Route index element={<ManagerDashboard />} />
            <Route path="projects" element={<ManagerProjects />} />
            <Route path="projects/:projectId" element={<ManagerProjectDetail />} />
            <Route path="projects/:projectId/module/:moduleId" element={<ManagerModuleEditor />} />
            <Route path="projects/:projectId/team" element={<ManagerTeam />} />
          </Route>
          <Route path="/worker" element={<WorkerGuard><DashboardLayout /></WorkerGuard>}>
            <Route index element={<Navigate to="/worker/dashboard" replace />} />
            <Route path="dashboard" element={<WorkerDashboard />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
    </BrowserRouter>
  )
}

function AdminGuard({ children }) {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/" replace />
  return children
}

function ManagerGuard({ children }) {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'manager') return <Navigate to="/" replace />
  return children
}

function WorkerGuard({ children }) {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'worker') return <Navigate to="/" replace />
  return children
}

function AuthGuard({ children }) {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" replace />
  return children
}

const WithLayout = ({ children }) => <DashboardLayout>{children}</DashboardLayout>

function ThemedRoot() {
  const { brandConfig } = useBrandConfig()
  const primary = brandConfig?.primaryColor || '#1976d2'
  const secondary = brandConfig?.secondaryColor || '#6b7280'
  const theme = React.useMemo(() => responsiveFontSizes(createTheme({
    palette: { primary: { main: primary }, secondary: { main: secondary } }
  })), [primary, secondary])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App brand={brandConfig} />
    </ThemeProvider>
  )
}

createRoot(document.getElementById('root')).render(<ThemedRoot />)
