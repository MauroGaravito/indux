import React, { useEffect, useMemo, useState } from 'react'
import {
  Alert, Button, Paper, Stack, Typography, Tabs, Tab, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Grid, Box, Divider, List, ListItem, ListItemText
} from '@mui/material'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
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
  const [subs, setSubs] = useState([])
  const [projReviews, setProjReviews] = useState([])
  const [projects, setProjects] = useState([])
  const [viewOpen, setViewOpen] = useState(false)
  const [viewTitle, setViewTitle] = useState('')
  const [viewJson, setViewJson] = useState(null)
  const [declineOpen, setDeclineOpen] = useState(false)
  const [declineId, setDeclineId] = useState(null)
  const [declineKind, setDeclineKind] = useState('submission')
  const [declineReason, setDeclineReason] = useState('Not adequate')

  const load = () => Promise.all([
    api.get('/submissions').then(r => setSubs(r.data || [])),
    api.get('/reviews/projects').then(r => setProjReviews(r.data || []))
  ])
  useEffect(()=> { if (user) load() }, [user])
  useEffect(()=> { api.get('/projects').then(r => setProjects(r.data || [])) }, [])

  if (!user) return <Alert severity="info">Please log in as manager/admin.</Alert>
  if (user.role === 'worker') return <Alert severity="warning">Managers/Admins only.</Alert>

  const openView = (title, data) => { setViewTitle(title); setViewJson(data); setViewOpen(true) }
  const closeView = () => setViewOpen(false)
  const openDecline = (kind, id) => { setDeclineKind(kind); setDeclineId(id); setDeclineOpen(true) }
  const closeDecline = () => setDeclineOpen(false)

  const approveSubmission = async (id) => { await api.post(`/submissions/${id}/approve`); await load() }
  const declineSubmission = async () => { if(!declineId) return; await api.post(`/submissions/${declineId}/decline`, { reason: declineReason }); closeDecline(); await load() }
  const approveProject = async (id) => { await api.post(`/reviews/projects/${id}/approve`); await load() }
  const declineProject = async () => { if(!declineId) return; await api.post(`/reviews/projects/${declineId}/decline`, { reason: declineReason }); closeDecline(); await load() }

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Manager Review</Typography>
      <Tabs value={tab} onChange={(_,v)=> setTab(v)} sx={{ borderBottom: '1px solid #eee' }}>
        <Tab label="Project Reviews" />
        <Tab label="Worker Submissions" />
      </Tabs>

      {/* Project Reviews */}
      <Box hidden={tab!==0}>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {projReviews.map(pr => (
            <Grid key={pr._id} item xs={12}>
              <Paper sx={{ p:2 }}>
                <Stack direction={{ xs:'column', md:'row' }} justifyContent="space-between" alignItems={{ md:'center' }} spacing={1}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{pr.projectId}</Typography>
                    <Stack direction="row" spacing={1}>
                      <StatusChip status={pr.status || 'pending'} />
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>Requested: {new Date(pr.createdAt).toLocaleString()}</Typography>
                    </Stack>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button variant="outlined" onClick={()=> openView('Project Configuration', pr.data)}>View</Button>
                    <Button color="error" variant="outlined" onClick={()=> openDecline('project', pr._id)}>Decline</Button>
                    <AsyncButton color="success" variant="contained" onClick={()=> approveProject(pr._id)}>Approve</AsyncButton>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
        {!projReviews.length && <Alert severity="info" sx={{ mt: 2 }}>No pending project reviews.</Alert>}
      </Box>

      {/* Worker Submissions */}
      <Box hidden={tab!==1}>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {subs.map(s => (
            <Grid key={s._id} item xs={12}>
              <Paper sx={{ p:2 }}>
                <Stack direction={{ xs:'column', md:'row' }} justifyContent="space-between" alignItems={{ md:'center' }} spacing={1}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Submission {s._id}</Typography>
                    <Stack direction="row" spacing={1}>
                      <StatusChip status={s.status || 'pending'} />
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>Date: {new Date(s.createdAt).toLocaleString()}</Typography>
                    </Stack>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>Project: {s.projectId} | User: {s.userId}</Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button variant="outlined" onClick={()=> openView('Worker Submission', s)}>View</Button>
                    <Button color="error" variant="outlined" onClick={()=> openDecline('submission', s._id)}>Decline</Button>
                    <AsyncButton color="success" variant="contained" onClick={()=> approveSubmission(s._id)}>Approve</AsyncButton>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
        {!subs.length && <Alert severity="info" sx={{ mt: 2 }}>No pending worker submissions.</Alert>}
      </Box>

      {/* View Dialog */}
      <Dialog open={viewOpen} onClose={closeView} maxWidth="md" fullWidth>
        <DialogTitle>{viewTitle}</DialogTitle>
        <DialogContent>
          {viewTitle === 'Worker Submission' && viewJson ? (
            <Box sx={{ py: 1 }}>
              {/* Personal Details */}
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Personal Details</Typography>
              <Grid container spacing={2}>
                {Object.entries(viewJson.personal || {}).map(([key, val]) => {
                  const labelMap = {
                    name: 'Name',
                    dob: 'Date of Birth',
                    phone: 'Phone',
                    address: 'Address',
                    medicalIssues: 'Medical Issues',
                    nextOfKin: 'Next of Kin',
                    nextOfKinPhone: 'Next of Kin Phone',
                    isIndigenous: 'Is Indigenous',
                    isApprentice: 'Is Apprentice'
                  }
                  const prettify = (k) => labelMap[k] || String(k)
                    .replace(/([a-z])([A-Z])/g, '$1 $2')
                    .replace(/[-_]/g, ' ')
                    .replace(/^\w/, (c) => c.toUpperCase())
                  const display = typeof val === 'object' && val != null ? JSON.stringify(val) : String(val ?? '')
                  return (
                    <Grid key={key} item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">{prettify(key)}</Typography>
                      <Typography variant="body1">{display}</Typography>
                    </Grid>
                  )
                })}
              </Grid>

              {/* Signature */}
              {viewJson.signatureDataUrl && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Signature</Typography>
                  <Box component="img" src={viewJson.signatureDataUrl} alt="Signature"
                       sx={{ maxWidth: '200px', borderRadius: 1, border: '1px solid', borderColor: 'divider' }} />
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              {/* Quiz Summary */}
              {viewJson.quiz && (
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {`${viewJson.quiz.correct ?? 0}/${viewJson.quiz.total ?? 0} correct answers `}
                  {(viewJson.quiz.total && viewJson.quiz.correct === viewJson.quiz.total) ? '✅' : ''}
                </Typography>
              )}

              {/* Quiz Details */}
              {(() => {
                const project = projects.find(p => p._id === (viewJson.projectId || viewJson.project?._id))
                const questions = project?.config?.questions || []
                const answers = viewJson?.quiz?.answers
                if (!questions.length) return null
                return (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Questionnaire</Typography>
                    <Stack spacing={1}>
                      {questions.map((q, qi) => {
                        const selectedIdx = Array.isArray(answers) ? answers[qi] : undefined
                        const correctIdx = q?.correctIndex
                        const selectedText = typeof selectedIdx === 'number' ? q?.answers?.[selectedIdx] : undefined
                        const correctText = typeof correctIdx === 'number' ? q?.answers?.[correctIdx] : undefined
                        const isCorrect = typeof selectedIdx === 'number' && selectedIdx === correctIdx
                        return (
                          <Paper key={qi} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>Q{qi+1}. {q?.questionText}</Typography>
                            {selectedText != null ? (
                              <Typography variant="body2" color={isCorrect ? 'success.main' : 'error.main'}>
                                Selected: {selectedText} {isCorrect ? '✓' : '✗'}
                              </Typography>
                            ) : (
                              <Typography variant="body2" color="text.secondary">No stored answer</Typography>
                            )}
                            {(!isCorrect && correctText != null) && (
                              <Typography variant="body2" color="text.secondary">Correct: {correctText}</Typography>
                            )}
                          </Paper>
                        )
                      })}
                    </Stack>
                  </Box>
                )
              })()}

              {/* Uploads */}
              {Array.isArray(viewJson.uploads) && viewJson.uploads.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Uploads</Typography>
                  <List dense>
                    {viewJson.uploads.map((u, idx) => {
                      const key = typeof u === 'string' ? u : (u?.key || '')
                      const type = typeof u === 'string' ? undefined : u?.type
                      return (
                        <ListItem key={`${key}-${idx}`} sx={{ py: 0.5 }}>
                          <InsertDriveFileIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          <ListItemText
                            primary={key || '(missing key)'}
                            secondary={type ? `Type: ${type}` : undefined}
                          />
                        </ListItem>
                      )
                    })}
                  </List>
                </Box>
              )}
            </Box>
          ) : (
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{viewJson ? JSON.stringify(viewJson, null, 2) : ''}</pre>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeView}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Decline Dialog */}
      <Dialog open={declineOpen} onClose={closeDecline} maxWidth="sm" fullWidth>
        <DialogTitle>Decline {declineKind === 'project' ? 'Project Review' : 'Submission'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Reason" value={declineReason} onChange={e=> setDeclineReason(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDecline}>Cancel</Button>
          <AsyncButton color="error" variant="contained" onClick={declineKind==='project' ? declineProject : declineSubmission}>Decline</AsyncButton>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
