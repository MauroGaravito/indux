import React, { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip
} from '@mui/material'
import api from '../utils/api.js'
import { notifyError, notifySuccess } from '../context/notificationStore.js'
import SubmissionReviewModal from '../components/review/SubmissionReviewModal.jsx'

const cardStyles = {
  borderRadius: 3,
  p: 3,
  bgcolor: '#fff',
  boxShadow: '0 8px 30px rgba(15, 23, 42, 0.03)'
}

const statusChipColor = (status) => {
  if (status === 'approved') return 'success'
  if (status === 'declined') return 'error'
  if (status === 'cancelled') return 'default'
  return 'warning'
}

const formatDate = (value) => (value ? new Date(value).toLocaleString() : '—')

export default function ReviewQueue() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    loadSubmissions()
  }, [])

  const loadSubmissions = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/submissions', { params: { status: 'pending' } })
      setItems(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to load submissions'
      setError(msg)
      notifyError(msg)
    } finally {
      setLoading(false)
    }
  }

  const openModal = async (submission) => {
    setModalOpen(true)
    setModalLoading(true)
    setSelected(null)
    try {
      const projectId = typeof submission?.projectId === 'object'
        ? submission?.projectId?._id
        : submission?.projectId
      let projectData = null
      let fields = []
      if (projectId) {
        const projectRes = await api.get(`/projects/${projectId}`)
        projectData = projectRes.data
        const personalFields = projectData?.config?.personalDetails?.fields
        fields = Array.isArray(personalFields) ? personalFields : []
      }
      setSelected({
        submission,
        project: projectData,
        fields
      })
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to load submission detail'
      notifyError(msg)
      setSelected({ submission, project: null, fields: [] })
    } finally {
      setModalLoading(false)
    }
  }

  const closeModal = () => {
    setModalOpen(false)
  }

  const approveSubmission = async (id) => {
    if (!id) return
    try {
      await api.post(`/submissions/${id}/approve`)
      notifySuccess('Submission approved')
      closeModal()
      loadSubmissions()
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to approve submission'
      notifyError(msg)
    }
  }

  const declineSubmission = async (id) => {
    if (!id) return
    try {
      await api.post(`/submissions/${id}/decline`, {})
      notifySuccess('Submission declined')
      closeModal()
      loadSubmissions()
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to decline submission'
      notifyError(msg)
    }
  }

  const renderStatusChip = (status) => (
    <Chip size="small" label={status || 'pending'} color={statusChipColor(status)} />
  )

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 2, md: 3 } }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Submission Review Queue</Typography>
          <Typography color="text.secondary">
            Review pending worker submissions and take action.
          </Typography>
        </Box>

        <Card sx={cardStyles}>
          <Stack spacing={2}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Pending Submissions</Typography>
            {error && <Alert severity="error">{error}</Alert>}
            {loading ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <Typography color="text.secondary">Loading submissions…</Typography>
              </Box>
            ) : (
              <>
                {items.length ? (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Worker</TableCell>
                        <TableCell>Project</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Submitted</TableCell>
                        <TableCell align="right">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.map((submission) => {
                        const worker = submission?.userId || submission?.user || {}
                        const workerName = worker?.name || submission?.workerName || '—'
                        const workerEmail = worker?.email || submission?.workerEmail || ''
                        const project = submission?.projectId
                        const projectName = typeof project === 'object' ? (project?.name || '—') : (submission?.projectName || project || '—')
                        return (
                          <TableRow key={submission?._id || submission?.id}>
                            <TableCell>
                              <Stack spacing={0.3}>
                                <Typography sx={{ fontWeight: 600 }}>{workerName}</Typography>
                                {workerEmail && <Typography variant="body2" color="text.secondary">{workerEmail}</Typography>}
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Typography>{projectName}</Typography>
                            </TableCell>
                            <TableCell>{renderStatusChip(submission?.status)}</TableCell>
                            <TableCell>{formatDate(submission?.createdAt)}</TableCell>
                            <TableCell align="right">
                              <Button variant="outlined" size="small" onClick={() => openModal(submission)}>
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">No pending submissions.</Typography>
                  </Box>
                )}
              </>
            )}
          </Stack>
        </Card>
      </Stack>

      <SubmissionReviewModal
        open={modalOpen}
        onClose={closeModal}
        loading={modalLoading}
        data={selected}
        onApprove={() => approveSubmission(selected?.submission?._id)}
        onDecline={() => declineSubmission(selected?.submission?._id)}
      />
    </Box>
  )
}
