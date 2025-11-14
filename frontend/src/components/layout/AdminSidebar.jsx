import React from 'react'
import { Drawer, Box, Toolbar, Typography, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material'
import DashboardIcon from '@mui/icons-material/SpaceDashboardOutlined'
import FolderIcon from '@mui/icons-material/FolderOutlined'
import RateReviewIcon from '@mui/icons-material/RateReviewOutlined'
import PeopleIcon from '@mui/icons-material/PeopleAltOutlined'
import SettingsIcon from '@mui/icons-material/SettingsOutlined'
import { useLocation, Link as RouterLink } from 'react-router-dom'
import { alpha, useTheme } from '@mui/material/styles'
import logo from '../../assets/indux-logo.PNG'

const drawerItems = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: <DashboardIcon />, match: '/admin/dashboard' },
  { label: 'Projects', to: '/admin/projects', icon: <FolderIcon />, match: '/admin/projects' },
  { label: 'Reviews', to: '/admin/review', icon: <RateReviewIcon />, match: '/admin/review' },
  { label: 'Users', to: '/admin/users', icon: <PeopleIcon />, match: '/admin/users' },
  { label: 'Settings', to: '/admin/settings', icon: <SettingsIcon />, match: '/admin/settings' }
]

export default function AdminSidebar({ variant = 'permanent', open, onClose, drawerWidth = 260 }) {
  const location = useLocation()
  const theme = useTheme()

  const content = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
      <Toolbar sx={{ px: 3 }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <img src={logo} alt="Indux" style={{ height: 32 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Indux</Typography>
        </Box>
      </Toolbar>
      <List sx={{ px: 1, flexGrow: 1 }}>
        {drawerItems.map((item) => {
          const isActive = location.pathname.startsWith(item.match)
          return (
            <ListItemButton
              key={item.to}
              component={RouterLink}
              to={item.to}
              selected={isActive}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                color: isActive ? theme.palette.primary.main : 'text.primary',
                '&.Mui-selected': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  color: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.15)
                  }
                }
              }}
              onClick={variant === 'temporary' ? onClose : undefined}
            >
              <ListItemIcon
                sx={{
                  color: isActive ? theme.palette.primary.main : 'text.secondary',
                  minWidth: 40
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          )
        })}
      </List>
      <Box sx={{ p: 3, borderTop: (theme) => `1px solid ${theme.palette.divider}` }}>
        <Typography variant="caption" color="text.secondary">
          © {new Date().getFullYear()} Indux
        </Typography>
      </Box>
    </Box>
  )

  return (
    <Drawer
      variant={variant}
      open={variant === 'permanent' ? true : open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        display: { xs: 'block', md: 'block' },
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          borderRight: (theme) => `1px solid ${theme.palette.divider}`,
          boxSizing: 'border-box'
        }
      }}
    >
      {content}
    </Drawer>
  )
}
