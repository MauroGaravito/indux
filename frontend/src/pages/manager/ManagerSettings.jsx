import React, { useMemo, useState } from 'react'
import {
  Box,
  Grid,
  Card,
  Typography,
  Stack,
  TextField,
  Divider,
  Button,
  Switch,
  FormControlLabel
} from '@mui/material'
import { useAuthStore } from '../../context/authStore.js'
import { notifySuccess } from '../../context/notificationStore.js'

const cardStyles = {
  borderRadius: 3,
  p: 3,
  bgcolor: '#fff',
  boxShadow: '0 8px 30px rgba(15, 23, 42, 0.03)'
}

export default function ManagerSettings() {
  const { user } = useAuthStore()
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    company: user?.company || ''
  })
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [notifications, setNotifications] = useState({
    submissions: true,
    reviews: true,
    digest: false
  })

  const canUpdatePassword = useMemo(() => (
    !!security.currentPassword &&
    !!security.newPassword &&
    security.newPassword === security.confirmPassword
  ), [security])

  const handleProfileChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  const handleSecurityChange = (field, value) => {
    setSecurity((prev) => ({ ...prev, [field]: value }))
  }

  const handleNotificationsChange = (field, value) => {
    setNotifications((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveProfile = () => {
    notifySuccess('Profile preferences saved')
  }

  const handleSaveSecurity = () => {
    notifySuccess('Password updated')
    setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' })
  }

  const handleSaveNotifications = () => {
    notifySuccess('Notification preferences updated')
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>Manager Settings</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Update your profile, security information, and communication preferences.
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={cardStyles}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Profile Information</Typography>
            <Stack spacing={2}>
              <TextField
                label="Full Name"
                value={profile.name}
                onChange={(e) => handleProfileChange('name', e.target.value)}
                fullWidth
              />
              <TextField
                label="Email"
                value={profile.email}
                onChange={(e) => handleProfileChange('email', e.target.value)}
                type="email"
                fullWidth
                helperText="Used for account communications"
              />
              <TextField
                label="Phone"
                value={profile.phone}
                onChange={(e) => handleProfileChange('phone', e.target.value)}
                fullWidth
              />
              <TextField
                label="Company / Project"
                value={profile.company}
                onChange={(e) => handleProfileChange('company', e.target.value)}
                fullWidth
              />
            </Stack>
            <Divider sx={{ my: 3 }} />
            <Stack direction="row" justifyContent="flex-end">
              <Button variant="contained" sx={{ textTransform: 'none' }} onClick={handleSaveProfile}>
                Save Profile
              </Button>
            </Stack>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={cardStyles}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Security</Typography>
            <Stack spacing={2}>
              <TextField
                label="Current Password"
                type="password"
                value={security.currentPassword}
                onChange={(e) => handleSecurityChange('currentPassword', e.target.value)}
                fullWidth
              />
              <TextField
                label="New Password"
                type="password"
                value={security.newPassword}
                onChange={(e) => handleSecurityChange('newPassword', e.target.value)}
                fullWidth
              />
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
              <Button
                variant="contained"
                sx={{ textTransform: 'none' }}
                disabled={!canUpdatePassword}
                onClick={handleSaveSecurity}
              >
                Update Password
              </Button>
            </Stack>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card sx={cardStyles}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Notifications</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Choose which updates you'd like to receive about projects and reviews.
            </Typography>
            <Stack spacing={1.5}>
              <FormControlLabel
                control={(
                  <Switch
                    checked={notifications.submissions}
                    onChange={(e) => handleNotificationsChange('submissions', e.target.checked)}
                  />
                )}
                label="Alert me when new submissions require review"
              />
              <FormControlLabel
                control={(
                  <Switch
                    checked={notifications.reviews}
                    onChange={(e) => handleNotificationsChange('reviews', e.target.checked)}
                  />
                )}
                label="Notify me when project reviews are updated"
              />
              <FormControlLabel
                control={(
                  <Switch
                    checked={notifications.digest}
                    onChange={(e) => handleNotificationsChange('digest', e.target.checked)}
                  />
                )}
                label="Send a weekly summary email"
              />
            </Stack>
            <Divider sx={{ my: 3 }} />
            <Stack direction="row" justifyContent="flex-end">
              <Button variant="contained" sx={{ textTransform: 'none' }} onClick={handleSaveNotifications}>
                Save Preferences
              </Button>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

