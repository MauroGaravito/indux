import React, { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Avatar,
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
  const [submissionMap, setSubmissionMap] = useState({})
  const [projectManagers, setProjectManagers] = useState({})

  const formatDate = (value) => {
    if (!value) return ''
    try {
      return new Date(value).toLocaleString()
    } catch {
      return value
    }
  }

  const buildSubmissionMap = (subs = []) => {
    const map = {}
    subs.forEach((sub) => {
      const pid = sub.projectId || sub.project?.id
      if (!pid) return
      const existing = map[pid]
      if (!existing || new Date(sub.createdAt) > new Date(existing.createdAt)) {
        map[pid] = sub
      }
    })
    return map
  }

  const getSubmissionInfo = (submission) => {
    if (!submission) {
      return {
        chip: { label: 'Not started', color: 'default' },
        message: 'Induction not started.',
        showButton: true,
        alert: null
      }
    }
    if (submission.status === 'approved') {
      return {
        chip: { label: 'Induction approved', color: 'success' },
        message: `Approved on ${formatDate(submission.updatedAt || submission.createdAt)}`,
        showButton: false,
        alert: null
      }
    }
    if (submission.status === 'pending') {
      return {
        chip: { label: 'Submission pending', color: 'warning' },
        message: 'Submission pending review.',
        showButton: false,
        alert: null
      }
    }
    if (submission.status === 'declined') {
      return {
        chip: { label: 'Submission declined', color: 'error' },
        message: 'Your last submission was declined. Please review feedback and resubmit.',
        showButton: true,
        alert: submission.reviewReason ? `Reason: ${submission.reviewReason}` : 'No reason provided.'
      }
    }
    return {
      chip: { label: 'Not started', color: 'default' },
      message: 'Induction not started.',
      showButton: true,
      alert: null
    }
  }

  const loadManagers = async (list) => {
    const managerMap = {}
    await Promise.all(
      list.map(async (entry) => {
        const pid = entry.project._id || entry.project
        try {
          const res = await api.get(`/assignments/project/${pid}`)
          managerMap[pid] = (res.data || [])
            .filter((a) => a.role === 'manager')
            .map((a) => ({
              id: a.user?._id || a.user,
              name: a.user?.name || 'Manager',
              email: a.user?.email || '',
              phone: a.user?.phone || '',
              position: a.user?.position || ''
            }))
        } catch {
          managerMap[pid] = []
        }
      })
    )
    setProjectManagers(managerMap)
  }

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

      const historyRes = await api.get('/workers/me/submissions')
      const submissions = historyRes.data?.submissions || []
      setSubmissionMap(buildSubmissionMap(submissions))

      await loadManagers(list)
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to load data')
      setAssignments([])
      setModuleStatuses({})
      setSubmissionMap({})
      setProjectManagers({})
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

  const profileDetails = useMemo(() => {
    if (!user) return []
    const rows = [
      { label: 'Email', value: user.email },
      { label: 'Phone', value: user.phone },
      { label: 'Company', value: user.companyName }
    ]
    return rows.filter((row) => row.value)
  }, [user])

  const profileInitials = useMemo(() => {
    if (!user?.name) return (user?.email || 'W')?.charAt(0)?.toUpperCase() || 'W'
    return user.name
      .split(' ')
      .map((part) => part.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }, [user])

  return (
    <Stack spacing={3}>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>Worker Dashboard</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {loading && <Alert severity="info">Loading...</Alert>}

      <Card elevation={1} sx={{ borderRadius: 2 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
            <Avatar
              src={user?.avatarUrl}
              alt={user?.name}
              sx={{ width: 64, height: 64, fontSize: 24, bgcolor: 'primary.main' }}
            >
              {profileInitials}
            </Avatar>
            <Stack spacing={0.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{user?.name || 'Worker'}</Typography>
                <Chip size="small" label="Worker" color="primary" />
              </Stack>
              <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
              {profileDetails.map((detail) => (
                <Typography key={detail.label} variant="body2" color="text.secondary">
                  {detail.label}: {detail.value}
                </Typography>
              ))}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

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
              const pid = p._id || String(p._id)
              const submission = submissionMap[pid] || submissionMap[String(pid)]
              const submissionInfo = getSubmissionInfo(submission)
              const managers = projectManagers[pid] || []
              return (
                <Grid item xs={12} md={6} key={p._id}>
                  <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Stack spacing={1.5}>
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
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip size="small" label={submissionInfo.chip.label} color={submissionInfo.chip.color} variant="outlined" />
                          <Typography variant="body2" color="text.secondary">{submissionInfo.message}</Typography>
                        </Stack>
                        {submissionInfo.alert && (
                          <Alert severity="warning" variant="outlined">{submissionInfo.alert}</Alert>
                        )}
                        <Stack spacing={0.5}>
                          <Typography variant="subtitle2" color="text.secondary">Managers</Typography>
                          {managers.length ? (
                            managers.map((m) => (
                              <Box key={m.id}>
                                <Typography variant="body2">{m.name}{m.email ? ` (${m.email})` : ''}</Typography>
                                {m.phone && <Typography variant="caption" color="text.secondary">Phone: {m.phone}</Typography>}
                                {m.position && <Typography variant="caption" color="text.secondary">Position: {m.position}</Typography>}
                              </Box>
                            ))
                          ) : (
                            <Typography variant="caption" color="text.secondary">No manager info available.</Typography>
                          )}
                        </Stack>
                        {submissionInfo.showButton && (
                          <Button variant="contained" size="small" onClick={() => navigate('/wizard')}>
                            Open Wizard
                          </Button>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              )
            })}
          </Grid>
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
