import React from 'react'
import { AppBar, Toolbar, Typography, IconButton, Avatar, Button, Stack, Box } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { useAuthStore } from '../../context/authStore.js'

export default function ManagerHeader({ onMenuClick }) {
  const { user, logout } = useAuthStore()
  const displayName = user?.name || user?.email || 'Manager'
  const displayEmail = user?.email || ''
  const initials = (user?.name || user?.email || 'MA').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()

  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
      <Toolbar sx={{ minHeight: 72 }}>
        {onMenuClick && (
          <IconButton edge="start" color="inherit" onClick={onMenuClick} sx={{ mr: 2, display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>
        )}
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
          Manager
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', width: 36, height: 36 }}>
            {initials}
          </Avatar>
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{displayName}</Typography>
            {displayEmail ? <Typography variant="caption" color="text.secondary">{displayEmail}</Typography> : null}
          </Box>
          <Button variant="outlined" size="small" onClick={logout}>
            Logout
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  )
}
