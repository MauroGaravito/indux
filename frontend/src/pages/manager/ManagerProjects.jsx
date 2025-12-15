import React, { useEffect, useState } from 'react'
import { Card, CardContent, Chip, Grid, Stack, Typography, Button, Alert, Divider, Box } from '@mui/material'
import api from '../../utils/api.js'
import { fetchProjectModules } from '../../utils/modules.js'
import { useAuthStore } from '../../store/auth.js'
import { useNavigate } from 'react-router-dom'

export default function ManagerProjects() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [assignments, setAssignments] = useState([])
  const [projectModules, setProjectModules] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const loadProjects = async () => {
    if (!user?.id) return
    setLoading(true)
    setError('')
    try {
      const r = await api.get(`/assignments/user/${user.id}`)
      const list = (r.data || []).filter((a) => a.role === 'manager' && a.project && a.project.status !== 'archived')
      setAssignments(list)
      const modulesMap = {}
      await Promise.all(
        list.map(async (entry) => {
          const pid = entry.project._id || entry.project
          try {
            const mods = await fetchProjectModules(pid)
            modulesMap[pid] = mods
          } catch {
            modulesMap[pid] = []
          }
        })
      )
      setProjectModules(modulesMap)
    } catch (e) {
      setError(e?.response?.data?.error || 'Unable to load assigned projects.')
      setAssignments([])
      setProjectModules({})
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadProjects() }, [user])

  const openModule = (projectId, moduleId) => {
    const modules = projectModules[projectId] || []
    const target = moduleId || (modules[0]?._id)
    if (target) {
      navigate(`/manager/projects/${projectId}/module/${target}`)
    } else {
      navigate(`/manager/projects/${projectId}`)
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
      <Typography variant="h5" sx={{ fontWeight: 700 }}>Assigned projects</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {loading && <Alert severity="info">Loading assigned projects...</Alert>}
      <Grid container spacing={2}>
        {projects.map((p) => {
          const modules = projectModules[p._id] || projectModules[String(p._id)] || []
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
                      {p.description || 'No project description provided.'}
                    </Typography>
                    <Stack spacing={1}>
                      <Typography variant="subtitle2">Induction modules</Typography>
                      {modules.length ? (
                        modules.map((mod) => {
                          const chip = statusLabel(mod.reviewStatus)
                          return (
                            <Stack key={mod._id} direction="row" alignItems="center" spacing={1}>
                              <Chip label={chip.label} color={chip.color} size="small" />
                              <Typography variant="body2" sx={{ flex: 1 }}>{mod.name || 'Induction module'}</Typography>
                              <Button size="small" variant="outlined" onClick={() => openModule(p._id, mod._id)}>Open</Button>
                            </Stack>
                          )
                        })
                      ) : (
                        <Typography variant="body2" color="text.secondary">No induction modules yet.</Typography>
                      )}
                    </Stack>
                    <Box sx={{ flex: 1 }} />
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Button size="small" variant="text" onClick={() => navigate(`/manager/projects/${p._id}`)}>Project overview</Button>
                      <Button size="small" variant="contained" onClick={() => openModule(p._id)}>
                        {modules.length ? 'Open first module' : 'Go to project'}
                      </Button>
                      <Button size="small" variant="outlined" onClick={() => navigate(`/manager/projects/${p._id}/team`)}>Manage assigned workers</Button>
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
