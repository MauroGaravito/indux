import React, { useEffect, useState } from 'react'
import { Alert, Button, Paper, Stack, Typography, Divider } from '@mui/material'
import api from '../utils/api.js'
import { useAuthStore } from '../store/auth.js'

export default function ReviewQueue() {
  const { user } = useAuthStore()
  const [subs, setSubs] = useState([])
  const [projReviews, setProjReviews] = useState([])
  const load = () => Promise.all([
    api.get('/submissions').then(r => setSubs(r.data)),
    api.get('/reviews/projects').then(r => setProjReviews(r.data))
  ])
  useEffect(()=> { if (user) load() }, [user])

  if (!user) return <Alert severity="info">Please log in as manager/admin.</Alert>
  if (user.role === 'worker') return <Alert severity="warning">Managers/Admins only.</Alert>

  const act = async (id, action) => {
    await api.post(`/submissions/${id}/${action}`, { reason: action==='decline'?'Insufficient details':'' })
    await load()
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Review Queue</Typography>
      <Typography variant="subtitle1">Induction Submissions</Typography>
      {subs.map(s => (
        <Paper key={s._id} sx={{ p:2, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <Typography variant="subtitle1">Submission {s._id}</Typography>
            <Typography variant="body2">Project: {s.projectId} | User: {s.userId}</Typography>
          </div>
          <div>
            <Button sx={{ mr:1 }} variant="outlined" color="error" onClick={()=> act(s._id, 'decline')}>Decline</Button>
            <Button variant="contained" color="success" onClick={()=> act(s._id, 'approve')}>Approve</Button>
          </div>
        </Paper>
      ))}
      {!subs.length && <Alert severity="info">No pending submissions.</Alert>}
      <Divider />
      <Typography variant="subtitle1">Project Reviews</Typography>
      {projReviews.map(pr => (
        <Paper key={pr._id} sx={{ p:2, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <Typography variant="subtitle1">Project Review {pr._id}</Typography>
            <Typography variant="body2">Project: {pr.projectId}</Typography>
          </div>
          <div>
            <Button sx={{ mr:1 }} variant="outlined" color="error" onClick={async ()=> { await api.post(`/reviews/projects/${pr._id}/decline`, { reason: 'Not adequate'}); await load() }}>Decline</Button>
            <Button variant="contained" color="success" onClick={async ()=> { await api.post(`/reviews/projects/${pr._id}/approve`); await load() }}>Approve</Button>
          </div>
        </Paper>
      ))}
      {!projReviews.length && <Alert severity="info">No pending project reviews.</Alert>}
    </Stack>
  )
}
