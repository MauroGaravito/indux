import React from 'react'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'

export default function AsyncButton({ onClick, children, disabled, ...props }) {
  const [loading, setLoading] = React.useState(false)

  const handleClick = async (e) => {
    if (!onClick) return
    try {
      setLoading(true)
      await onClick(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleClick} disabled={disabled || loading} {...props}>
      {loading && (
        <CircularProgress size={18} sx={{ mr: 1, color: 'inherit' }} />
      )}
      {children}
    </Button>
  )}

