import React, { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Button,
  Paper,
  Stack,
  Typography,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box
} from '@mui/material'
import api from '../utils/api.js'
import AsyncButton from '../components/AsyncButton.jsx'
import { useAuthStore } from '../store/auth.js'
import { StatusChip, SubmissionDetails, ModuleReviewDetails } from '../components/review/ReviewDetails.jsx'

export default function ReviewQueue() {
  const { user } = useAuthStore()
  const [tab, setTab] = useState(0)
  const [modules, setModules] = useState([]) // [{ project, module }]
  const [submissions, setSubmissions] = useState([])
  const [reviews, setReviews] = useState([])
  const [viewOpen, setViewOpen] = useState(false)
  const [viewTitle, setViewTitle] = useState('')
  const [viewMode, setViewMode] = useState('json')
  const [viewJson, setViewJson] = useState(null)
  const [declineOpen, setDeclineOpen] = useState(false)
  const [declineTarget, setDeclineTarget] = useState(null)
  const [declineKind, setDeclineKind] = useState('submission')
  const [declineReason, setDeclineReason] = useState('Not adequate')

  const isAdmin = user?.role === 'admin'
  const isManager = user?.role === 'manager'

  const managedProjectIds = useMemo(() => {
    const ids = new Set()
    modules.forEach((entry) => {
      const projectId = entry?.project?._id || entry?.project
      if (projectId) ids.add(String(projectId))
    })
    return ids
  }, [modules])

  const canManageSubmission = (submission) => {
    if (isAdmin) return true
    if (!isManager) return false
    const projectId = submission?.project?._id || submission?.projectId || submission?.project
    if (!projectId) return false
    return managedProjectIds.has(String(projectId))
  }

  const loadContext = async () => {
    const projResp = await api.get('/projects')
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
        // no modules for this project
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
    const mods = await loadContext()
    await Promise.all([loadSubmissions(mods), loadReviews(mods)])
  }

  useEffect(() => { if (user) loadAll() }, [user])

  if (!user) return <Alert severity="info">Please sign in as a manager or admin.</Alert>
  if (!['manager', 'admin'].includes(user.role)) return <Alert severity="warning">Managers or admins only.</Alert>

  const openView = (mode, title, data) => {
    setViewMode(mode)
    setViewTitle(title)
    setViewJson(data)
    setViewOpen(true)
  }
  const closeView = () => setViewOpen(false)
  const openDecline = (kind, target, defaultReason = 'Not adequate') => {
    setDeclineKind(kind)
    setDeclineTarget(target)
    setDeclineReason(defaultReason)
    setDeclineOpen(true)
  }
  const closeDecline = () => {
    setDeclineOpen(false)
    setDeclineTarget(null)
  }

  const approveSubmission = async (submission) => {
    if (!submission || !canManageSubmission(submission)) return
    await api.post(`/submissions/${submission._id}/approve`)
    await loadAll()
  }
  const declineSubmission = async (submission) => {
    if (!submission || !canManageSubmission(submission)) {
      closeDecline()
      return
    }
    await api.post(`/submissions/${submission._id}/decline`, { reason: declineReason })
    closeDecline()
    await loadAll()
  }
  const approveReview = async (rev) => {
    if (!isAdmin) return
    await api.post(`/modules/${rev.moduleId}/reviews/${rev._id}/approve`)
    await loadAll()
  }
  const declineReview = async (rev) => {
    if (!isAdmin) return
    await api.post(`/modules/${rev.moduleId}/reviews/${rev._id}/decline`, { reason: declineReason })
    closeDecline()
    await loadAll()
  }

  const handleDeclineConfirm = async () => {
    if (declineKind === 'submission' && declineTarget) {
      await declineSubmission(declineTarget)
      return
    }
    if (declineKind === 'review' && declineTarget) {
      await declineReview(declineTarget)
      return
    }
    closeDecline()
  }







  return (
    <Stack spacing={2}>
      <Typography variant="h5">Pending Approvals</Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)}>
        <Tab label="Submission Reviews" />
        <Tab label="Induction Module Review Requests" />
      </Tabs>

      {tab === 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Pending submission reviews</Typography>
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
                    <TableCell>{new Date(s.createdAt || s._createdAt || Date.now()).toLocaleString()}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button size="small" onClick={() => openView('submission', 'Submission details', s)}>Open details</Button>
                        {canAct && (<AsyncButton size="small" color="success" variant="contained" onClick={() => approveSubmission(s)}>Approve submission</AsyncButton>)}
                        {canAct && (<Button size="small" color="error" onClick={() => openDecline('submission', s)}>Decline submission</Button>)}
                      </Stack>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          {!submissions.length && <Alert severity="info" sx={{ mt: 2 }}>No pending submission reviews to action.</Alert>}
        </Paper>
      )}

      {tab === 1 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Induction module review requests</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Project</TableCell>
                <TableCell>Module</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Requested By</TableCell>
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
                      <Button size="small" onClick={() => openView('moduleReview', 'Induction module review snapshot', r)}>Open snapshot</Button>
                      {isAdmin && (<AsyncButton size="small" color="success" variant="contained" onClick={() => approveReview(r)}>Approve induction module</AsyncButton>)}
                      {isAdmin && (<Button size="small" color="error" onClick={() => openDecline('review', r, 'Not adequate')}>Decline induction module</Button>)}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!reviews.length && <Alert severity="info" sx={{ mt: 2 }}>No induction module review requests at the moment.</Alert>}
          {!isAdmin && <Alert severity="info" sx={{ mt: 2 }}>Only admins can approve or decline induction module reviews.</Alert>}
        </Paper>
      )}

      <Dialog open={viewOpen} onClose={closeView} maxWidth="md" fullWidth>
        <DialogTitle>{viewTitle}</DialogTitle>
        <DialogContent>
          {viewMode === 'moduleReview' && <ModuleReviewDetails review={viewJson} />}
          {viewMode === 'submission' && <SubmissionDetails submission={viewJson} />}
          {viewMode !== 'moduleReview' && viewMode !== 'submission' && (
            <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(viewJson, null, 2)}</pre>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeView}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={declineOpen} onClose={closeDecline}>
        <DialogTitle>Decline request</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Reason for decline" value={declineReason} onChange={(e) => setDeclineReason(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDecline}>Cancel</Button>
          <AsyncButton
            color="error"
            onClick={handleDeclineConfirm}
          >
            Confirm decline
          </AsyncButton>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
