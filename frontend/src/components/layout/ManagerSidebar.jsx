import React from 'react'
import { Drawer, Box, Toolbar, Typography, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material'
import DashboardIcon from '@mui/icons-material/SpaceDashboardOutlined'
import FolderIcon from '@mui/icons-material/FolderOutlined'
import RateReviewIcon from '@mui/icons-material/RateReviewOutlined'
import SettingsIcon from '@mui/icons-material/SettingsOutlined'
import { useTheme, alpha } from '@mui/material/styles'
import { useLocation, Link as RouterLink } from 'react-router-dom'

const drawerItems = [
  { label: 'Dashboard', to: '/manager/dashboard', icon: <DashboardIcon />, match: '/manager/dashboard' },
  { label: 'My Projects', to: '/manager/projects', icon: <FolderIcon />, match: '/manager/projects' },
  { label: 'Review', to: '/manager/review', icon: <RateReviewIcon />, match: '/manager/review' },
  { label: 'Settings', to: '/manager/settings', icon: <SettingsIcon />, match: '/manager/settings' }
]

export default function ManagerSidebar({ variant = 'permanent', open, onClose, drawerWidth = 260 }) {
  const theme = useTheme()
  const location = useLocation()

  const content = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ px: 3 }}>
        <Box>
          <Typography variant="subtitle2" color="text.secondary" sx={{ letterSpacing: '0.08em' }}>
            INDUX
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Manager Console
          </Typography>
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
              <ListItemIcon sx={{ color: isActive ? theme.palette.primary.main : 'text.secondary', minWidth: 40 }}>
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
