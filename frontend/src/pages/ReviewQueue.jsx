import React, { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Button,
  Paper,
  Stack,
  Typography,
  Tabs,
  Tab,
  Chip,
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
  Divider,
  Box
} from '@mui/material'
import api from '../utils/api.js'
import AsyncButton from '../components/AsyncButton.jsx'
import { useAuthStore } from '../store/auth.js'

function StatusChip({ status }) {
  const color = status === 'approved' ? 'success' : status === 'declined' ? 'error' : 'default'
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Pending'
  return <Chip size="small" color={color} label={label} />
}

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
        <Tab label="Module Review Requests" />
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
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Module review requests</Typography>
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
                      <Button size="small" onClick={() => openView('moduleReview', 'Module review snapshot', r)}>Open snapshot</Button>
                      {isAdmin && (<AsyncButton size="small" color="success" variant="contained" onClick={() => approveReview(r)}>Approve module</AsyncButton>)}
                      {isAdmin && (<Button size="small" color="error" onClick={() => openDecline('review', r, 'Not adequate')}>Decline module</Button>)}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!reviews.length && <Alert severity="info" sx={{ mt: 2 }}>No module review requests at the moment.</Alert>}
          {!isAdmin && <Alert severity="info" sx={{ mt: 2 }}>Only admins can approve or decline module reviews.</Alert>}
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

function InfoRow({ label, value }) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 140 }}>{label}</Typography>
      <Typography variant="body2" color="text.secondary">{value || '—'}</Typography>
    </Stack>
  )
}

function SubmissionDetails({ submission }) {
  if (!submission) return null
  const worker = submission.userId?.name || submission.userId?.email || submission.userId || 'Unknown worker'
  const submitted = submission.createdAt ? new Date(submission.createdAt).toLocaleString() : 'Not recorded'
  const quiz = submission.quiz || {}
  const answers = Array.isArray(quiz.answers) ? quiz.answers : []
  const payloadEntries = Object.entries(submission.payload || {})

  return (
    <Stack spacing={2}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', fontWeight: 600, mb: 1 }}>Submission summary</Typography>
        <Stack spacing={1}>
          <InfoRow label="Project" value={submission.project?.name || ''} />
          <InfoRow label="Worker name" value={worker} />
          <InfoRow label="Status" value={submission.status} />
          <InfoRow label="Submitted on" value={submitted} />
        </Stack>
      </Paper>
      {!!payloadEntries.length && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', fontWeight: 600, mb: 1 }}>Personal details</Typography>
          <Stack spacing={1}>
            {payloadEntries.map(([key, value]) => (
              <InfoRow key={key} label={key} value={typeof value === 'object' ? JSON.stringify(value) : String(value)} />
            ))}
          </Stack>
        </Paper>
      )}
      {answers.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', fontWeight: 600, mb: 1 }}>Quiz results</Typography>
          <Stack spacing={1}>
            <InfoRow label="Score" value={`${quiz.score ?? 0}%`} />
            <InfoRow label="Result" value={quiz.passed ? 'Passed' : 'Failed'} />
          </Stack>
        </Paper>
      )}
    </Stack>
  )
}

function ModuleReviewDetails({ review }) {
  if (!review) return null
  const moduleData = review.data?.module || {}
  const config = moduleData.config || {}
  const slides = Array.isArray(config.slides || moduleData.slides) ? config.slides || moduleData.slides : []
  const steps = Array.isArray(moduleData.steps || config.steps) ? (moduleData.steps || config.steps) : []
  const quiz = config.quiz || moduleData.quiz || {}
  const questions = Array.isArray(quiz.questions) ? quiz.questions : []
  const settings = moduleData.settings || config.settings || {}
  const fields = Array.isArray(review.data?.fields) ? review.data.fields : []

  return (
    <Stack spacing={2}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', fontWeight: 600, mb: 1 }}>Induction module overview</Typography>
        <Stack spacing={1}>
          <InfoRow label="Project" value={review.project?.name || ''} />
          <InfoRow label="Module name" value={moduleData.name || 'Induction'} />
          <InfoRow label="Review status" value={moduleData.reviewStatus || review.status} />
          <InfoRow label="Requested by" value={review.requestedBy} />
          <InfoRow label="Submitted on" value={review.createdAt ? new Date(review.createdAt).toLocaleString() : 'Not recorded'} />
        </Stack>
        {!!steps.length && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Wizard steps</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {steps.map((s, idx) => (
                <Chip key={idx} size="small" label={typeof s === 'string' ? s : s?.label || `Step ${idx + 1}`} sx={{ mr: 0.5, mb: 0.5 }} />
              ))}
            </Stack>
          </>
        )}
      </Paper>

      {!!slides.length && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', fontWeight: 600, mb: 1 }}>Slides ({slides.length} files)</Typography>
          <Stack spacing={1}>
            {slides.map((slide, idx) => (
              <Box key={slide.key || idx} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{slide.title || `Slide ${idx + 1}`}</Typography>
                <Typography variant="caption" color="text.secondary">{slide.fileKey}</Typography>
              </Box>
            ))}
          </Stack>
        </Paper>
      )}

      {!!questions.length && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', fontWeight: 600, mb: 1 }}>
            Quiz overview ({questions.length} questions) - pass mark {settings.passMark ?? 0}%
          </Typography>
          <Stack spacing={1}>
            {questions.map((q, idx) => (
              <Box key={q._id || idx} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Q{idx + 1}. {q.question}</Typography>
                <Typography variant="body2" color="text.secondary">Options: {(q.options || []).join(', ')}</Typography>
                {typeof q.answerIndex === 'number' && (
                  <Chip size="small" color="success" label={`Correct: ${(q.options && q.options[q.answerIndex]) || `Option ${q.answerIndex + 1}`}`} sx={{ mt: 0.5 }} />
                )}
              </Box>
            ))}
          </Stack>
        </Paper>
      )}

      {!!fields.length && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', fontWeight: 600, mb: 1 }}>Custom data fields ({fields.length})</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Label</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Required</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fields.map((field) => (
                <TableRow key={field._id}>
                  <TableCell>{field.label || field.name}</TableCell>
                  <TableCell>{field.type}</TableCell>
                  <TableCell>{field.required ? 'Yes' : 'No'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Stack>
  )
}
