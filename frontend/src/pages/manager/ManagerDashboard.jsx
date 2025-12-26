import React, { useEffect, useState } from 'react'
import { Grid, Card, CardContent, Typography, Stack, Button, Alert, Chip } from '@mui/material'
import api from '../../utils/api.js'
import { fetchProjectModules } from '../../utils/modules.js'
import { fetchProjectInspections, listInspectionTemplates, startInspectionExecution } from '../../utils/inspections.js'
import { getInspectionExecutionRecord, setInspectionExecutionRecord } from '../../utils/inspectionStorage.js'
import { useAuthStore } from '../../store/auth.js'
import { useNavigate } from 'react-router-dom'

const metricDefinitions = [
  { label: 'Assigned projects', key: 'projects' },
  { label: 'Pending submissions', key: 'submissions' },
  { label: 'Modules pending review', key: 'modules' },
]

const inspectionTypeLabels = {
  daily: 'Daily',
  weekly: 'Weekly',
  adhoc: 'Ad-hoc',
}

export default function ManagerDashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [metrics, setMetrics] = useState({ projects: 0, submissions: 0, modules: 0 })
  const [error, setError] = useState('')
  const [assignments, setAssignments] = useState([])
  const [pendingInspections, setPendingInspections] = useState([])
  const [inspectionError, setInspectionError] = useState('')
  const [inspectionLoading, setInspectionLoading] = useState(false)

  const loadInspectionsForAssignments = async (list) => {
    if (!list?.length) {
      setPendingInspections([])
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
        list.map(async (entry) => {
          const project = entry.project || {}
          const projectId = project._id || entry.project
          if (!projectId) return
          try {
            const inspections = await fetchProjectInspections(projectId)
            inspections.forEach((insp) => {
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
            // ignore per-project failures
          }
        })
      )
      setPendingInspections(rows)
    } catch (e) {
      setInspectionError(e?.response?.data?.error || 'Unable to load inspections.')
      setPendingInspections([])
    } finally {
      setInspectionLoading(false)
    }
  }

  useEffect(() => {
    if (!user?.id) return
    let isCancelled = false

    const loadMetrics = async () => {
      try {
        const resp = await api.get(`/assignments/user/${user.id}`)
        const list = (resp.data || []).filter((a) => a.role === 'manager' && a.project && a.project.status !== 'archived')
        if (isCancelled) return
        setMetrics((prev) => ({ ...prev, projects: list.length }))
        setAssignments(list)
        loadInspectionsForAssignments(list)

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
      <Card elevation={1} sx={{ borderRadius: 2 }}>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Pending inspections</Typography>
            <Chip size="small" label={pendingInspections.length} />
          </Stack>
          {inspectionError && <Alert severity="warning" sx={{ mt: 2 }}>{inspectionError}</Alert>}
          {inspectionLoading && <Alert severity="info" sx={{ mt: 2 }}>Loading inspections...</Alert>}
          {!inspectionLoading && !pendingInspections.length && (
            <Alert severity="info" sx={{ mt: 2 }}>No inspections pending.</Alert>
          )}
          <Stack spacing={2} sx={{ mt: 2 }}>
            {pendingInspections.map((insp) => (
              <Card key={`${insp.projectInspectionId}`} variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{insp.projectName}</Typography>
                      <Typography variant="body2" color="text.secondary">{insp.templateName}</Typography>
                      <Chip size="small" label={inspectionTypeLabels[insp.type] || insp.type} />
                    </Stack>
                    <Button variant="contained" onClick={() => handleRunInspection(insp)}>
                      Run inspection
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
  const handleRunInspection = async (inspection) => {
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
      setInspectionError(e?.response?.data?.error || 'Unable to start inspection.')
    }
  }
