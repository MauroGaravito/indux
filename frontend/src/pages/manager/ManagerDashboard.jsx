import React, { useEffect, useState } from 'react'
import { Grid, Card, CardContent, Typography, Stack, Button, Alert } from '@mui/material'
import api from '../../utils/api.js'
import { fetchProjectModules } from '../../utils/modules.js'
import { useAuthStore } from '../../store/auth.js'
import { useNavigate } from 'react-router-dom'

const metricDefinitions = [
  { label: 'Assigned projects', key: 'projects' },
  { label: 'Pending submissions', key: 'submissions' },
  { label: 'Modules pending review', key: 'modules' },
]

export default function ManagerDashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [metrics, setMetrics] = useState({ projects: 0, submissions: 0, modules: 0 })
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user?.id) return
    let isCancelled = false

    const loadMetrics = async () => {
      try {
        const resp = await api.get(`/assignments/user/${user.id}`)
        const list = (resp.data || []).filter((a) => a.role === 'manager' && a.project && a.project.status !== 'archived')
        if (isCancelled) return
        setMetrics((prev) => ({ ...prev, projects: list.length }))

        const modulesForAssignments = []
        await Promise.all(
          list.map(async (entry) => {
            const pid = entry.project._id || entry.project
            try {
              const mods = await fetchProjectModules(pid)
              modulesForAssignments.push(...mods)
            } catch {
              // ignore
            }
          })
        )
        let pendingModules = 0
        let pendingSubmissions = 0
        for (const mod of modulesForAssignments) {
          if (!mod?._id) continue
          if (mod.reviewStatus === 'pending') pendingModules += 1
          try {
            const pending = await api.get(`/modules/${mod._id}/submissions`, { params: { status: 'pending' } })
            pendingSubmissions += (pending.data || []).length
          } catch {
            // ignore
          }
        }
        if (isCancelled) return
        setMetrics((prev) => ({ ...prev, modules: pendingModules, submissions: pendingSubmissions }))
      } catch (e) {
        if (!isCancelled) {
          setError(e?.response?.data?.error || 'Unable to load WHS metrics.')
        }
      }
    }

    loadMetrics()
    return () => { isCancelled = true }
  }, [user])

  return (
    <Stack spacing={3}>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>Project dashboard</Typography>
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
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Quick actions</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1 }}>
            <Button variant="contained" onClick={() => navigate('/manager/projects')}>View assigned projects</Button>
            <Button variant="outlined" onClick={() => navigate('/manager/projects')}>Manage project teams</Button>
            <Button variant="text" onClick={() => navigate('/review')}>Pending approvals</Button>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
