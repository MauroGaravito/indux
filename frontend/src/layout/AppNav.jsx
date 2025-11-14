import React from 'react'
import { Link } from 'react-router-dom'
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material'
import { useAuthStore } from '../context/authStore.js'
import logo from '../assets/indux-logo.png'

export default function AppNav({ brand }) {
  const { user, logout } = useAuthStore()
  const dashboardPath =
    user?.role === 'admin'
      ? '/admin/dashboard'
      : user?.role === 'manager'
        ? '/manager/dashboard'
        : user
          ? '/worker/dashboard'
          : '/login'
  const reviewPath = user?.role === 'admin' ? '/admin/review' : '/manager/review'
  const brandName = brand?.companyName || 'Indux'
  const logoUrl = brand?.logoUrl || ''

  return (
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
          <img src={logo} alt="Indux Logo" style={{ height: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>INDUX</Typography>
        </Box>
        <Button color="inherit" component={Link} to="/">Home</Button>
        {user && <Button color="inherit" component={Link} to={dashboardPath}>Dashboard</Button>}
        {user?.role !== 'worker' && user && (
          <Button color="inherit" component={Link} to={reviewPath}>Review</Button>
        )}
        {user?.role === 'admin' && (
          <Button color="inherit" component={Link} to="/admin/dashboard">Admin</Button>
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
