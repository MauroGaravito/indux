import React from 'react'
import { Box, Container } from '@mui/material'

export default function LoginLayout({ children }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f6fa',
        px: 2
      }}
    >
      <Container maxWidth="xs">
        {children}
      </Container>
    </Box>
  )
}

