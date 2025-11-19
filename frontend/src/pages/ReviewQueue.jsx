import React, { useEffect, useState } from 'react'
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
  const [declineId, setDeclineId] = useState(null)
  const [declineKind, setDeclineKind] = useState('submission')
  const [declineReason, setDeclineReason] = useState('Not adequate')

  const loadContext = async () => {
    const projResp = await api.get('/projects')
    const loadedModules = []
    for (const p of projResp.data || []) {
      try {
        const r = await api.get(`/projects/${p._id}/modules/induction`)
        loadedModules.push({ project: p, module: r.data.module })
      } catch (_) {
        // no module
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

  if (!user) return <Alert severity="info">Please log in as manager/admin.</Alert>
  if (!['manager', 'admin'].includes(user.role)) return <Alert severity="warning">Managers/Admins only.</Alert>

  const openView = (mode, title, data) => {
    setViewMode(mode)
    setViewTitle(title)
    setViewJson(data)
    setViewOpen(true)
  }
  const closeView = () => setViewOpen(false)
  const openDecline = (kind, id) => { setDeclineKind(kind); setDeclineId(id); setDeclineOpen(true) }
  const closeDecline = () => setDeclineOpen(false)

  const approveSubmission = async (id) => { await api.post(`/submissions/${id}/approve`); await loadAll() }
  const declineSubmission = async () => { if(!declineId) return; await api.post(`/submissions/${declineId}/decline`, { reason: declineReason }); closeDecline(); await loadAll() }
  const approveReview = async (rev) => { await api.post(`/modules/${rev.moduleId}/reviews/${rev._id}/approve`); await loadAll() }
  const declineReview = async (rev) => { await api.post(`/modules/${rev.moduleId}/reviews/${rev._id}/decline`, { reason: declineReason }); await loadAll() }

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Review Queue</Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)}>
        <Tab label="Submissions" />
        <Tab label="Module Reviews" />
      </Tabs>

      {tab === 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Pending Submissions</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Project</TableCell>
                <TableCell>Worker</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {submissions.map((s) => (
                <TableRow key={s._id}>
                  <TableCell>{s.project?.name || ''}</TableCell>
                  <TableCell>{s.userId?.name || s.userId?.email || ''}</TableCell>
                  <TableCell><StatusChip status={s.status} /></TableCell>
                  <TableCell>{new Date(s.createdAt || s._createdAt || Date.now()).toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" onClick={() => openView('submission', 'Submission', s)}>View</Button>
                      <AsyncButton size="small" color="success" variant="contained" onClick={() => approveSubmission(s._id)}>Approve</AsyncButton>
                      <Button size="small" color="error" onClick={() => openDecline('submission', s._id)}>Decline</Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!submissions.length && <Alert severity="info" sx={{ mt: 2 }}>No pending submissions.</Alert>}
        </Paper>
      )}

      {tab === 1 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Module Reviews</Typography>
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
                  <TableCell>{r.type}</TableCell>
                  <TableCell><StatusChip status={r.status} /></TableCell>
                  <TableCell>{r.requestedBy}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" onClick={() => openView('moduleReview', 'Module Review', r)}>View</Button>
                      <AsyncButton size="small" color="success" variant="contained" onClick={() => approveReview(r)}>Approve</AsyncButton>
                      <Button size="small" color="error" onClick={() => { setDeclineReason('Not adequate'); setDeclineKind('review'); setDeclineId(r._id); setDeclineOpen(true); }}>Decline</Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!reviews.length && <Alert severity="info" sx={{ mt: 2 }}>No reviews yet.</Alert>}
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
        <DialogTitle>Decline {declineKind}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Reason" value={declineReason} onChange={(e) => setDeclineReason(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDecline}>Cancel</Button>
          <AsyncButton
            color="error"
            onClick={() => (declineKind === 'submission'
              ? declineSubmission()
              : (reviews.find(r => r._id === declineId) ? declineReview(reviews.find(r => r._id === declineId)) : closeDecline()))}
          >
            Decline
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
  const worker = submission.userId?.name || submission.userId?.email || submission.userId || 'Unknown'
  const submitted = submission.createdAt ? new Date(submission.createdAt).toLocaleString() : 'N/A'
  const quiz = submission.quiz || {}
  const answers = Array.isArray(quiz.answers) ? quiz.answers : []
  const payloadEntries = Object.entries(submission.payload || {})

  return (
    <Stack spacing={2}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', fontWeight: 600, mb: 1 }}>Submission Summary</Typography>
        <Stack spacing={1}>
          <InfoRow label="Project" value={submission.project?.name || ''} />
          <InfoRow label="Worker" value={worker} />
          <InfoRow label="Status" value={submission.status} />
          <InfoRow label="Submitted" value={submitted} />
        </Stack>
      </Paper>
      {!!payloadEntries.length && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', fontWeight: 600, mb: 1 }}>Form Responses</Typography>
          <Stack spacing={1}>
            {payloadEntries.map(([key, value]) => (
              <InfoRow key={key} label={key} value={typeof value === 'object' ? JSON.stringify(value) : String(value)} />
            ))}
          </Stack>
        </Paper>
      )}
      {answers.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', fontWeight: 600, mb: 1 }}>Quiz</Typography>
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
        <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', fontWeight: 600, mb: 1 }}>Module Overview</Typography>
        <Stack spacing={1}>
          <InfoRow label="Project" value={review.project?.name || ''} />
          <InfoRow label="Module Name" value={moduleData.name || 'Induction'} />
          <InfoRow label="Review Status" value={moduleData.reviewStatus || review.status} />
          <InfoRow label="Requested By" value={review.requestedBy} />
          <InfoRow label="Submitted" value={review.createdAt ? new Date(review.createdAt).toLocaleString() : 'N/A'} />
        </Stack>
        {!!steps.length && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Steps</Typography>
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
          <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', fontWeight: 600, mb: 1 }}>Slides ({slides.length})</Typography>
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
            Quiz ({questions.length} questions) · Pass mark {settings.passMark ?? 0}%
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
          <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', fontWeight: 600, mb: 1 }}>Custom Fields ({fields.length})</Typography>
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
