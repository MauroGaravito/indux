import React, { useEffect, useState } from 'react'
import { Card, CardContent, Chip, Grid, Stack, Typography, Button, Alert, Divider, Box } from '@mui/material'
import api from '../../utils/api.js'
import { useAuthStore } from '../../store/auth.js'
import { useNavigate } from 'react-router-dom'
import AsyncButton from '../../components/AsyncButton.jsx'

export default function ManagerProjects() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [assignments, setAssignments] = useState([])
  const [moduleStatuses, setModuleStatuses] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const loadProjects = async () => {
    if (!user?.sub) return
    setLoading(true)
    setError('')
    try {
      const r = await api.get(`/assignments/user/${user.sub}`)
      const list = (r.data || []).filter((a) => a.role === 'manager' && a.project && a.project.status !== 'archived')
      setAssignments(list)
      const statuses = {}
      await Promise.all(
        list.map(async (entry) => {
          const pid = entry.project._id || entry.project
          try {
            const mod = await api.get(`/projects/${pid}/modules/induction`)
            statuses[pid] = mod.data?.module?.reviewStatus || 'draft'
          } catch {
            statuses[pid] = 'draft'
          }
        })
      )
      setModuleStatuses(statuses)
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to load projects')
      setAssignments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadProjects() }, [user])

  const openModule = async (projectId) => {
    try {
      const r = await api.get(`/projects/${projectId}/modules/induction`)
      const modId = r?.data?.module?._id
      if (modId) navigate(`/manager/projects/${projectId}/module/${modId}`)
    } catch (e) {
      setError('Module not found for this project.')
    }
  }

  const projects = assignments.map((a) => a.project)
  const statusLabel = (status) => {
    if (!status) return { label: 'No module', color: 'default' }
    const palette = {
      draft: { label: 'Draft', color: 'default' },
      pending: { label: 'Pending review', color: 'warning' },
      approved: { label: 'Approved', color: 'success' },
      declined: { label: 'Declined', color: 'error' },
    }
    return palette[status] || { label: status, color: 'default' }
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>Projects</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {loading && <Alert severity="info">Loading projects...</Alert>}
      <Grid container spacing={2}>
        {projects.map((p) => {
          const moduleStatus = moduleStatuses[p._id] || moduleStatuses[String(p._id)] || 'draft'
          const moduleChip = statusLabel(moduleStatus)
          return (
            <Grid item xs={12} md={6} key={p._id}>
              <Card elevation={2} sx={{ borderRadius: 3, minHeight: 220 }}>
                <CardContent>
                  <Stack spacing={1}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>{p.name}</Typography>
                      <Chip size="small" label={p.status} color={p.status === 'active' ? 'success' : p.status === 'archived' ? 'warning' : 'default'} />
                    </Stack>
                    {p.address && (
                      <Typography variant="body2" color="text.secondary">
                        {p.address}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary">
                      {p.description || 'No description provided.'}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Chip label={moduleChip.label} color={moduleChip.color} />
                      <Divider orientation="vertical" flexItem />
                      <Chip label="Induction module" size="small" variant="outlined" />
                    </Stack>
                    <Box sx={{ flex: 1 }} />
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Button size="small" variant="text" onClick={() => navigate(`/manager/projects/${p._id}`)}>Open Project</Button>
                      <AsyncButton size="small" variant="contained" onClick={() => openModule(p._id)}>Open Module</AsyncButton>
                      <Button size="small" variant="outlined" onClick={() => navigate(`/manager/projects/${p._id}/team`)}>Manage Team</Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>
      {!projects.length && !loading && <Alert severity="info">No projects assigned.</Alert>}
    </Stack>
  )
}
