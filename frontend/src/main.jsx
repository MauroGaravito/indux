import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import { CssBaseline, AppBar, Toolbar, Typography, Container, Button } from '@mui/material'
import Login from './pages/Login.jsx'
import InductionWizard from './pages/InductionWizard.jsx'
import ReviewQueue from './pages/ReviewQueue.jsx'
import AdminConsole from './pages/AdminConsole.jsx'
import { useAuthStore } from './store/auth.js'

function Nav() {
  const { user, logout } = useAuthStore()
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>Indux</Typography>
        <Button color="inherit" component={Link} to="/">Home</Button>
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

function App() {
  return (
    <BrowserRouter>
      <CssBaseline />
      <Nav />
      <Container sx={{ mt: 2 }}>
        <Routes>
          <Route path="/" element={<InductionWizard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/review" element={<ReviewQueue />} />
          <Route path="/admin" element={<AdminConsole />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(<App />)

