import React, { useEffect, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography
} from '@mui/material'
import api from '../../utils/api.js'
import { presignGet } from '../../utils/upload.js'

export default function WorkerHistory() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/workers/me/submissions')
      setHistory(data?.submissions || [])
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to load submissions')
      setHistory([])
    } finally {
      setLoading(false)
    }
  }

  const submissionStatusChip = (status) => {
    const color = status === 'approved' ? 'success' : status === 'pending' ? 'warning' : 'error'
    const label = status.charAt(0).toUpperCase() + status.slice(1)
    return { color, label }
  }

  const downloadCertificate = async (key) => {
    if (!key) return
    try {
      const { url } = await presignGet(key)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch {
      setError('Could not download certificate')
    }
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>History & Certificates</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {loading && <Alert severity="info">Loading history...</Alert>}
      {!loading && !history.length && (
        <Alert severity="info">You have no submissions yet.</Alert>
      )}
      <Stack spacing={2}>
        {history.map((sub) => {
          const chip = submissionStatusChip(sub.status)
          const created = new Date(sub.createdAt).toLocaleString()
          const projectName = sub.project?.name || 'Unknown project'
          const projectAddress = sub.project?.address
          return (
            <Card key={sub.id} variant="outlined">
              <CardContent>
                <Stack spacing={1}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{projectName}</Typography>
                    <Chip size="small" label={chip.label} color={chip.color} />
                  </Stack>
                  {projectAddress && <Typography variant="body2" color="text.secondary">{projectAddress}</Typography>}
                  <Typography variant="body2" color="text.secondary">Module: {sub.moduleId}</Typography>
                  <Typography variant="caption" color="text.secondary">Submitted: {created}</Typography>
                  {sub.certificateKey && (
                    <Button variant="outlined" size="small" sx={{ alignSelf: 'flex-start' }} onClick={() => downloadCertificate(sub.certificateKey)}>
                      Download Certificate
                    </Button>
                  )}
                </Stack>
              </CardContent>
            </Card>
          )
        })}
      </Stack>
    </Stack>
  )
}
