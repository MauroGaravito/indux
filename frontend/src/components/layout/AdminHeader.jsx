import React from 'react'
import { AppBar, Toolbar, Typography, IconButton, Button, Avatar, Stack, Box } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { useAuthStore } from '../../context/authStore.js'

export default function AdminHeader({ onMenuClick }) {
  const { user, logout } = useAuthStore()
  const displayName = user?.name || user?.email || 'Administrator'
  const displayEmail = user?.email || ''
  const initials = (user?.name || user?.email || 'IN').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()

  return (
    <AppBar
      position="static"
      color="transparent"
      elevation={0}
      sx={{
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper'
      }}
    >
      <Toolbar sx={{ minHeight: 72 }}>
        {onMenuClick && (
          <IconButton
            edge="start"
            color="inherit"
            onClick={onMenuClick}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
          Admin
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', width: 36, height: 36, fontSize: '0.9rem' }}>
            {initials}
          </Avatar>
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {displayName}
            </Typography>
            {displayEmail ? (
              <Typography variant="caption" color="text.secondary">
                {displayEmail}
              </Typography>
            ) : null}
          </Box>
          <Button variant="outlined" size="small" onClick={logout}>
            Logout
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  )
}
