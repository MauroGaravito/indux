import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import { CssBaseline, AppBar, Toolbar, Typography, Container, Button, Box } from '@mui/material'
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
import AdminLayout from './pages/admin/AdminLayout.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminProjects from './pages/admin/Projects.jsx'
import AdminReviews from './pages/admin/Reviews.jsx'
import AdminUsers from './pages/admin/Users.jsx'
import AdminSettings from './pages/admin/Settings.jsx'
import { useAuthStore } from './store/auth.js'

function Nav({ brand }) {
  const { user, logout } = useAuthStore()
  const dashboardPath = user?.role === 'admin' ? '/admin' : user?.role === 'manager' ? '/review' : user ? '/wizard' : '/login'
  const brandName = brand?.companyName || 'Indux'
  const logoUrl = brand?.logoUrl || ''
  return (
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
          {logoUrl ? (
            <Box component="img" src={logoUrl} alt={brandName} sx={{ height: 28, width: 'auto', borderRadius: 0.5, bgcolor: 'rgba(255,255,255,0.12)' }} />
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
        {!user && (
          <Button color="inherit" component={Link} to="/register">Register</Button>
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
      <CssBaseline />
      <Nav brand={brand} />
      <Container maxWidth={false} disableGutters sx={{ mt: 2, px: { xs: 2, md: 3 } }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/wizard" element={<InductionWizard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pending" element={<Pending />} />
          <Route path="/review" element={<ReviewQueue />} />
          <Route path="/slides-viewer" element={<SlidesViewer />} />
          <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
            <Route index element={<AdminDashboard />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="settings" element={<AdminSettings />} />
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
