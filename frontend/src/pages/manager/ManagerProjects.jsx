import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Box,
  Grid,
  Card,
  Typography,
  Stack,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab,
  Chip,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  IconButton
} from '@mui/material'
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined'
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined'
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import TextFieldsOutlinedIcon from '@mui/icons-material/TextFieldsOutlined'
import PinOutlinedIcon from '@mui/icons-material/PinOutlined'
import EventOutlinedIcon from '@mui/icons-material/EventOutlined'
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { Link as RouterLink } from 'react-router-dom'
import api from '../../utils/api.js'

const cardStyles = {
  borderRadius: 3,
  p: 3,
  bgcolor: '#fff',
  boxShadow: '0 8px 30px rgba(15, 23, 42, 0.03)'
}

const statusChipColor = (status) => {
  if (!status || status === 'pending') return 'warning'
  if (status === 'approved') return 'success'
  if (status === 'declined' || status === 'rejected') return 'error'
  return 'default'
}

const fieldTypeIcon = (type) => {
  switch (type) {
    case 'text':
      return <TextFieldsOutlinedIcon color="primary" />
    case 'number':
      return <PinOutlinedIcon color="secondary" />
    case 'date':
      return <EventOutlinedIcon color="action" />
    case 'select':
      return <ListAltOutlinedIcon color="info" />
    case 'boolean':
      return <CheckCircleOutlineIcon color="success" />
    case 'file':
    case 'document':
      return <AttachFileOutlinedIcon color="warning" />
    case 'photo':
    case 'image':
      return <ImageOutlinedIcon color="success" />
    default:
      return <TextFieldsOutlinedIcon color="disabled" />
  }
}

const ManagerFieldEditor = ({ projectId, editable, fields, reloadFields, loading, error }) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState('create')
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [form, setForm] = useState({
    id: null,
    label: '',
    helpText: '',
    required: true,
    order: 0,
    type: 'text',
    key: '',
    optionsText: ''
  })

  const resetForm = () => {
    setForm({
      id: null,
      label: '',
      helpText: '',
      required: true,
      order: fields.length ? Math.max(...fields.map((f) => f?.order ?? 0)) + 1 : 0,
      type: 'text',
      key: `field_${Date.now()}`,
      optionsText: ''
    })
    setFormError('')
  }

  const openCreateDialog = () => {
    resetForm()
    setDialogMode('create')
    setDialogOpen(true)
  }

  const openEditDialog = (field) => {
    setForm({
      id: field._id,
      label: field.label || '',
      helpText: field.helpText || '',
      required: !!field.required,
      order: field.order ?? 0,
      type: field.type || 'text',
      key: field.key || '',
      optionsText: Array.isArray(field.options) ? field.options.join('\n') : ''
    })
    setFormError('')
    setDialogMode('edit')
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setFormError('')
  }

  const closeDeleteDialog = () => {
    setDeleteTarget(null)
    setDeleteLoading(false)
  }

  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const parsedOptions = () =>
    form.type === 'select'
      ? form.optionsText
          .split('\n')
          .map((o) => o.trim())
          .filter(Boolean)
      : undefined

  const submitField = async () => {
    if (!projectId) return
    if (!form.label.trim()) {
      setFormError('Label is required')
      return
    }
    setSaving(true)
    setFormError('')
    const payload = {
      projectId,
      step: 'personal',
      label: form.label.trim(),
      helpText: form.helpText?.trim() || undefined,
      required: !!form.required,
      order: Number.isFinite(Number(form.order)) ? Number(form.order) : 0,
      options: parsedOptions(),
      key: form.key,
      type: form.type
    }
    try {
      if (dialogMode === 'create') {
        await api.post(`/projects/${projectId}/fields`, payload)
      } else {
        await api.put(`/fields/${form.id}`, payload)
      }
      closeDialog()
      await reloadFields()
    } catch (e) {
      const msg = e?.response?.data?.error || e?.response?.data?.message || 'Failed to save field'
      setFormError(msg)
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await api.delete(`/fields/${deleteTarget._id}`)
      closeDeleteDialog()
      await reloadFields()
    } catch (e) {
      setDeleteLoading(false)
    }
  }

  const renderList = () => (
    <List sx={{ mt: 2 }}>
      {fields.map((field) => (
        <ListItem key={field._id || field.key} divider alignItems="flex-start" sx={{ opacity: field.locked ? 0.6 : 1 }}>
          <ListItemIcon sx={{ minWidth: 48, mt: 0.5 }}>
            {fieldTypeIcon(field.type)}
          </ListItemIcon>
          <Box sx={{ flexGrow: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {field.label}
              </Typography>
              {field.required && <Chip size="small" color="error" label="Required" />}
              {field.locked && <Chip size="small" color="default" label="Locked" />}
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Key: {field.key} • Type: {field.type} • Order: {typeof field.order === 'number' ? field.order : '-'}
            </Typography>
            {field.helpText && (
              <Typography variant="caption" color="text.secondary" display="block">
                {field.helpText}
              </Typography>
            )}
          </Box>
          {editable && !field.locked && (
            <Stack direction="row" spacing={1}>
              <IconButton size="small" onClick={() => openEditDialog(field)}>
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" color="error" onClick={() => setDeleteTarget(field)}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Stack>
          )}
        </ListItem>
      ))}
    </List>
  )

  return (
    <Card sx={cardStyles}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Project Form</Typography>
          <Typography variant="caption" color="text.secondary">
            This form is controlled by Admin / Manager.
          </Typography>
        </Box>
        {editable && (
          <Button variant="contained" sx={{ textTransform: 'none' }} onClick={openCreateDialog}>
            Add Field
          </Button>
        )}
      </Stack>
      {loading && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Loading project fields…
        </Typography>
      )}
      {error && !loading && (
        <Typography variant="body2" color="error.main" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
      {!loading && !error && !fields.length && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          No custom fields defined for this project.
        </Typography>
      )}
      {!!fields.length && renderList()}

      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{dialogMode === 'create' ? 'Add Field' : 'Edit Field'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Label"
              value={form.label}
              onChange={(e) => handleInputChange('label', e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Help Text"
              value={form.helpText}
              onChange={(e) => handleInputChange('helpText', e.target.value)}
              fullWidth
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Order"
                type="number"
                value={form.order}
                onChange={(e) => handleInputChange('order', e.target.value)}
                fullWidth
              />
              <FormControlLabel
                control={<Switch checked={form.required} onChange={(e) => handleInputChange('required', e.target.checked)} />}
                label="Required"
              />
            </Stack>
            <TextField label="Field Key" value={form.key} fullWidth disabled helperText="Managed by admin" />
            <TextField label="Field Type" value={form.type} fullWidth disabled helperText="Managed by admin" />
            {form.type === 'select' && (
              <TextField
                label="Options"
                value={form.optionsText}
                onChange={(e) => handleInputChange('optionsText', e.target.value)}
                fullWidth
                multiline
                minRows={3}
                helperText="One option per line"
              />
            )}
            {formError && (
              <Typography variant="caption" color="error.main">
                {formError}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button variant="contained" onClick={submitField} disabled={saving}>
            {dialogMode === 'create' ? 'Create Field' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteTarget} onClose={closeDeleteDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Field</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2">
            Are you sure you want to remove this field? Workers will no longer be asked for this item.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button color="error" variant="contained" onClick={confirmDelete} disabled={deleteLoading}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default function ManagerProjects() {
  const [projects, setProjects] = useState([])
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [projectsError, setProjectsError] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [selectedProject, setSelectedProject] = useState(null)
  const [tab, setTab] = useState(0)

  const [team, setTeam] = useState([])
  const [teamLoading, setTeamLoading] = useState(false)
  const [teamError, setTeamError] = useState('')

  const [submissions, setSubmissions] = useState([])
  const [submissionsLoading, setSubmissionsLoading] = useState(false)
  const [submissionsError, setSubmissionsError] = useState('')

  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewsError, setReviewsError] = useState('')
  const [fields, setFields] = useState([])
  const [fieldsLoading, setFieldsLoading] = useState(false)
  const [fieldsError, setFieldsError] = useState('')
  const orderedFields = useMemo(() => {
    return [...fields].sort((a, b) => {
      const orderA = typeof a?.order === 'number' ? a.order : 0
      const orderB = typeof b?.order === 'number' ? b.order : 0
      return orderA - orderB
    })
  }, [fields])

  useEffect(() => {
    let active = true
    async function loadProjects() {
      setLoadingProjects(true)
      setProjectsError('')
      try {
        const r = await api.get('/projects')
        const list = Array.isArray(r.data) ? r.data : []
        if (!active) return
        setProjects(list)
        if (!selectedProjectId && list.length) {
          setSelectedProjectId(list[0]._id)
          setSelectedProject(list[0])
        } else if (selectedProjectId) {
          const next = list.find((p) => p._id === selectedProjectId) || null
          setSelectedProject(next)
        }
      } catch (e) {
        if (!active) return
        setProjectsError(e?.response?.data?.message || 'Failed to load projects')
        setProjects([])
        setSelectedProject(null)
        setSelectedProjectId('')
      } finally {
        if (active) setLoadingProjects(false)
      }
    }
    loadProjects()
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!selectedProjectId) {
      setTeam([])
      setSubmissions([])
      setReviews([])
      return
    }
    const project = projects.find((p) => p._id === selectedProjectId) || null
    setSelectedProject(project)
  }, [selectedProjectId, projects])

  useEffect(() => {
    if (!selectedProjectId) return
    let active = true
    async function loadTeam() {
      setTeamLoading(true)
      setTeamError('')
      try {
        const r = await api.get(`/assignments/project/${selectedProjectId}`)
        const list = Array.isArray(r.data) ? r.data : []
        if (active) setTeam(list.filter((a) => a.role === 'worker'))
      } catch (e) {
        if (active) {
          setTeamError(e?.response?.data?.message || 'Failed to load team')
          setTeam([])
        }
      } finally {
        if (active) setTeamLoading(false)
      }
    }
    loadTeam()
    return () => { active = false }
  }, [selectedProjectId])

  const loadProjectFields = useCallback(async () => {
    if (!selectedProjectId) {
      setFields([])
      setFieldsError('')
      return
    }
    setFieldsLoading(true)
    setFieldsError('')
    try {
      const r = await api.get(`/projects/${selectedProjectId}/fields`)
      setFields(Array.isArray(r.data) ? r.data : [])
    } catch (e) {
      setFieldsError(e?.response?.data?.message || 'Failed to load project fields')
      setFields([])
    } finally {
      setFieldsLoading(false)
    }
  }, [selectedProjectId])

  useEffect(() => {
    let active = true
    const run = async () => {
      if (!active) return
      await loadProjectFields()
    }
    run()
    return () => { active = false }
  }, [loadProjectFields])

  useEffect(() => {
    if (!selectedProjectId) return
    let active = true
    async function loadSubmissions() {
      setSubmissionsLoading(true)
      setSubmissionsError('')
      try {
        const r = await api.get('/submissions', { params: { status: 'all', projectId: selectedProjectId } })
        const list = Array.isArray(r.data) ? r.data : []
        if (active) setSubmissions(list.filter((s) => {
          const pid = typeof s?.projectId === 'string' ? s.projectId : s?.projectId?._id
          return !selectedProjectId || pid === selectedProjectId
        }))
      } catch (e) {
        if (active) {
          setSubmissionsError(e?.response?.data?.message || 'Failed to load submissions')
          setSubmissions([])
        }
      } finally {
        if (active) setSubmissionsLoading(false)
      }
    }
    loadSubmissions()
    return () => { active = false }
  }, [selectedProjectId])

  useEffect(() => {
    if (!selectedProjectId) return
    let active = true
    async function loadReviews() {
      setReviewsLoading(true)
      setReviewsError('')
      try {
        const r = await api.get('/reviews/projects')
        const list = Array.isArray(r.data) ? r.data : []
        if (active) {
          setReviews(list.filter((rev) => {
            const pid = typeof rev?.projectId === 'string' ? rev.projectId : rev?.projectId?._id
            return pid === selectedProjectId
          }))
        }
      } catch (e) {
        if (active) {
          setReviewsError(e?.response?.data?.message || 'Failed to load review history')
          setReviews([])
        }
      } finally {
        if (active) setReviewsLoading(false)
      }
    }
    loadReviews()
    return () => { active = false }
  }, [selectedProjectId])

  const metrics = useMemo(() => {
    const totalWorkers = team.length
    const totalSubmissions = submissions.length
    const pendingSubmissions = submissions.filter((s) => !s?.status || s.status === 'pending').length
    const lastReview = [...reviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
    return { totalWorkers, totalSubmissions, pendingSubmissions, lastReview }
  }, [team, submissions, reviews])

  const renderProjectList = () => (
    <Card sx={cardStyles}>
      <Stack spacing={2}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>My Projects</Typography>
        {loadingProjects && <Typography variant="body2" color="text.secondary">Loading projects...</Typography>}
        {projectsError && <Typography variant="body2" color="error.main">{projectsError}</Typography>}
        {!loadingProjects && !projects.length && (
          <Typography variant="body2" color="text.secondary">You have no assigned projects yet.</Typography>
        )}
        <List sx={{ p: 0, m: 0 }}>
          {projects.map((project) => {
            const selected = selectedProjectId === project._id
            return (
              <ListItemButton
                key={project._id}
                selected={selected}
                onClick={() => setSelectedProjectId(project._id)}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  border: '1px solid',
                  borderColor: selected ? 'primary.main' : 'grey.200',
                  backgroundColor: selected ? 'rgba(25, 118, 210, 0.08)' : '#fff'
                }}
              >
                <ListItemIcon sx={{ color: selected ? 'primary.main' : 'text.secondary', minWidth: 40 }}>
                  <FolderOutlinedIcon />
                </ListItemIcon>
                <ListItemText
                  primary={project.name}
                  primaryTypographyProps={{ fontWeight: selected ? 600 : 500 }}
                  secondary={project.description || 'Active'}
                  secondaryTypographyProps={{ color: 'text.secondary' }}
                />
              </ListItemButton>
            )
          })}
        </List>
      </Stack>
    </Card>
  )

  const renderConfigurationTab = () => {
    const project = selectedProject || {}
    const steps = Array.isArray(project?.steps) ? [...project.steps].sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0)) : []
    const config = project?.config || {}
    const trainingSources = [
      ...(Array.isArray(config?.slides) ? config.slides : []),
      ...(Array.isArray(config?.uploads) ? config.uploads : []),
      ...(Array.isArray(config?.training) ? config.training : [])
    ]
    const trainingMaterials = trainingSources.map((item, idx) => ({
      id: item?._id || item?.id || item?.key || `material-${idx}`,
      title: item?.title || item?.name || item?.label || `Material ${idx + 1}`,
      description: item?.description || item?.subtitle || item?.notes || '',
      meta: item?.file || item?.filename || item?.key || item?.url || ''
    }))
    const quizQuestions = Array.isArray(config?.questions) ? config.questions : []
    const quizStep = steps.find((s) => s.key === 'quiz')
    const passMark = typeof quizStep?.pass_mark === 'number' ? quizStep.pass_mark : 'N/A'
    const stepIcon = (key) => {
      switch (key) {
        case 'personal': return <AssignmentIndOutlinedIcon color="primary" />
        case 'uploads': return <AttachFileOutlinedIcon color="secondary" />
        case 'slides': return <ImageOutlinedIcon color="info" />
        case 'quiz': return <ListAltOutlinedIcon color="warning" />
        case 'sign': return <CheckCircleOutlineIcon color="success" />
        default: return <FolderOutlinedIcon color="action" />
      }
    }
    const questionText = (question, idx) => (
      question?.questionText || question?.text || question?.question || `Question ${idx + 1}`
    )

    return (
      <Box sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={cardStyles}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Workflow Steps</Typography>
              {!steps.length && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  No workflow steps defined for this project.
                </Typography>
              )}
              {!!steps.length && (
                <List sx={{ mt: 2 }}>
                  {steps.map((step) => (
                    <ListItem key={`${step.key}-${step.order ?? '0'}`} divider sx={{ opacity: step?.enabled === false ? 0.5 : 1 }}>
                      <ListItemIcon sx={{ minWidth: 48 }}>
                        {stepIcon(step.key)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {step.key ? step.key.charAt(0).toUpperCase() + step.key.slice(1) : 'Step'}
                            </Typography>
                            {step?.required && <Chip size="small" color="error" label="Required" />}
                            {step?.enabled === false && <Chip size="small" color="default" label="Disabled" />}
                          </Stack>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            Order: {step?.order ?? '-'} • Version: {step?.version ?? '-'}
                            {typeof step?.pass_mark === 'number' && <> • Pass Mark: {step.pass_mark}</>}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card sx={cardStyles}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Personal Details Requirements</Typography>
              {fieldsLoading && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Loading custom fields…
                </Typography>
              )}
              {fieldsError && !fieldsLoading && (
                <Typography variant="body2" color="error.main" sx={{ mt: 2 }}>
                  {fieldsError}
                </Typography>
              )}
              {!fieldsLoading && !fieldsError && !orderedFields.length && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  No custom fields defined for this project.
                </Typography>
              )}
              {!fieldsLoading && !!orderedFields.length && (
                <List sx={{ mt: 2 }}>
                  {orderedFields.map((field) => (
                    <ListItem key={field._id || field.key} divider alignItems="flex-start">
                      <ListItemIcon sx={{ minWidth: 48, mt: 0.5 }}>
                        {fieldTypeIcon(field.type)}
                      </ListItemIcon>
                      <Box sx={{ flexGrow: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {field.label}
                          </Typography>
                          {field.required && <Chip size="small" color="error" label="Required" />}
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          Type: {field.type} • Order: {typeof field.order === 'number' ? field.order : '-'}
                        </Typography>
                        {field.helpText && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {field.helpText}
                          </Typography>
                        )}
                      </Box>
                    </ListItem>
                  ))}
                </List>
              )}
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card sx={cardStyles}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Training Materials</Typography>
              {!trainingMaterials.length && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  No training materials configured for this project.
                </Typography>
              )}
              {!!trainingMaterials.length && (
                <List sx={{ mt: 2 }}>
                  {trainingMaterials.map((item) => (
                    <ListItem key={item.id} divider alignItems="flex-start">
                      <ListItemText
                        primary={<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{item.title}</Typography>}
                        secondary={
                          <>
                            {item.description && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                {item.description}
                              </Typography>
                            )}
                            {item.meta && (
                              <Typography variant="caption" color="text.secondary">
                                {item.meta}
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card sx={cardStyles}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Quiz Overview</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Total Questions</Typography>
                  <Typography variant="h6">{quizQuestions.length}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Pass Mark</Typography>
                  <Typography variant="h6">{passMark}</Typography>
                </Box>
              </Stack>
              {!quizQuestions.length && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  No quiz configured for this project.
                </Typography>
              )}
              {!!quizQuestions.length && (
                <Stack spacing={1.5} sx={{ mt: 2 }}>
                  {quizQuestions.map((question, idx) => (
                    <Box
                      key={`question-${idx}`}
                      component="details"
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        p: 1.5,
                        backgroundColor: 'grey.50'
                      }}
                    >
                      <Box component="summary" sx={{ cursor: 'pointer', fontWeight: 600 }}>
                        {`Question ${idx + 1}`}
                      </Box>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {questionText(question, idx)}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </Card>
          </Grid>
        </Grid>
      </Box>
    )
  }

  const projectFormTab = (
    <Box sx={{ mt: 3 }}>
      <ManagerFieldEditor
        projectId={selectedProjectId}
        editable={Boolean(selectedProject?.editableByManagers !== false)}
        fields={orderedFields}
        reloadFields={loadProjectFields}
        loading={fieldsLoading}
        error={fieldsError}
      />
    </Box>
  )

  const overviewTab = (
    <Box sx={{ mt: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" color="text.secondary">Name</Typography>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedProject?.name || '-'}</Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" color="text.secondary">Status</Typography>
          <Chip
            size="small"
            label={selectedProject?.status || 'Active'}
            color={statusChipColor(selectedProject?.status)}
            sx={{ mt: 0.5 }}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle2" color="text.secondary">Description</Typography>
          <Typography variant="body1">{selectedProject?.description || 'No description provided.'}</Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" color="text.secondary">Created</Typography>
          <Typography variant="body2">{selectedProject?.createdAt ? new Date(selectedProject.createdAt).toLocaleString() : '-'}</Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" color="text.secondary">Last Updated</Typography>
          <Typography variant="body2">{selectedProject?.updatedAt ? new Date(selectedProject.updatedAt).toLocaleString() : '-'}</Typography>
        </Grid>
      </Grid>
      <Divider sx={{ my: 3 }} />
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, p: 2, bgcolor: 'grey.50', boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <PeopleAltOutlinedIcon color="primary" />
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Team Members</Typography>
                <Typography variant="h6">{metrics.totalWorkers}</Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, p: 2, bgcolor: 'grey.50', boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <TimelineOutlinedIcon color="primary" />
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Total Submissions</Typography>
                <Typography variant="h6">{metrics.totalSubmissions}</Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, p: 2, bgcolor: 'grey.50', boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <AssignmentIndOutlinedIcon color="primary" />
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Pending</Typography>
                <Typography variant="h6">{metrics.pendingSubmissions}</Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>
      {reviewsError && <Typography variant="body2" color="error.main" sx={{ mt: 2 }}>{reviewsError}</Typography>}
      {metrics.lastReview && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" color="text.secondary">Last Review</Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }}>
            <Chip size="small" label={metrics.lastReview.status} color={statusChipColor(metrics.lastReview.status)} />
            <Typography variant="body2" color="text.secondary">
              {metrics.lastReview.updatedAt ? new Date(metrics.lastReview.updatedAt).toLocaleString() : metrics.lastReview.createdAt ? new Date(metrics.lastReview.createdAt).toLocaleString() : ''}
            </Typography>
          </Stack>
        </Box>
      )}
    </Box>
  )

  const teamTab = (
    <Box sx={{ mt: 3 }}>
      {teamLoading && <Typography variant="body2" color="text.secondary">Loading team...</Typography>}
      {teamError && <Typography variant="body2" color="error.main">{teamError}</Typography>}
      {!teamLoading && !team.length && (
        <Typography variant="body2" color="text.secondary">No workers assigned to this project yet.</Typography>
      )}
      {!!team.length && (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Worker</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Assigned At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {team.map((member) => (
              <TableRow key={member._id} hover>
                <TableCell>{member?.user?.name || member.user}</TableCell>
                <TableCell>{member?.user?.email || '-'}</TableCell>
                <TableCell>{member?.createdAt ? new Date(member.createdAt).toLocaleString() : '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  )

  const activityTab = (
    <Box sx={{ mt: 3 }}>
      {submissionsLoading && <Typography variant="body2" color="text.secondary">Loading submissions...</Typography>}
      {submissionsError && <Typography variant="body2" color="error.main">{submissionsError}</Typography>}
      {!submissionsLoading && !submissions.length && (
        <Typography variant="body2" color="text.secondary">No submissions yet for this project.</Typography>
      )}
      {!!submissions.length && (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Worker</TableCell>
              <TableCell>Submitted At</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {submissions.map((submission) => {
              const worker = submission?.userId || submission?.user || {}
              return (
                <TableRow key={submission._id} hover>
                  <TableCell>{worker?.name || submission?.userId || '-'}</TableCell>
                  <TableCell>{submission?.createdAt ? new Date(submission.createdAt).toLocaleString() : '-'}</TableCell>
                  <TableCell>
                    <Chip size="small" color={statusChipColor(submission.status)} label={submission.status || 'pending'} />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="outlined"
                      component={RouterLink}
                      to="/manager/review"
                      sx={{ textTransform: 'none' }}
                    >
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
    </Box>
  )

  const renderDetails = () => {
    if (!selectedProject) {
      return (
        <Card sx={cardStyles}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Project Details</Typography>
          <Box
            sx={{
              mt: 2,
              borderRadius: 2,
              border: '1px dashed',
              borderColor: 'divider',
              bgcolor: 'grey.50',
              minHeight: 240,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              color: 'text.secondary'
            }}
          >
            Select a project on the left to view details.
          </Box>
        </Card>
      )
    }

    return (
      <Card sx={cardStyles}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>{selectedProject?.name}</Typography>
        {selectedProject?.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {selectedProject.description}
          </Typography>
        )}
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mt: 3, borderBottom: '1px solid', borderColor: 'grey.200' }}>
          <Tab label="Overview" />
          <Tab label="Team" />
          <Tab label="Activity" />
          <Tab label="Configuration" />
          <Tab label="Project Form" />
        </Tabs>
        <Box hidden={tab !== 0}>{overviewTab}</Box>
        <Box hidden={tab !== 1}>{teamTab}</Box>
        <Box hidden={tab !== 2}>{activityTab}</Box>
        <Box hidden={tab !== 3}>{renderConfigurationTab()}</Box>
        <Box hidden={tab !== 4}>{projectFormTab}</Box>
      </Card>
    )
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>Projects</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          {renderProjectList()}
        </Grid>
        <Grid item xs={12} md={8}>
          {renderDetails()}
        </Grid>
      </Grid>
    </Box>
  )
}



