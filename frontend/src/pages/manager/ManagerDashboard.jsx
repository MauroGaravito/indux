import React, { useEffect, useState } from 'react'
import { Grid, Card, CardContent, Typography, Stack, Button, Alert } from '@mui/material'
import api from '../../utils/api.js'
import { useAuthStore } from '../../store/auth.js'
import { useNavigate } from 'react-router-dom'

const metricDefinitions = [
  { label: 'Assigned Projects', key: 'projects' },
  { label: 'Pending Submissions', key: 'submissions' },
  { label: 'Modules Pending Review', key: 'modules' },
]

export default function ManagerDashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [metrics, setMetrics] = useState({ projects: 0, submissions: 0, modules: 0 })
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user?.sub) return
    let isCancelled = false

    const loadMetrics = async () => {
      try {
        const resp = await api.get(`/assignments/user/${user.sub}`)
        const list = (resp.data || []).filter((a) => a.role === 'manager' && a.project && a.project.status !== 'archived')
        if (isCancelled) return
        setMetrics((prev) => ({ ...prev, projects: list.length }))

        const modules = await Promise.all(
          list.map(async (entry) => {
            const pid = entry.project._id || entry.project
            try {
              const mod = await api.get(`/projects/${pid}/modules/induction`)
              return mod.data?.module?.reviewStatus === 'pending' ? 1 : 0
            } catch {
              return 0
            }
          })
        )
        if (isCancelled) return
        setMetrics((prev) => ({ ...prev, modules: modules.reduce((acc, val) => acc + val, 0) }))
      } catch (e) {
        if (!isCancelled) {
          setError(e?.response?.data?.error || 'Unable to load metrics.')
        }
      }
    }

    loadMetrics()
    return () => { isCancelled = true }
  }, [user])

  return (
    <Stack spacing={3}>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>Manager Dashboard</Typography>
      {error && <Alert severity="warning">{error}</Alert>}
      <Grid container spacing={2}>
        {metricDefinitions.map((metric) => (
          <Grid item xs={12} md={4} key={metric.key}>
            <Card elevation={1} sx={{ borderRadius: 2 }}>
              <CardContent>
                <Stack spacing={0.5}>
                  <Typography variant="subtitle2" color="text.secondary">{metric.label}</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>{metrics[metric.key] ?? 0}</Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Card elevation={1} sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Quick Actions</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1 }}>
            <Button variant="contained" onClick={() => navigate('/manager/projects')}>Go to my Projects</Button>
            <Button variant="outlined" onClick={() => navigate('/manager/projects/1/team')}>See Team</Button>
            <Button variant="text" onClick={() => navigate('/review')}>Review Queue</Button>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
