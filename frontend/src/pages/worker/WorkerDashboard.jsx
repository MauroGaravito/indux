import React, { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography
} from '@mui/material'
import api from '../../utils/api.js'
import { useAuthStore } from '../../store/auth.js'
import { useNavigate } from 'react-router-dom'

const statusPalette = {
  draft: { label: 'Draft', color: 'default' },
  pending: { label: 'Pending review', color: 'warning' },
  approved: { label: 'Ready', color: 'success' },
  declined: { label: 'Declined', color: 'error' },
  none: { label: 'Not configured', color: 'default' },
}

export default function WorkerDashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [assignments, setAssignments] = useState([])
  const [moduleStatuses, setModuleStatuses] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const loadData = async () => {
    if (!user?.id) return
    setLoading(true)
    setError('')
    try {
      const r = await api.get(`/assignments/user/${user.id}`)
      const list = (r.data || []).filter((a) => a.role === 'worker' && a.project && a.project.status !== 'archived')
      setAssignments(list)

      const statusMap = {}
      await Promise.all(list.map(async (entry) => {
        const pid = entry.project._id || entry.project
        try {
          const modRes = await api.get(`/projects/${pid}/modules/induction`)
          statusMap[pid] = modRes.data?.module?.reviewStatus || 'draft'
        } catch {
          statusMap[pid] = 'none'
        }
      }))
      setModuleStatuses(statusMap)
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to load data')
      setAssignments([])
      setModuleStatuses({})
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [user])

  const projects = useMemo(() => assignments.map((a) => a.project), [assignments])
  const counts = useMemo(() => {
    const total = projects.length
    const approved = projects.filter((p) => (moduleStatuses[p._id] || moduleStatuses[String(p._id)]) === 'approved').length
    const pending = total - approved
    return { total, approved, pending }
  }, [projects, moduleStatuses])

  const moduleChip = (status) => {
    const key = status || 'none'
    return statusPalette[key] || statusPalette.none
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>Worker Dashboard</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {loading && <Alert severity="info">Loading...</Alert>}

      <Grid container spacing={2}>
        <SummaryCard title="Assigned Projects" value={counts.total} />
        <SummaryCard title="Induction Ready" value={counts.approved} color="success" />
        <SummaryCard title="Pending Inductions" value={counts.pending} color="warning" />
      </Grid>

      <Card elevation={1} sx={{ borderRadius: 2 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>My Projects</Typography>
            <Chip size="small" label={projects.length} />
          </Stack>
          {!projects.length && !loading && (
            <Alert severity="info">No projects assigned yet. Please contact your manager.</Alert>
          )}
          <Grid container spacing={2}>
            {projects.map((p) => {
              const status = moduleStatuses[p._id] || moduleStatuses[String(p._id)] || 'none'
              const chip = moduleChip(status)
              return (
                <Grid item xs={12} md={6} key={p._id}>
                  <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Stack spacing={1}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{p.name}</Typography>
                          <Chip size="small" label={p.status} color={p.status === 'active' ? 'success' : p.status === 'archived' ? 'warning' : 'default'} />
                        </Stack>
                        {p.address && <Typography variant="body2" color="text.secondary">{p.address}</Typography>}
                        <Typography variant="body2" color="text.secondary">{p.description || 'No description provided.'}</Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip size="small" label={chip.label} color={chip.color} />
                          <Divider orientation="vertical" flexItem />
                          <Typography variant="caption" color="text.secondary">Induction module</Typography>
                        </Stack>
                        <Box sx={{ flex: 1 }} />
                        <Button variant="contained" size="small" onClick={() => navigate('/wizard')}>
                          Open Wizard
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              )
            })}
          </Grid>
        </CardContent>
      </Card>

      <Card elevation={1} sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>History & Certificates</Typography>
          <Alert severity="info">
            Submission history and certificates will appear here in a future version once the API exposes these details.
          </Alert>
        </CardContent>
      </Card>
    </Stack>
  )
}

function SummaryCard({ title, value, color = 'primary' }) {
  return (
    <Grid item xs={12} sm={4}>
      <Card elevation={1} sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary">{title}</Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, color: `${color}.main` }}>{value}</Typography>
        </CardContent>
      </Card>
    </Grid>
  )
}
