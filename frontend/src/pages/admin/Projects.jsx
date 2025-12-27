import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  TextField,
  MenuItem,
  Divider,
  Tabs,
  Tab,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CardHeader,
  Dialog,
  Chip,
  Snackbar,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper
} from '@mui/material'
import FolderIcon from '@mui/icons-material/Folder'
import GroupIcon from '@mui/icons-material/Group'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import SaveIcon from '@mui/icons-material/Save'
import InfoIcon from '@mui/icons-material/Info'
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd'
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import FactCheckIcon from '@mui/icons-material/FactCheck'
import api from '../../utils/api.js'
import AsyncButton from '../../components/AsyncButton.jsx'
import ProjectInfoSection from '../../components/admin/ProjectInfoSection.jsx'
import { useTheme } from '@mui/material/styles'
import { useAuthStore } from '../../store/auth.js'
import CreateModuleDialog from '../../components/admin/CreateModuleDialog.jsx'
import WorkerModuleAssignmentDialog from '../../components/WorkerModuleAssignmentDialog.jsx'
import { fetchProjectModules } from '../../utils/modules.js'
import { DEFAULT_MAP_ZOOM, DEFAULT_PROJECT_LOCATION } from '../../constants/location.js'
import { fetchProjectInspectionRecords } from '../../utils/inspections.js'

export default function Projects() {
  const theme = useTheme()
  const accent = theme.palette.primary.main
  const navigate = useNavigate()
  const { projectId: projectIdParam } = useParams()
  const { user } = useAuthStore()

  const createEmptyForm = () => ({
    name: '',
    description: '',
    address: '',
    status: 'draft',
    location: { ...DEFAULT_PROJECT_LOCATION },
    mapZoom: DEFAULT_MAP_ZOOM,
    pointsOfInterest: [],
  })

  const [projects, setProjects] = useState([])
  const [archivedProjects, setArchivedProjects] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [projectForm, setProjectForm] = useState(createEmptyForm())
  const [sectionTab, setSectionTab] = useState(0)
  const [assignments, setAssignments] = useState([])
  const [managerUsers, setManagerUsers] = useState([])
  const [assignOpen, setAssignOpen] = useState(false)
  const [assignUserId, setAssignUserId] = useState('')
  const [assignWorkerOpen, setAssignWorkerOpen] = useState(false)
  const [assignWorkerId, setAssignWorkerId] = useState('')
  const [workerUsers, setWorkerUsers] = useState([])
  const [newProject, setNewProject] = useState({ name: '', description: '' })
  const [modules, setModules] = useState([])
  const [modulesLoading, setModulesLoading] = useState(false)
  const [inspections, setInspections] = useState([])
  const [inspectionsLoading, setInspectionsLoading] = useState(false)
  const [inspectionTemplates, setInspectionTemplates] = useState([])
  const [inspectionHistory, setInspectionHistory] = useState([])
  const [inspectionHistoryLoading, setInspectionHistoryLoading] = useState(false)
  const [inspectionHistoryError, setInspectionHistoryError] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false)
  const [inspectionToDeactivate, setInspectionToDeactivate] = useState(null)
  const [deactivating, setDeactivating] = useState(false)
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false)
  const [moduleActionLoading, setModuleActionLoading] = useState(false)
  const [moduleAssignmentDialogOpen, setModuleAssignmentDialogOpen] = useState(false)
  const [moduleAssignmentTarget, setModuleAssignmentTarget] = useState(null)
  const [moduleAssignmentInitial, setModuleAssignmentInitial] = useState([])
  const [moduleAssignmentSaving, setModuleAssignmentSaving] = useState(false)

  const loadProjects = async () => {
    try {
      const r = await api.get('/projects', { params: { includeArchived: true } })
      const list = r.data || []
      setProjects(list.filter((p) => p.status !== 'archived'))
      setArchivedProjects(list.filter((p) => p.status === 'archived'))
    } catch {
      setProjects([])
      setArchivedProjects([])
    }
  }

  const loadAssignments = async (projectId) => {
    if (!projectId) return setAssignments([])
    try {
      const r = await api.get(`/assignments/project/${projectId}`)
      setAssignments(r.data || [])
    } catch {
      setAssignments([])
    }
  }

  const loadModulesForProject = async (projectId) => {
    if (!projectId) {
      setModules([])
      return
    }
    setModulesLoading(true)
    try {
      const list = await fetchProjectModules(projectId)
      setModules(list)
    } catch {
      setModules([])
    } finally {
      setModulesLoading(false)
    }
  }

  const loadInspectionsForProject = async (projectId) => {
    if (!projectId) {
      setInspections([])
      setInspectionHistory([])
      setInspectionHistoryError('')
      setInspectionHistoryLoading(false)
      return
    }
    setInspectionsLoading(true)
    setInspectionHistoryLoading(true)
    setInspectionHistoryError('')
    try {
      const resp = await api.get(`/projects/${projectId}/inspections`)
      setInspections(resp.data?.inspections || [])
    } catch {
      setInspections([])
    } finally {
      setInspectionsLoading(false)
    }

    try {
      const records = await fetchProjectInspectionRecords(projectId)
      setInspectionHistory(records)
    } catch (err) {
      setInspectionHistory([])
      setInspectionHistoryError(err?.response?.data?.error || 'Unable to load inspection history.')
    } finally {
      setInspectionHistoryLoading(false)
    }
  }

  const loadInspectionTemplates = async () => {
    try {
      const resp = await api.get('/inspection-templates')
      setInspectionTemplates(resp.data?.templates || resp.data || [])
    } catch {
      setInspectionTemplates([])
    }
  }

  // Select project based on param or first selection
  useEffect(() => {
    loadProjects()
    loadInspectionTemplates()
  }, [])

  useEffect(() => {
    if (!projects.length) return
    const initialId = projectIdParam || selectedId || projects[0]?._id || ''
    if (initialId && initialId !== selectedId) {
      selectProject(initialId)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, projectIdParam])

  const selectProject = async (id) => {
    setSelectedId(id)
    setSectionTab(0)
    const p = projects.find((x) => x._id === id)
    if (p) {
      setProjectForm({
        name: p.name || '',
        description: p.description || '',
        address: p.address || '',
        status: p.status || 'draft',
        location:
          p.location && typeof p.location.lat === 'number' && typeof p.location.lng === 'number'
            ? p.location
            : { ...DEFAULT_PROJECT_LOCATION },
        mapZoom: typeof p.mapZoom === 'number' ? p.mapZoom : DEFAULT_MAP_ZOOM,
        pointsOfInterest: Array.isArray(p.pointsOfInterest) ? p.pointsOfInterest : [],
      })
      await Promise.all([loadAssignments(id), loadModulesForProject(id), loadInspectionsForProject(id)])
      if (id) navigate(`/admin/projects/${id}`, { replace: true })
    } else {
      setProjectForm(createEmptyForm())
      setAssignments([])
      setModules([])
      setInspections([])
      setInspectionHistory([])
      setInspectionHistoryError('')
      setInspectionHistoryLoading(false)
      navigate('/admin/projects', { replace: true })
    }
  }

  const createProject = async () => {
    if (!newProject.name) return
    await api.post('/projects', {
      name: newProject.name,
      description: newProject.description,
      location: { ...DEFAULT_PROJECT_LOCATION },
      mapZoom: DEFAULT_MAP_ZOOM,
      pointsOfInterest: [],
    })
    setNewProject({ name: '', description: '' })
    await loadProjects()
  }

  const saveProject = async () => {
    if (!selectedId) return
    await api.put(`/projects/${selectedId}`, projectForm)
    await loadProjects()
  }

  const archiveProject = async () => {
    if (!selectedId || projectForm.status === 'archived') return
    const confirmed = window.confirm('Archive this project? It will be hidden for managers and workers.')
    if (!confirmed) return
    await api.put(`/projects/${selectedId}/archive`)
    setSelectedId('')
    setProjectForm(createEmptyForm())
    setAssignments([])
    setModules([])
    await loadProjects()
    navigate('/admin/projects', { replace: true })
  }

  const restoreProject = async (id) => {
    const confirmed = window.confirm('Restore this project?')
    if (!confirmed) return
    try {
      const r = await api.put(`/projects/${id}`, { status: 'active' })
      const restored = r.data
      setArchivedProjects((prev) => prev.filter((p) => p._id !== id))
      setProjects((prev) => [restored, ...prev])
      setSelectedId('')
      setProjectForm(createEmptyForm())
      setAssignments([])
      setModules([])
    } catch (e) {
      setErrorMsg(e?.response?.data?.error || 'Failed to restore project')
    }
  }

  const openAssign = async () => {
    setAssignOpen(true)
    try {
      const r = await api.get('/users')
      setManagerUsers((r.data || []).filter((u) => u.role === 'manager'))
    } catch {
      setManagerUsers([])
    }
  }
  const closeAssign = () => setAssignOpen(false)
  const doAssign = async () => {
    if (!selectedId || !assignUserId) return
    await api.post('/assignments', { user: assignUserId, project: selectedId, role: 'manager' })
    setAssignUserId('')
    setAssignOpen(false)
    await loadAssignments(selectedId)
  }
  const removeAssignment = async (id) => {
    await api.delete(`/assignments/${id}`)
    await loadAssignments(selectedId)
  }

  const openAssignWorker = async () => {
    setAssignWorkerOpen(true)
    try {
      const r = await api.get('/users')
      const existingWorkerIds = new Set(
        assignments
          .filter((a) => a.role === 'worker')
          .map((a) => String(a?.user?._id || a?.user))
      )
      const options = (r.data || [])
        .filter((u) => u.role === 'worker')
        .filter((u) => !existingWorkerIds.has(String(u._id)))
      setWorkerUsers(options)
    } catch {
      setWorkerUsers([])
    }
  }
  const closeAssignWorker = () => setAssignWorkerOpen(false)
  const doAssignWorker = async () => {
    if (!selectedId || !assignWorkerId) return
    await api.post('/assignments', { user: assignWorkerId, project: selectedId, role: 'worker' })
    setAssignWorkerId('')
    setAssignWorkerOpen(false)
    await loadAssignments(selectedId)
  }

  const handleModuleCreated = (mod) => {
    setModuleDialogOpen(false)
    if (mod?._id && selectedId) {
      navigate(`/admin/projects/${selectedId}/modules/induction/${mod._id}`)
    } else if (selectedId) {
      loadModulesForProject(selectedId)
    }
  }

  const openModule = (moduleId) => {
    if (!selectedId || !moduleId) return
    navigate(`/admin/projects/${selectedId}/modules/induction/${moduleId}`)
  }

  const deleteModule = async (moduleId) => {
    if (!moduleId || !selectedId) return
    const confirmed = window.confirm('Remove this induction module? All reviews and submissions for it will also be deleted.')
    if (!confirmed) return
    try {
      setModuleActionLoading(true)
      await api.delete(`/modules/${moduleId}`)
      await loadModulesForProject(selectedId)
    } catch (e) {
      setErrorMsg(e?.response?.data?.error || 'Failed to delete induction module')
    } finally {
      setModuleActionLoading(false)
    }
  }

  const openWorkerModuleDialog = (assignment) => {
    setModuleAssignmentTarget(assignment)
    const seed = (assignment?.modules || []).map((id) => String(id))
    setModuleAssignmentInitial(seed)
    setModuleAssignmentDialogOpen(true)
  }

  const openDeactivateInspection = (inspection) => {
    setInspectionToDeactivate(inspection)
    setDeactivateDialogOpen(true)
  }

  const closeDeactivateInspection = () => {
    if (deactivating) return
    setDeactivateDialogOpen(false)
    setInspectionToDeactivate(null)
  }

  const handleDeactivateInspection = async () => {
    if (!inspectionToDeactivate?._id) return
    setDeactivating(true)
    try {
      await api.patch(`/project-inspections/${inspectionToDeactivate._id}/deactivate`)
      closeDeactivateInspection()
      if (selectedId) {
        await loadInspectionsForProject(selectedId)
      }
    } catch (e) {
      setErrorMsg(e?.response?.data?.error || 'Failed to deactivate inspection.')
    } finally {
      setDeactivating(false)
    }
  }

  const closeWorkerModuleDialog = () => {
    if (moduleAssignmentSaving) return
    setModuleAssignmentDialogOpen(false)
    setModuleAssignmentTarget(null)
    setModuleAssignmentInitial([])
  }

  const handleSaveWorkerModules = async (moduleIds) => {
    if (!moduleAssignmentTarget) return
    setModuleAssignmentSaving(true)
    try {
      await api.put(`/assignments/${moduleAssignmentTarget._id}/modules`, { modules: moduleIds })
      closeWorkerModuleDialog()
      if (selectedId) await loadAssignments(selectedId)
    } catch (e) {
      setErrorMsg(e?.response?.data?.error || 'Failed to update worker modules.')
    } finally {
      setModuleAssignmentSaving(false)
    }
  }

  const sectionTabs = useMemo(() => ([
    { label: 'Overview', icon: <InfoIcon /> },
    { label: 'Setup', icon: <SettingsApplicationsIcon /> },
    { label: 'Induction', icon: <MenuBookIcon /> },
    { label: 'Inspections', icon: <FactCheckIcon /> }
  ]), [])

  const moduleNameMap = useMemo(() => {
    const map = new Map()
    modules.forEach((m) => {
      map.set(String(m._id), m.name || 'Induction module')
    })
    return map
  }, [modules])

  const inspectionTemplateMap = useMemo(() => {
    const map = new Map()
    inspectionTemplates.forEach((tpl) => map.set(String(tpl._id), tpl.name || 'Inspection template'))
    return map
  }, [inspectionTemplates])

  const inspectionRows = useMemo(() => {
    const labelMap = { daily: 'Daily', weekly: 'Weekly', adhoc: 'Ad-hoc' }
    return inspections.map((insp) => {
      const templateName = inspectionTemplateMap.get(String(insp.templateId)) || 'Inspection template'
      return {
        ...insp,
        templateName,
        typeLabel: labelMap[insp.type] || insp.type || 'Inspection',
      }
    })
  }, [inspections, inspectionTemplateMap])

  const formattedLocation =
    projectForm.location && typeof projectForm.location.lat === 'number' && typeof projectForm.location.lng === 'number'
      ? `${projectForm.location.lat.toFixed(4)}, ${projectForm.location.lng.toFixed(4)}`
      : 'Not set'
  const poiCount = Array.isArray(projectForm.pointsOfInterest) ? projectForm.pointsOfInterest.length : 0
  const approvedModules = modules.filter((m) => m.reviewStatus === 'approved').length
  const pendingModules = modules.length - approvedModules
  const activeInspections = inspections.length
  const summaryItems = [
    { label: 'Project name', value: projectForm.name || 'Untitled project' },
    { label: 'Address', value: projectForm.address || 'Not provided' },
    { label: 'Location', value: formattedLocation },
    { label: 'Default zoom', value: projectForm.mapZoom || DEFAULT_MAP_ZOOM },
    { label: 'Points of interest', value: poiCount },
  ]

  const goToInspectionsWorkspace = () => {
    if (selectedId) navigate(`/admin/inspections/projects/${selectedId}`)
  }

  const managerAssignments = useMemo(() => assignments.filter((a) => a.role === 'manager'), [assignments])
  const workerAssignments = useMemo(() => assignments.filter((a) => a.role === 'worker'), [assignments])

  return (
    <>
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <Stack spacing={2}>
          <Card elevation={1} sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <CardHeader title={<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Project register</Typography>} />
            <CardContent>
              <List sx={{ mb: 1 }}>
                {projects.map(p => {
                  const selected = selectedId === p._id
                  return (
                    <ListItemButton key={p._id} selected={selected} onClick={() => selectProject(p._id)} sx={{ borderRadius: 1 }}>
                      <ListItemIcon sx={{ minWidth: 36, color: selected ? accent : 'action.active' }}>
                        <FolderIcon />
                      </ListItemIcon>
                      <ListItemText primary={p.name} secondary={p.status} primaryTypographyProps={{ fontWeight: selected ? 600 : 400 }} />
                    </ListItemButton>
                  )
                })}
                {!projects.length && <Typography variant="body2" sx={{ opacity: 0.7, px: 2, py: 1 }}>No active projects yet.</Typography>}
              </List>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Add new project</Typography>
              <Stack spacing={1}>
                <TextField size="small" label="Project name" value={newProject.name} onChange={e => setNewProject({ ...newProject, name: e.target.value })} />
                <TextField size="small" label="Short description" value={newProject.description} onChange={e => setNewProject({ ...newProject, description: e.target.value })} />
                <AsyncButton variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={createProject} disabled={!newProject.name}>
                  Add project
                </AsyncButton>
              </Stack>
            </CardContent>
          </Card>

          {user?.role === 'admin' && (
            <Card elevation={1} sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <CardHeader title={<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Archived projects</Typography>} />
              <CardContent>
                <List sx={{ mb: 1 }}>
                  {archivedProjects.map((p) => (
                    <ListItemButton key={p._id} sx={{ borderRadius: 1 }}>
                      <ListItemIcon sx={{ minWidth: 36, color: 'action.active' }}>
                        <FolderIcon />
                      </ListItemIcon>
                      <ListItemText primary={p.name} secondary={p.status} />
                      <Button size="small" variant="outlined" onClick={() => restoreProject(p._id)}>
                        Restore project
                      </Button>
                    </ListItemButton>
                  ))}
                  {!archivedProjects.length && <Typography variant="body2" sx={{ opacity: 0.7, px: 2, py: 1 }}>No archived projects.</Typography>}
                </List>
              </CardContent>
            </Card>
          )}
        </Stack>
      </Grid>

      <Grid item xs={12} md={8}>
        <Card elevation={1} sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <CardContent>
            {selectedId ? (
              <Stack spacing={3}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="h6">Project overview</Typography>
                  <Chip label={projectForm.status || 'draft'} />
                  <Box sx={{ flex: 1 }} />
                  {projectForm.status !== 'archived' && (
                    <Button color="error" variant="outlined" onClick={archiveProject}>Archive project</Button>
                  )}
                  <AsyncButton startIcon={<SaveIcon />} variant="contained" onClick={saveProject}>Save project</AsyncButton>
                </Stack>

                <Tabs value={sectionTab} onChange={(_, v) => setSectionTab(v)} sx={{ borderBottom: '1px solid #eee', '& .MuiTabs-indicator': { backgroundColor: accent } }}>
                  {sectionTabs.map((t, idx) => (
                    <Tab key={t.label} icon={t.icon} iconPosition="start" label={t.label} sx={{ '&.Mui-selected': { color: accent } }} value={idx} />
                  ))}
                </Tabs>

                <Box hidden={sectionTab !== 0}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardHeader title="Project summary" subheader="Read-only snapshot of the key context." />
                        <CardContent>
                          <Stack spacing={1}>
                            {summaryItems.map((item) => (
                              <Box key={item.label}>
                                <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                                <Typography variant="body1">{item.value}</Typography>
                              </Box>
                            ))}
                          </Stack>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2 }}>
                            <Button size="small" onClick={() => setSectionTab(1)}>Edit details</Button>
                            {selectedId && (
                              <Button size="small" onClick={() => navigate(`/admin/projects/${selectedId}/location`)}>Open map editor</Button>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardHeader title="Project team" subheader="Current manager and worker assignments." />
                        <CardContent>
                          <Stack spacing={1}>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>{managerAssignments.length}</Typography>
                            <Typography variant="body2" color="text.secondary">Assigned managers</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>{workerAssignments.length}</Typography>
                            <Typography variant="body2" color="text.secondary">Assigned workers</Typography>
                          </Stack>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2 }}>
                            <Button variant="contained" onClick={() => setSectionTab(1)}>Manage team</Button>
                            <Button variant="outlined" onClick={openAssignWorker}>Assign worker</Button>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardHeader title="Induction modules" subheader="Active learning content within this project." />
                        <CardContent>
                          <Typography variant="h4" sx={{ fontWeight: 700 }}>{modules.length}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Approved: {approvedModules} · Draft/Pending: {pendingModules}
                          </Typography>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2 }}>
                            <Button variant="contained" onClick={() => setSectionTab(2)}>Manage modules</Button>
                            <Button variant="outlined" onClick={() => setModuleDialogOpen(true)}>Create module</Button>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardHeader title="Project inspections" subheader="Templates currently active for the Inspection Wizard." />
                        <CardContent>
                          <Typography variant="h4" sx={{ fontWeight: 700 }}>{activeInspections}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Activated templates ready to run inspections on-site.
                          </Typography>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2 }}>
                            <Button variant="contained" onClick={() => setSectionTab(3)}>View summary</Button>
                            <Button variant="outlined" onClick={goToInspectionsWorkspace}>Open inspection workspace</Button>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>

                <Box hidden={sectionTab !== 1}>
                  <Stack spacing={3}>
                    <Card variant="outlined">
                      <CardHeader title="Project configuration" subheader="Edit metadata, map settings, and points of interest." />
                      <CardContent>
                        <ProjectInfoSection
                          value={projectForm}
                          onChange={(val) => setProjectForm(val)}
                          onOpenFullMap={selectedId ? () => navigate(`/admin/projects/${selectedId}/location`) : undefined}
                        />
                      </CardContent>
                    </Card>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                          <CardHeader
                            avatar={<AssignmentIndIcon color="action" />}
                            title="Assigned managers"
                            subheader="Managers control modules, reviews, and team oversight."
                            action={<Button variant="contained" onClick={openAssign}>Assign manager</Button>}
                          />
                          <CardContent>
                            <List sx={{ py: 0 }}>
                              {managerAssignments.map((a) => (
                                <ListItemButton key={a._id} sx={{ borderRadius: 1 }}>
                                  <ListItemIcon sx={{ minWidth: 36 }}><GroupIcon /></ListItemIcon>
                                  <ListItemText primary={a?.user?.name || a?.user} secondary={a?.user?.email || ''} />
                                  <Button color="error" onClick={() => removeAssignment(a._id)}>Remove</Button>
                                </ListItemButton>
                              ))}
                            </List>
                            {!managerAssignments.length && (
                              <Typography variant="body2" color="text.secondary">No managers assigned to this project.</Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                          <CardHeader
                            avatar={<GroupIcon color="action" />}
                            title="Assigned workers"
                            subheader="Control which workers can access this project and which modules they must finish."
                            action={<Button variant="contained" onClick={openAssignWorker}>Assign worker</Button>}
                          />
                          <CardContent>
                            <List sx={{ py: 0 }}>
                              {workerAssignments.map((a) => (
                                <ListItemButton key={a._id} sx={{ borderRadius: 1, alignItems: 'flex-start' }}>
                                  <ListItemIcon sx={{ minWidth: 36 }}><GroupIcon /></ListItemIcon>
                                  <ListItemText primary={a?.user?.name || a?.user} secondary={a?.user?.email || ''} />
                                  <Stack spacing={1} alignItems="flex-end">
                                    <Typography variant="caption" color="text.secondary">
                                      Assigned modules:{' '}
                                      {a.modules && a.modules.length
                                        ? (() => {
                                          const names = a.modules.map((id) => moduleNameMap.get(String(id)) || 'Induction module')
                                          const preview = names.slice(0, 3).join(', ')
                                          return names.length > 3 ? `${preview} (+${names.length - 3} more)` : preview
                                        })()
                                        : 'All modules'}
                                    </Typography>
                                    <Stack direction="row" spacing={1}>
                                      <Button variant="outlined" size="small" onClick={() => openWorkerModuleDialog(a)}>
                                        Assign modules
                                      </Button>
                                      <Button color="error" size="small" onClick={() => removeAssignment(a._id)}>Remove</Button>
                                    </Stack>
                                  </Stack>
                                </ListItemButton>
                              ))}
                            </List>
                            {!workerAssignments.length && (
                              <Typography variant="body2" color="text.secondary">No workers assigned to this project.</Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Stack>
                </Box>

                <Box hidden={sectionTab !== 2}>
                  <Card variant="outlined">
                    <CardHeader
                      title="Manage induction modules"
                      subheader="Create, clone, or remove modules that workers must complete."
                      action={<Button variant="contained" onClick={() => setModuleDialogOpen(true)}>Create module</Button>}
                    />
                    <CardContent>
                      {modulesLoading && (
                        <Alert severity="info" sx={{ mb: 1 }}>Loading induction modules...</Alert>
                      )}
                      {!modulesLoading && modules.length === 0 && (
                        <Alert severity="info">No induction modules have been created. Create one to get started.</Alert>
                      )}
                      {!modulesLoading && modules.length > 0 && (
                        <Stack spacing={1.5}>
                          {modules.map((mod) => (
                            <Stack key={mod._id} direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center" justifyContent="space-between" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1.5 }}>
                              <Stack spacing={0.5}>
                                <Typography variant="body1">{mod.name || 'Induction module'}</Typography>
                                <Typography variant="body2" color="text.secondary">Status: {mod.reviewStatus || 'draft'}</Typography>
                              </Stack>
                              <Stack direction="row" spacing={1}>
                                <Button variant="contained" onClick={() => openModule(mod._id)}>
                                  Open module
                                </Button>
                                <Button
                                  color="error"
                                  variant="outlined"
                                  disabled={moduleActionLoading}
                                  onClick={() => deleteModule(mod._id)}
                                >
                                  Remove
                                </Button>
                              </Stack>
                            </Stack>
                          ))}
                        </Stack>
                      )}
                    </CardContent>
                  </Card>
                </Box>

                <Box hidden={sectionTab !== 3}>
                  <Card variant="outlined">
                    <CardHeader
                      title="Project inspections"
                      subheader="Activations control which templates appear in the Inspection Wizard."
                      action={selectedId && (
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                          <Button variant="contained" onClick={goToInspectionsWorkspace}>Open workspace</Button>
                          <Button variant="outlined" onClick={goToInspectionsWorkspace}>Activate template</Button>
                        </Stack>
                      )}
                    />
                    <CardContent>
                      {inspectionsLoading && <Alert severity="info">Loading inspections...</Alert>}
                      {!inspectionsLoading && !inspectionRows.length && (
                        <Alert severity="info">No inspections have been activated yet.</Alert>
                      )}
                      {!inspectionsLoading && inspectionRows.length > 0 && (
                        <Stack spacing={1.5}>
                          {inspectionRows.map((insp) => (
                        <Stack key={insp._id} direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1.5 }}>
                          <Stack spacing={0.5}>
                            <Typography variant="body1">{insp.templateName}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Type: {insp.typeLabel}
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip label="Active" color="success" size="small" />
                            <Button color="error" variant="outlined" size="small" onClick={() => openDeactivateInspection(insp)}>
                              Deactivate
                            </Button>
                          </Stack>
                        </Stack>
                      ))}
                    </Stack>
                  )}
                  <Typography variant="h6" sx={{ mt: 3, fontWeight: 600 }}>Inspection history</Typography>
                  {inspectionHistoryError && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                      {inspectionHistoryError}
                    </Alert>
                  )}
                  {inspectionHistoryLoading && (
                    <Alert severity="info" sx={{ mt: 1 }}>
                      Loading inspection history...
                    </Alert>
                  )}
                  {!inspectionHistoryLoading && !inspectionHistoryError && inspectionHistory.length > 0 ? (
                    <Table component={Paper} size="small" sx={{ mt: 1 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell>Template</TableCell>
                          <TableCell>Executed by</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell align="right">Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {inspectionHistory.map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell>{entry.template?.name || 'Inspection template'}</TableCell>
                            <TableCell>
                              <Typography variant="body2">{entry.executedBy?.name || 'User'}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {entry.executedBy?.role || ''}
                              </Typography>
                            </TableCell>
                            <TableCell>{entry.submittedAt ? new Date(entry.submittedAt).toLocaleString() : '—'}</TableCell>
                            <TableCell>
                              <Chip label={entry.status || 'submitted'} color="success" size="small" variant="outlined" />
                            </TableCell>
                            <TableCell align="right">
                              <Button size="small" onClick={() => navigate(`/inspection-records/${entry.id}`)}>
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : null}
                  {!inspectionHistoryLoading && !inspectionHistoryError && inspectionHistory.length === 0 && (
                    <Alert severity="info" sx={{ mt: 1 }}>
                      No inspections submitted yet.
                    </Alert>
                  )}
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Use the workspace to activate templates or launch new inspections. Review history is read-only in v1.
                  </Typography>
                </CardContent>
              </Card>
            </Box>
              </Stack>
            ) : (
              <Typography variant="body2" sx={{ mt: 2, opacity: 0.7 }}>Select a project to view details.</Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>

    {/* Assign User Modal */}
    <Dialog open={assignOpen} onClose={closeAssign} maxWidth="sm" fullWidth>
      <CardHeader title={<Typography variant="subtitle1">Assign project manager</Typography>} />
      <CardContent>
        <Stack spacing={2}>
          <TextField
            select
            label="Manager"
            value={assignUserId}
            onChange={(e) => setAssignUserId(e.target.value)}
            helperText="Only users with the manager role are listed"
          >
            {managerUsers.map((u) => (
              <MenuItem key={u._id} value={u._id}>
                {u.name} ({u.email})
              </MenuItem>
            ))}
          </TextField>
          <Typography variant="caption" color="text.secondary">
            This assigns project managers. Worker assignments are handled in the Manager team view.
          </Typography>
        </Stack>
      </CardContent>
      <Stack direction="row" spacing={1} sx={{ px: 2, pb: 2, justifyContent: 'flex-end' }}>
        <Button onClick={closeAssign}>Cancel</Button>
        <AsyncButton variant="contained" disabled={!assignUserId} onClick={doAssign}>Assign</AsyncButton>
      </Stack>
    </Dialog>
    <Dialog open={assignWorkerOpen} onClose={closeAssignWorker} maxWidth="sm" fullWidth>
      <CardHeader title={<Typography variant="subtitle1">Assign worker to project</Typography>} />
      <CardContent>
        <Stack spacing={2}>
          <TextField
            select
            label="Worker"
            value={assignWorkerId}
            onChange={(e) => setAssignWorkerId(e.target.value)}
            helperText="Only unassigned workers are listed"
          >
            {workerUsers.map((u) => (
              <MenuItem key={u._id} value={u._id}>
                {u.name} ({u.email})
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </CardContent>
      <Stack direction="row" spacing={1} sx={{ px: 2, pb: 2, justifyContent: 'flex-end' }}>
        <Button onClick={closeAssignWorker}>Cancel</Button>
        <AsyncButton variant="contained" disabled={!assignWorkerId} onClick={doAssignWorker}>Assign</AsyncButton>
      </Stack>
    </Dialog>
    <Dialog open={deactivateDialogOpen} onClose={closeDeactivateInspection} maxWidth="xs" fullWidth>
      <CardHeader title={<Typography variant="subtitle1">Deactivate inspection</Typography>} />
      <CardContent>
        <Typography variant="body2">
          This will hide the inspection "{inspectionToDeactivate?.templateName || 'Inspection'}" from the project. Executions remain in the system.
        </Typography>
      </CardContent>
      <Stack direction="row" spacing={1} sx={{ px: 2, pb: 2, justifyContent: 'flex-end' }}>
        <Button onClick={closeDeactivateInspection} disabled={deactivating}>Cancel</Button>
        <AsyncButton variant="contained" color="error" loading={deactivating} onClick={handleDeactivateInspection}>
          Deactivate
        </AsyncButton>
      </Stack>
    </Dialog>
    <Snackbar open={!!errorMsg} autoHideDuration={4000} onClose={() => setErrorMsg('')}>
      <Alert severity="error" onClose={() => setErrorMsg('')}>{errorMsg}</Alert>
    </Snackbar>
    <CreateModuleDialog
      projectId={selectedId}
      open={moduleDialogOpen}
      onClose={() => setModuleDialogOpen(false)}
      onCreated={handleModuleCreated}
    />
    <WorkerModuleAssignmentDialog
      open={moduleAssignmentDialogOpen}
      workerName={moduleAssignmentTarget?.user?.name || ''}
      modules={modules}
      initialSelection={moduleAssignmentInitial}
      onClose={closeWorkerModuleDialog}
      onSubmit={handleSaveWorkerModules}
      loading={moduleAssignmentSaving}
    />
    </>
  )
}
