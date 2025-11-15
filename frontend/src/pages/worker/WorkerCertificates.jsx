import React, { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download'
import api from '../../utils/api.js'
import { useAuthStore } from '../../context/authStore.js'

const cardStyles = {
  borderRadius: 3,
  p: 3,
  bgcolor: '#fff',
  boxShadow: '0 8px 30px rgba(15, 23, 42, 0.03)'
}

export default function WorkerCertificates() {
  const { user } = useAuthStore()
  const userId = user?._id || user?.id
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submissions, setSubmissions] = useState([])

  useEffect(() => {
    let active = true
    async function load() {
      if (!userId) return
      setLoading(true)
      setError('')
      try {
        const res = await api.get('/submissions')
        if (!active) return
        const list = Array.isArray(res.data) ? res.data : []
        setSubmissions(list.filter((s) => s?.status === 'approved'))
      } catch (e) {
        if (active) setError(e?.response?.data?.message || 'Failed to load certificates')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [userId])

  const handleDownload = () => {
    // TODO: requires backend endpoint to provide downloadable certificate asset
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>My Certificates</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Certificates are issued once your inductions are approved. Download links will appear here when available.
      </Typography>
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {error && (
        <Card sx={{ ...cardStyles, mb: 3 }}>
          <Typography variant="body2" color="error.main">{error}</Typography>
        </Card>
      )}
      <Card sx={cardStyles}>
        {!submissions.length && !loading && (
          <Alert severity="info">No certificates available yet. Complete an induction to receive one.</Alert>
        )}
        {!!submissions.length && (
          <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Project</TableCell>
                  <TableCell>Approved On</TableCell>
                  <TableCell>Certificate</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {submissions.map((submission) => {
                  const project = typeof submission?.projectId === 'string' ? submission.projectId : submission?.projectId?.name || submission?.projectId?._id
                  return (
                    <TableRow key={submission._id}>
                      <TableCell>{project || 'Project'}</TableCell>
                      <TableCell>{submission?.updatedAt ? new Date(submission.updatedAt).toLocaleString() : '-'}</TableCell>
                      <TableCell>
                        {submission?.certificateKey ? (
                          <Button size="small" variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownload} sx={{ textTransform: 'none' }}>
                            Download
                          </Button>
                        ) : (
                          <>
                            <Chip size="small" label="Pending file" />
                            <Typography variant="caption" color="text.secondary" display="block">
                              {/* TODO: requires backend endpoint to attach certificate asset */}
                              Certificate will be available soon.
                            </Typography>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </Box>
        )}
      </Card>
    </Box>
  )
}
