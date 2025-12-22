import React, { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import api from '../../utils/api.js'
import AsyncButton from '../../components/AsyncButton.jsx'
import { useAuthStore } from '../../store/auth.js'
import { StatusChip, SubmissionDetails } from '../../components/review/ReviewDetails.jsx'

export default function WorkerSubmissions() {
  const { user } = useAuthStore()
  const [tab, setTab] = useState(0)
  const [modules, setModules] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [viewOpen, setViewOpen] = useState(false)
  const [viewSubmission, setViewSubmission] = useState(null)
  const [declineOpen, setDeclineOpen] = useState(false)
  const [declineTarget, setDeclineTarget] = useState(null)
  const [declineReason, setDeclineReason] = useState('Not adequate')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const managedProjectIds = useMemo(() => {
    const ids = new Set()
    modules.forEach((entry) => {
      const projectId = entry?.project?._id || entry?.project
      if (projectId) ids.add(String(projectId))
    })
    return ids
  }, [modules])

  const canManageSubmission = (submission) => {
    if (!submission) return false
    if (user?.role === 'admin') return true
    if (user?.role !== 'manager') return false
    const projectId = submission?.project?._id || submission?.projectId || submission?.project
    if (!projectId) return false
    return managedProjectIds.has(String(projectId))
  }

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
      } catch (_) {
        // ignore
      }
    }
    setModules(loadedModules)
    return loadedModules
  }

  const loadSubmissions = async (mods) => {
    const list = []
    for (const m of mods) {
      if (!m?.module?._id) continue
      try {
        const r = await api.get(`/modules/${m.module._id}/submissions`, { params: { status: 'pending' } })
        const enriched = (r.data || []).map((s) => ({ ...s, project: m.project, module: m.module }))
        list.push(...enriched)
      } catch (_) {}
    }
    setSubmissions(list)
  }

  const loadAll = async () => {
    setLoading(true)
    setError('')
    try {
      const mods = await loadContext()
      await loadSubmissions(mods)
    } catch (e) {
      setError(e?.response?.data?.error || 'Unable to load worker submissions.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (user) loadAll() }, [user])

  const openView = (submission) => {
    setViewSubmission(submission)
    setViewOpen(true)
  }
  const closeView = () => setViewOpen(false)

  const openDecline = (submission) => {
    setDeclineTarget(submission)
    setDeclineReason('Not adequate')
    setDeclineOpen(true)
  }
  const closeDecline = () => {
    setDeclineTarget(null)
    setDeclineOpen(false)
  }

  const approveSubmission = async (submission) => {
    if (!submission || !canManageSubmission(submission)) return
    await api.post(`/submissions/${submission._id}/approve`)
    await loadAll()
  }

  const declineSubmission = async () => {
    if (!declineTarget || !canManageSubmission(declineTarget)) {
      closeDecline()
      return
    }
    await api.post(`/submissions/${declineTarget._id}/decline`, { reason: declineReason })
    closeDecline()
    await loadAll()
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>Worker Submissions</Typography>
      <Typography variant="body2" color="text.secondary">
        Review submissions completed by workers, including induction completions and the upcoming inspection modules.
      </Typography>

      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
      {loading && <Alert severity="info">Refreshing pending submissions...</Alert>}

      <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Tab label="Inductions" />
        <Tab label="Exams" />
        <Tab label="Inspections" />
      </Tabs>

      {tab === 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Pending induction submissions</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Project</TableCell>
                <TableCell>Worker</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Submitted</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {submissions.map((s) => {
                const canAct = canManageSubmission(s)
                return (
                  <TableRow key={s._id}>
                    <TableCell>{s.project?.name || ''}</TableCell>
                    <TableCell>{s.userId?.name || s.userId?.email || ''}</TableCell>
                    <TableCell><StatusChip status={s.status} /></TableCell>
                    <TableCell>{new Date(s.createdAt || Date.now()).toLocaleString()}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button size="small" onClick={() => openView(s)}>Open details</Button>
                        {canAct && (
                          <AsyncButton size="small" color="success" variant="contained" onClick={() => approveSubmission(s)}>
                            Approve
                          </AsyncButton>
                        )}
                        {canAct && (
                          <Button size="small" color="error" onClick={() => openDecline(s)}>
                            Decline
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          {!submissions.length && <Alert severity="info" sx={{ mt: 2 }}>No induction submissions are waiting for review.</Alert>}
        </Paper>
      )}

      {tab === 1 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1">Exams</Typography>
          <Alert severity="info" sx={{ mt: 1 }}>Coming soon — exam submissions will appear here.</Alert>
        </Paper>
      )}

      {tab === 2 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1">Inspection modules</Typography>
          <Alert severity="info" sx={{ mt: 1 }}>Inspection modules are coming soon.</Alert>
        </Paper>
      )}

      <Dialog open={viewOpen} onClose={closeView} maxWidth="md" fullWidth>
        <DialogTitle>Submission details</DialogTitle>
        <DialogContent>
          <SubmissionDetails submission={viewSubmission} />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeView}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={declineOpen} onClose={closeDecline}>
        <DialogTitle>Decline submission</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Reason"
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            multiline
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDecline}>Cancel</Button>
          <AsyncButton color="error" onClick={declineSubmission}>
            Confirm decline
          </AsyncButton>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
