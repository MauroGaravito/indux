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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Stack,
  Typography
} from '@mui/material'
import api from '../../utils/api.js'
import { fetchProjectModules } from '../../utils/modules.js'
import { fetchProjectInspections, fetchMyInspectionRecords, listInspectionTemplates, startInspectionExecution } from '../../utils/inspections.js'
import { getInspectionExecutionRecord, setInspectionExecutionRecord } from '../../utils/inspectionStorage.js'
import { useAuthStore } from '../../store/auth.js'
import { useNavigate } from 'react-router-dom'

const statusPalette = {
  draft: { label: 'Draft', color: 'default' },
  pending: { label: 'Awaiting approval', color: 'warning' },
  approved: { label: 'Ready for induction', color: 'success' },
  declined: { label: 'Declined', color: 'error' },
  none: { label: 'Not configured', color: 'default' },
}

const inspectionStatusPalette = {
  none: { label: 'Not started', color: 'default' },
  draft: { label: 'In progress', color: 'warning' },
  submitted: { label: 'Completed', color: 'success' },
}

const inspectionTypeLabels = {
  daily: 'Daily',
  weekly: 'Weekly',
  adhoc: 'Ad-hoc',
}

export default function WorkerDashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [assignments, setAssignments] = useState([])
  const [projectModules, setProjectModules] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [submissionMap, setSubmissionMap] = useState({})
  const [projectManagers, setProjectManagers] = useState({})
  const [inspections, setInspections] = useState([])
  const [inspectionLoading, setInspectionLoading] = useState(false)
  const [inspectionError, setInspectionError] = useState('')
  const [completedRecords, setCompletedRecords] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState('')

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
      const moduleId = sub.moduleId || sub.module?._id
      if (!moduleId) return
      const key = String(moduleId)
      const existing = map[key]
      if (!existing || new Date(sub.createdAt) > new Date(existing.createdAt)) {
        map[key] = sub
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
        message: 'Submission awaiting manager approval.',
        showButton: false,
        alert: null
      }
    }
    if (submission.status === 'declined') {
      return {
        chip: { label: 'Submission declined', color: 'error' },
        message: 'Your last submission was declined. Review the feedback and submit again.',
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

  const loadInspections = async (assignmentList) => {
    if (!assignmentList?.length) {
      setInspections([])
      return
    }
    setInspectionLoading(true)
    setInspectionError('')
    try {
      const templates = await listInspectionTemplates()
      const templateMap = new Map()
      templates.forEach((tpl) => templateMap.set(String(tpl._id), tpl.name || 'Inspection template'))

      const rows = []
      await Promise.all(
        assignmentList.map(async (entry) => {
          const project = entry.project || {}
          const projectId = project._id || entry.project
          if (!projectId) return
          try {
            const list = await fetchProjectInspections(projectId)
            list.forEach((insp) => {
              rows.push({
                projectId,
                projectName: project.name || 'Project',
                projectInspectionId: insp._id,
                templateId: insp.templateId,
                templateName: templateMap.get(String(insp.templateId)) || 'Inspection template',
                type: insp.type || 'daily',
              })
            })
          } catch {
            // ignore per-project failures to keep dashboard responsive
          }
        })
      )
      setInspections(rows)
    } catch (e) {
      setInspectionError(e?.response?.data?.error || 'Failed to load inspections.')
      setInspections([])
    } finally {
      setInspectionLoading(false)
    }
  }

  const loadCompletedRecords = async () => {
    setHistoryLoading(true)
    setHistoryError('')
    try {
      const data = await fetchMyInspectionRecords()
      setCompletedRecords(data)
    } catch (e) {
      setCompletedRecords([])
      setHistoryError(e?.response?.data?.error || 'Unable to load completed inspections.')
    } finally {
      setHistoryLoading(false)
    }
  }

  const loadData = async () => {
    if (!user?.id) return
    setLoading(true)
    setError('')
    try {
      const r = await api.get(`/assignments/user/${user.id}`)
      const list = (r.data || []).filter((a) => a.role === 'worker' && a.project && a.project.status !== 'archived')
      setAssignments(list)

      const modulesMap = {}
      await Promise.all(list.map(async (entry) => {
        const pid = entry.project._id || entry.project
        try {
          const mods = await fetchProjectModules(pid)
          modulesMap[pid] = mods
        } catch {
          modulesMap[pid] = []
        }
      }))
      setProjectModules(modulesMap)

      const historyRes = await api.get('/workers/me/submissions')
      const submissions = historyRes.data?.submissions || []
      setSubmissionMap(buildSubmissionMap(submissions))

      await loadManagers(list)
      await loadInspections(list)
      await loadCompletedRecords()
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to load data')
      setAssignments([])
      setProjectModules({})
      setSubmissionMap({})
      setProjectManagers({})
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [user])

  const projects = useMemo(() => assignments.map((a) => a.project), [assignments])
  const counts = useMemo(() => {
    const modules = Object.values(projectModules).flat()
    const approved = modules.filter((m) => m.reviewStatus === 'approved').length
    const pending = modules.length - approved
    return { total: projects.length, approved, pending }
  }, [projects, projectModules])

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

  const formatCoordinates = (loc) => {
    if (!loc || typeof loc.lat !== 'number' || typeof loc.lng !== 'number') return ''
    return `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`
  }

  const inspectionStatusFor = (inspection) => {
    const record = getInspectionExecutionRecord(user?.id, inspection.projectInspectionId)
    const key = record?.status === 'submitted'
      ? 'submitted'
      : record?.status === 'draft'
        ? 'draft'
        : 'none'
    return { chip: inspectionStatusPalette[key], record }
  }

  const handleOpenInspection = async (inspection) => {
    if (!inspection?.projectInspectionId) return
    const userId = user?.id
    const stored = getInspectionExecutionRecord(userId, inspection.projectInspectionId)
    if (stored?.executionId && stored.status !== 'submitted') {
      navigate(`/inspections/wizard?executionId=${stored.executionId}`)
      return
    }
    try {
      const execution = await startInspectionExecution(inspection.projectInspectionId)
      const executionId = execution?._id
      if (executionId && userId) {
        setInspectionExecutionRecord(userId, inspection.projectInspectionId, {
          executionId,
          status: execution?.status || 'draft',
        })
        navigate(`/inspections/wizard?executionId=${executionId}`)
      } else {
        navigate(`/inspections/wizard?projectInspectionId=${inspection.projectInspectionId}`)
      }
    } catch (e) {
      setInspectionError(e?.response?.data?.error || 'Unable to open inspection.')
    }
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>Worker dashboard</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {loading && <Alert severity="info">Loading your assigned projects...</Alert>}

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
        <SummaryCard title="Assigned projects" value={counts.total} />
        <SummaryCard title="Inductions approved" value={counts.approved} color="success" />
        <SummaryCard title="Pending inductions" value={counts.pending} color="warning" />
      </Grid>
      <Card elevation={1} sx={{ borderRadius: 2 }}>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 700 }}>My inspections</Typography>
            <Chip size="small" label={inspections.length} />
          </Stack>
          {inspectionError && <Alert severity="warning" sx={{ mt: 2 }}>{inspectionError}</Alert>}
          {inspectionLoading && <Alert severity="info" sx={{ mt: 2 }}>Loading inspections...</Alert>}
          {!inspectionLoading && !inspections.length && (
            <Alert severity="info" sx={{ mt: 2 }}>No inspections pending.</Alert>
          )}
          <Stack spacing={2} sx={{ mt: 2 }}>
            {inspections.map((insp) => {
              const { chip, record } = inspectionStatusFor(insp)
              const submittedAt = record?.submittedAt ? formatDate(record.submittedAt) : null
              const buttonLabel =
                record?.status === 'submitted'
                  ? 'View inspection'
                  : record?.status === 'draft'
                    ? 'Resume inspection'
                    : 'Open inspection'
              return (
                <Card key={insp.projectInspectionId} variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Stack spacing={1}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{insp.projectName}</Typography>
                      <Typography variant="body2" color="text.secondary">{insp.templateName}</Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip size="small" label={inspectionTypeLabels[insp.type] || insp.type} />
                        <Chip size="small" label={chip.label} color={chip.color} variant="outlined" />
                      </Stack>
                      {submittedAt && (
                        <Typography variant="caption" color="text.secondary">
                          Submitted on {submittedAt}
                        </Typography>
                      )}
                      <Button variant="contained" size="small" onClick={() => handleOpenInspection(insp)}>
                        {buttonLabel}
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              )
            })}
          </Stack>
        </CardContent>
      </Card>

      <Card elevation={1} sx={{ borderRadius: 2 }}>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Completed inspections</Typography>
            <Chip size="small" label={completedRecords.length} />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Submitted inspection records assigned to you. Records are immutable and can be opened for audit review.
          </Typography>
          {historyError && <Alert severity="error" sx={{ mt: 2 }}>{historyError}</Alert>}
          {historyLoading && <Alert severity="info" sx={{ mt: 2 }}>Loading completed inspections...</Alert>}
          {!historyLoading && !completedRecords.length && (
            <Alert severity="info" sx={{ mt: 2 }}>No inspections submitted yet.</Alert>
          )}
          {!!completedRecords.length && (
            <Table size="small" sx={{ mt: 2 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Project</TableCell>
                  <TableCell>Template</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {completedRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{formatDate(record.submittedAt)}</TableCell>
                    <TableCell>{record.project?.name || 'Project'}</TableCell>
                    <TableCell>{record.template?.name || 'Inspection template'}</TableCell>
                    <TableCell>
                      <Chip label={record.status || 'submitted'} color="success" size="small" variant="outlined" />
                    </TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={() => navigate(`/inspection-records/${record.id}`)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card elevation={1} sx={{ borderRadius: 2 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Your assigned projects</Typography>
            <Chip size="small" label={projects.length} />
          </Stack>
          {!projects.length && !loading && (
            <Alert severity="info">No projects assigned yet. Please contact your manager for an assignment.</Alert>
          )}
          <Grid container spacing={2}>
            {projects.map((p) => {
              const pid = p._id || String(p._id)
              const managers = projectManagers[pid] || []
              const modules = projectModules[pid] || []
              return (
                <Grid item xs={12} md={6} key={p._id}>
                  <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Stack spacing={1.5}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{p.name}</Typography>
                          <Chip size="small" label={p.status} color={p.status === 'active' ? 'success' : p.status === 'archived' ? 'warning' : 'default'} />
                        </Stack>
                        {formatCoordinates(p.location) && (
                          <Typography variant="body2" color="text.secondary">
                            Coordinates: {formatCoordinates(p.location)}
                          </Typography>
                        )}
                        {p.address && <Typography variant="body2" color="text.secondary">{p.address}</Typography>}
                        <Typography variant="body2" color="text.secondary">{p.description || 'No description provided.'}</Typography>
                        <Stack spacing={1}>
                          <Typography variant="subtitle2">Induction modules</Typography>
                          {modules.length ? (
                            modules.map((mod) => {
                              const chip = moduleChip(mod.reviewStatus)
                              const submission = submissionMap[String(mod._id)] || submissionMap[mod._id]
                              const submissionInfo = getSubmissionInfo(submission)
                              return (
                                <Box key={mod._id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1 }}>
                                  <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{mod.name || 'Induction module'}</Typography>
                                    <Chip size="small" label={chip.label} color={chip.color} />
                                  </Stack>
                                  <Typography variant="body2" color="text.secondary">Status: {chip.label}</Typography>
                                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                                    <Chip size="small" label={submissionInfo.chip.label} color={submissionInfo.chip.color} variant="outlined" />
                                    <Typography variant="body2" color="text.secondary">{submissionInfo.message}</Typography>
                                  </Stack>
                                  {submissionInfo.alert && (
                                    <Alert severity="warning" variant="outlined" sx={{ mt: 1 }}>{submissionInfo.alert}</Alert>
                                  )}
                                  {submissionInfo.showButton && chip.color === 'success' && (
                                    <Button
                                      variant="contained"
                                      size="small"
                                      sx={{ mt: 1 }}
                                      onClick={() => navigate(`/wizard?projectId=${pid}&moduleId=${mod._id}`)}
                                    >
                                      Start induction
                                    </Button>
                                  )}
                                </Box>
                              )
                            })
                          ) : (
                            <Alert severity="info" variant="outlined">No induction modules available for this project.</Alert>
                          )}
                        </Stack>
                        <Stack spacing={0.5}>
                          <Typography variant="subtitle2" color="text.secondary">Project managers</Typography>
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
