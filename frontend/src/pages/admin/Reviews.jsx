import React, { useEffect, useState } from 'react'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import api from '../../utils/api.js'
import AsyncButton from '../../components/AsyncButton.jsx'
import { useAuthStore } from '../../store/auth.js'
import { ModuleReviewDetails, StatusChip } from '../../components/review/ReviewDetails.jsx'

export default function ModuleReviews() {
  const { user } = useAuthStore()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [viewOpen, setViewOpen] = useState(false)
  const [viewReview, setViewReview] = useState(null)
  const [declineOpen, setDeclineOpen] = useState(false)
  const [declineTarget, setDeclineTarget] = useState(null)
  const [declineReason, setDeclineReason] = useState('Not adequate')

  const isAdmin = user?.role === 'admin'

  const loadContext = async () => {
    const projResp = await api.get('/projects', { params: { includeArchived: true } })
    const loadedModules = []
    for (const p of projResp.data || []) {
      try {
        const r = await api.get(`/projects/${p._id}/modules/induction`)
        const list = Array.isArray(r.data?.modules) ? r.data.modules : []
        list.forEach((mod) => {
          if (mod?._id) {
            loadedModules.push({ project: p, module: mod })
          }
        })
      } catch (_) {}
    }
    return loadedModules
  }

  const loadReviews = async (mods) => {
    const list = []
    for (const m of mods) {
      if (!m?.module?._id) continue
      try {
        const r = await api.get(`/modules/${m.module._id}/reviews`)
        const enriched = (r.data || []).map((rev) => ({ ...rev, project: m.project, module: m.module }))
        list.push(...enriched)
      } catch (_) {}
    }
    setReviews(list)
  }

  const loadAll = async () => {
    setLoading(true)
    setError('')
    try {
      const mods = await loadContext()
      await loadReviews(mods)
    } catch (e) {
      setError(e?.response?.data?.error || 'Unable to load module review requests.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (user) loadAll() }, [user])

  const openView = (rev) => {
    setViewReview(rev)
    setViewOpen(true)
  }
  const closeView = () => setViewOpen(false)
  const openDecline = (rev) => {
    setDeclineTarget(rev)
    setDeclineReason('Not adequate')
    setDeclineOpen(true)
  }
  const closeDecline = () => setDeclineOpen(false)

  const approveReview = async (rev) => {
    if (!rev || !isAdmin) return
    await api.post(`/modules/${rev.moduleId}/reviews/${rev._id}/approve`)
    await loadAll()
  }

  const declineReview = async () => {
    if (!declineTarget || !isAdmin) {
      closeDecline()
      return
    }
    await api.post(`/modules/${declineTarget.moduleId}/reviews/${declineTarget._id}/decline`, { reason: declineReason })
    closeDecline()
    await loadAll()
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>Module Reviews</Typography>
      <Typography variant="body2" color="text.secondary">
        Approve or decline structural changes to induction modules and templates.
      </Typography>

      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
      {loading && <Alert severity="info">Refreshing review queue...</Alert>}

      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>Pending module review requests</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Project</TableCell>
              <TableCell>Module</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Requested by</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reviews.map((r) => (
              <TableRow key={r._id}>
                <TableCell>{r.project?.name || ''}</TableCell>
                <TableCell>{r.module?.name || r.type}</TableCell>
                <TableCell><StatusChip status={r.status} /></TableCell>
                <TableCell>{r.requestedBy}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button size="small" onClick={() => openView(r)}>Open snapshot</Button>
                    {isAdmin && (
                      <AsyncButton size="small" color="success" variant="contained" onClick={() => approveReview(r)}>
                        Approve module
                      </AsyncButton>
                    )}
                    {isAdmin && (
                      <Button size="small" color="error" onClick={() => openDecline(r)}>
                        Decline module
                      </Button>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!reviews.length && <Alert severity="info" sx={{ mt: 2 }}>No module review requests at the moment.</Alert>}
        {!isAdmin && <Alert severity="info" sx={{ mt: 2 }}>Only admins can approve or decline module reviews.</Alert>}
      </Paper>

      <Dialog open={viewOpen} onClose={closeView} maxWidth="md" fullWidth>
        <DialogTitle>Module review snapshot</DialogTitle>
        <DialogContent>
          <ModuleReviewDetails review={viewReview} />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeView}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={declineOpen} onClose={closeDecline}>
        <DialogTitle>Decline module review</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Reason"
            value={declineReason}
            multiline
            onChange={(e) => setDeclineReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDecline}>Cancel</Button>
          <AsyncButton color="error" onClick={declineReview}>
            Confirm decline
          </AsyncButton>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
