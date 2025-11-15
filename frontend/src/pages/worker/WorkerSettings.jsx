import React, { useMemo, useState } from 'react'
import {
  Box,
  Button,
  Card,
  Divider,
  FormControlLabel,
  Grid,
  Stack,
  Switch,
  TextField,
  Typography
} from '@mui/material'
import { useAuthStore } from '../../context/authStore.js'
import { notifySuccess } from '../../context/notificationStore.js'

const cardStyles = {
  borderRadius: 3,
  p: 3,
  bgcolor: '#fff',
  boxShadow: '0 8px 30px rgba(15, 23, 42, 0.03)'
}

export default function WorkerSettings() {
  const { user } = useAuthStore()
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  })
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [notifications, setNotifications] = useState({
    submissions: true,
    reminders: true
  })

  const canUpdatePassword = useMemo(() => (
    security.currentPassword &&
    security.newPassword &&
    security.newPassword === security.confirmPassword
  ), [security])

  const handleProfileChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  const handleSecurityChange = (field, value) => {
    setSecurity((prev) => ({ ...prev, [field]: value }))
  }

  const handleNotificationChange = (field, value) => {
    setNotifications((prev) => ({ ...prev, [field]: value }))
  }

  const saveProfile = () => {
    // TODO: requires backend endpoint to update worker profile
    notifySuccess('Profile preferences saved')
  }

  const updatePassword = () => {
    // TODO: requires backend endpoint to update worker password
    notifySuccess('Password updated')
    setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' })
  }

  const saveNotifications = () => {
    notifySuccess('Notification preferences updated')
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>Worker Settings</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Keep your profile accurate and control how you receive induction updates.
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={cardStyles}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Profile Information</Typography>
            <Stack spacing={2}>
              <TextField label="Full Name" value={profile.name} onChange={(e) => handleProfileChange('name', e.target.value)} fullWidth />
              <TextField label="Email" type="email" value={profile.email} onChange={(e) => handleProfileChange('email', e.target.value)} helperText="Used for account communications" fullWidth />
              <TextField label="Phone" value={profile.phone} onChange={(e) => handleProfileChange('phone', e.target.value)} fullWidth />
            </Stack>
            <Divider sx={{ my: 3 }} />
            <Stack direction="row" justifyContent="flex-end">
              <Button variant="contained" sx={{ textTransform: 'none' }} onClick={saveProfile}>Save Profile</Button>
            </Stack>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={cardStyles}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Security</Typography>
            <Stack spacing={2}>
              <TextField label="Current Password" type="password" value={security.currentPassword} onChange={(e) => handleSecurityChange('currentPassword', e.target.value)} fullWidth />
              <TextField label="New Password" type="password" value={security.newPassword} onChange={(e) => handleSecurityChange('newPassword', e.target.value)} fullWidth />
              <TextField
                label="Confirm New Password"
                type="password"
                value={security.confirmPassword}
                onChange={(e) => handleSecurityChange('confirmPassword', e.target.value)}
                error={security.confirmPassword.length > 0 && security.newPassword !== security.confirmPassword}
                helperText={security.confirmPassword && security.newPassword !== security.confirmPassword ? 'Passwords do not match' : ''}
                fullWidth
              />
            </Stack>
            <Divider sx={{ my: 3 }} />
            <Stack direction="row" justifyContent="flex-end">
              <Button variant="contained" sx={{ textTransform: 'none' }} disabled={!canUpdatePassword} onClick={updatePassword}>
                Update Password
              </Button>
            </Stack>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card sx={cardStyles}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Notifications</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Choose which reminders you'd like to receive.
            </Typography>
            <Stack spacing={1.5}>
              <FormControlLabel
                control={(
                  <Switch checked={notifications.submissions} onChange={(e) => handleNotificationChange('submissions', e.target.checked)} />
                )}
                label="Notify me when my submissions change status"
              />
              <FormControlLabel
                control={(
                  <Switch checked={notifications.reminders} onChange={(e) => handleNotificationChange('reminders', e.target.checked)} />
                )}
                label="Send reminders before inductions are due"
              />
            </Stack>
            <Divider sx={{ my: 3 }} />
            <Stack direction="row" justifyContent="flex-end">
              <Button variant="contained" sx={{ textTransform: 'none' }} onClick={saveNotifications}>Save Preferences</Button>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

