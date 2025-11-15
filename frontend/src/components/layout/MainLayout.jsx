import React from 'react'
import { Box } from '@mui/material'
import AppNav from '../../layout/AppNav.jsx'

export default function MainLayout({ children, brand, showNav = true }) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {showNav && <AppNav brand={brand} />}
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </Box>
    </Box>
  )
}
