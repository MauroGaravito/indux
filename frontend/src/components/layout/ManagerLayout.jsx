import React from 'react'
import { Outlet } from 'react-router-dom'
import { Box, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import ManagerSidebar from './ManagerSidebar.jsx'
import ManagerHeader from './ManagerHeader.jsx'

const DRAWER_WIDTH = 260

export default function ManagerLayout() {
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const handleToggleSidebar = () => setMobileOpen((prev) => !prev)
  const handleCloseSidebar = () => setMobileOpen(false)

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <ManagerSidebar
          drawerWidth={DRAWER_WIDTH}
          variant={isDesktop ? 'permanent' : 'temporary'}
          open={isDesktop ? true : mobileOpen}
          onClose={handleCloseSidebar}
        />
      </Box>
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <ManagerHeader onMenuClick={!isDesktop ? handleToggleSidebar : undefined} />
        <Box sx={{ flexGrow: 1, px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
