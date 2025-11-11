import React from 'react'
import { useLocation } from 'react-router-dom'
import { Stack, Typography, Alert, Button } from '@mui/material'
import api from '../utils/api.js'

export default function Pending() {
  const location = useLocation()
  const reason = location?.state?.reason || 'Your account is pending approval.'
  const [resent, setResent] = React.useState(false)

  const resend = async () => {
    try {
      const email = new URLSearchParams(window.location.search).get('email')
      if (!email) return
      await api.post('/auth/resend-verification', { email })
      setResent(true)
    } catch {}
  }

  return (
    <Stack spacing={2} maxWidth={520}>
      <Typography variant="h5">Account Pending</Typography>
      <Alert severity="info">{reason}</Alert>
      <Typography variant="body2">If you have not verified your email, please check your inbox. You can ask an admin to approve your account once verified.</Typography>
      {!resent && <Button onClick={resend}>Resend verification email</Button>}
      {resent && <Alert severity="success">Verification email sent.</Alert>}
    </Stack>
  )
}

