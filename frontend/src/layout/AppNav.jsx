import React from 'react'
import { Link } from 'react-router-dom'
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material'
import { useAuthStore } from '../context/authStore.js'

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
        {user && <Button color="inherit" component={Link} to={dashboardPath}>Dashboard</Button>}
        {user?.role !== 'worker' && user && (
          <Button color="inherit" component={Link} to="/review">Review</Button>
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