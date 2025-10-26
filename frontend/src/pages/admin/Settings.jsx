import React from 'react'
import { Card, CardContent, Typography, TextField, Stack, Button, Alert } from '@mui/material'

export default function Settings() {
  return (
    <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Settings</Typography>
        <Alert severity="info" sx={{ mb: 2 }}>SMTP, branding, and integrations can be configured here. Placeholder only.</Alert>
        <Stack spacing={2} sx={{ maxWidth: 480 }}>
          <TextField label="SMTP Host" placeholder="mail.example.com" />
          <TextField label="SMTP Port" placeholder="587" />
          <TextField label="SMTP User" placeholder="apikey" />
          <TextField label="SMTP Password" placeholder="********" type="password" />
          <Button variant="contained" disabled>Save (Coming Soon)</Button>
        </Stack>
      </CardContent>
    </Card>
  )
}

