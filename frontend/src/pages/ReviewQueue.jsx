import React, { useEffect, useMemo, useState } from 'react'
import {
  Alert, Button, Paper, Stack, Typography, Tabs, Tab, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Grid, Box
} from '@mui/material'
import api from '../utils/api.js'
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
                    <Button color="success" variant="contained" onClick={()=> approveProject(pr._id)}>Approve</Button>
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
                    <Button color="success" variant="contained" onClick={()=> approveSubmission(s._id)}>Approve</Button>
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
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{viewJson ? JSON.stringify(viewJson, null, 2) : ''}</pre>
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
          <Button color="error" variant="contained" onClick={declineKind==='project' ? declineProject : declineSubmission}>Decline</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
