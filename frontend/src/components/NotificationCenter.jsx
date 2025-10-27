import React from 'react'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import { useNotificationStore } from '../notifications/store'

const anchorOrigin = { vertical: 'bottom', horizontal: 'right' }

export default function NotificationCenter() {
  const { open, message, level, autoHideDuration, hide } = useNotificationStore()

  return (
    <Snackbar
      open={open}
      onClose={hide}
      autoHideDuration={autoHideDuration}
      anchorOrigin={anchorOrigin}
    >
      <Alert
        onClose={hide}
        severity={level}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  )
}

