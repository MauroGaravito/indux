import React, { useEffect, useState } from 'react'
import { Box, Grid, Card, CardContent, Typography, Button, Stack, TextField, MenuItem, Tabs, Tab, List, ListItemButton, ListItemIcon, ListItemText, CardHeader, Dialog, Chip } from '@mui/material'
import api from '../../utils/api.js'
import AsyncButton from '../../components/common/AsyncButton.jsx'
import ProjectInfoSection from '../../components/forms/admin/ProjectInfoSection.jsx'
import ProjectFieldsEditor from '../../components/admin/ProjectFieldsEditor.jsx'
import SlidesSection from '../../components/forms/admin/SlidesSection.jsx'
import QuestionsSection from '../../components/forms/admin/QuestionsSection.jsx'
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined'
import GroupIcon from '@mui/icons-material/Group'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import SaveIcon from '@mui/icons-material/Save'
import SendIcon from '@mui/icons-material/Send'
import InfoIcon from '@mui/icons-material/Info'
import PersonIcon from '@mui/icons-material/Person'
import SlideshowIcon from '@mui/icons-material/Slideshow'
import QuizIcon from '@mui/icons-material/Quiz'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import { useAuthStore } from '../../context/authStore.js'
import { notifyError, notifySuccess } from '../../context/notificationStore.js'

const emptyConfig = { projectInfo: {}, slides: {}, questions: [] }
const sanitizeConfig = (cfg = {}) => ({
  projectInfo: cfg?.projectInfo || {},
  slides: cfg?.slides || {},
  questions: Array.isArray(cfg?.questions) ? cfg.questions : []
})

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [createManagerId, setCreateManagerId] = useState('')
  const [config, setConfig] = useState(emptyConfig)
  const [tab, setTab] = useState(0)
  const [assignments, setAssignments] = useState([])
  const [users, setUsers] = useState([])
  const [assignOpen, setAssignOpen] = useState(false)
  const [assignUserId, setAssignUserId] = useState('')
  const [assignRole, setAssignRole] = useState('worker')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteSubCount, setDeleteSubCount] = useState(0)
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'admin'
  const [managers, setManagers] = useState([])
  const [hasPendingReview, setHasPendingReview] = useState(false)
  const [initialConfig, setInitialConfig] = useState(emptyConfig)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [selectedProjectDetail, setSelectedProjectDetail] = useState(null)

  const load = async () => {
    const r = await api.get('/projects')
    setProjects(r.data)
  }
  useEffect(()=> { load() }, [])
  // Preload users for manager select in create section (admins only)
  useEffect(() => {
    if (!isAdmin) return
    api.get('/users').then(r => {
      const list = Array.isArray(r.data) ? r.data : []
      setUsers(list.filter(u => u.role === 'manager'))
    }).catch(() => setUsers([]))
  }, [isAdmin])

  const createProject = async () => {
    const r = await api.post('/projects', { name, description: desc, steps: [] })
    try {
      const newId = r?.data?._id
      if (newId && createManagerId) {
        await api.post('/assignments', { user: createManagerId, project: newId, role: 'manager' })
      }
      notifySuccess('Project created successfully')
    } catch (_) {}
    setName(''); setDesc(''); setCreateManagerId('');
    await load()
  }

  const resetSelection = () => {
    setConfig(emptyConfig)
    setInitialConfig(emptyConfig)
    setAssignments([])
    setManagers([])
    setHasPendingReview(false)
    setSelectedProjectDetail(null)
  }

  const loadProjectDetail = async (id) => {
    try {
      const detailRes = await api.get(`/projects/${id}`)
      const detail = detailRes.data || {}
      setSelectedProjectDetail(detail)
      const nextCfg = sanitizeConfig(detail?.config || {})
      setConfig(nextCfg)
      setInitialConfig(nextCfg)
      setManagers(detail?.managers || [])
      setHasPendingReview(detail?.reviewStatus === 'pending')
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to load project details'
      notifyError(msg)
      resetSelection()
      return
    }
    try {
      const r = await api.get(`/assignments/project/${id}`)
      setAssignments(r.data || [])
    } catch {
      setAssignments([])
    }
  }

  const onSelect = (id) => {
    setSelectedId(id)
    setHasUnsavedChanges(false)
    if (!id) {
      resetSelection()
      return
    }
    loadProjectDetail(id)
  }

  const getSelectedProjectId = () => (typeof selectedId === 'object' ? selectedId?._id || selectedId?.id || '' : selectedId || '')

  const saveConfig = async () => {
    const projectId = getSelectedProjectId()
    if (!projectId) return
    try {
      await api.put(`/projects/${projectId}`, { config })
      notifySuccess('Project saved successfully')
      // Saving must not trigger or update any review
      setInitialConfig(config)
      setSelectedProjectDetail((prev) => (prev ? { ...prev, config } : prev))
      setHasUnsavedChanges(false)
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to save project'
      notifyError(msg)
    }
  }

  const sendForReview = async () => {
    const projectId = getSelectedProjectId()
    if (!projectId) return
    if (hasPendingReview && !hasUnsavedChanges) return
    try {
      // Backend will fetch the latest project config from DB; only send projectId
      const r = await api.post('/reviews/projects', { projectId })
      if (r?.status === 200 || r?.data?.ok) {
        notifySuccess('Existing review updated with latest project changes.')
      } else {
        notifySuccess('Review sent successfully.')
      }
      setHasPendingReview(true)
      setSelectedProjectDetail((prev) => (prev ? { ...prev, reviewStatus: 'pending' } : prev))
      setInitialConfig(config)
      setHasUnsavedChanges(false)
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to send review'
      notifyError(msg)
    }
  }

  const confirmDelete = async () => {
    const projectId = getSelectedProjectId()
    if (!projectId) return
    try {
      const r = await api.get('/submissions', { params: { projectId } })
      const list = Array.isArray(r?.data)
        ? r.data
        : (Array.isArray(r?.data?.items) ? r.data.items : [])
      setDeleteSubCount(list.length)
    } catch {
      setDeleteSubCount(0)
    }
    setDeleteOpen(true)
  }
  const closeDelete = () => { setDeleteOpen(false); setDeleteSubCount(0) }
  const doDelete = async () => {
    const projectId = getSelectedProjectId()
    if (!projectId) return
    try {
      const r = await api.delete(`/projects/${projectId}`)
      notifySuccess(r?.data?.message || 'Project deleted successfully')
      setProjects(prev => prev.filter(p => p._id !== selectedId))
      setSelectedId('')
      setConfig(emptyConfig)
      setAssignments([])
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || 'Failed to delete project'
      notifyError(msg)
    } finally {
      setDeleteOpen(false)
      setDeleteSubCount(0)
    }
  }

  const openAssign = async () => {
    setAssignOpen(true)
    // Fetch users on demand (admin only route)
    try {
      const r = await api.get('/users')
      const list = Array.isArray(r.data) ? r.data : []
      const filtered = isAdmin ? list.filter(u => u.role === 'manager') : list.filter(u => u.role === 'worker')
      setUsers(filtered)
    } catch { setUsers([]) }
  }
  const closeAssign = () => setAssignOpen(false)
  const doAssign = async () => {
    if (!selectedId || !assignUserId) return
    const role = isAdmin ? 'manager' : 'worker'
    await api.post('/assignments', { user: assignUserId, project: selectedId, role })
    setAssignUserId(''); setAssignRole('worker'); setAssignOpen(false)
    await loadProjectDetail(selectedId)
  }
  const removeAssignment = async (id) => {
    await api.delete(`/assignments/${id}`)
    await loadProjectDetail(selectedId)
  }

  const accent = '#1976d2'
  const cardStyles = {
    borderRadius: 3,
    p: 3,
    backgroundColor: '#fff',
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: '0 20px 45px rgba(15, 23, 42, 0.04)'
  }

  // Track unsaved changes comparing config vs initialConfig
  useEffect(() => {
    try {
      const a = JSON.stringify(initialConfig || {})
      const b = JSON.stringify(config || {})
      setHasUnsavedChanges(a !== b)
    } catch {
      // fall back to truthy change when stringify fails
      setHasUnsavedChanges(true)
    }
  }, [config, initialConfig])

  const currentProjectSummary = selectedProjectDetail || projects.find((p) => p._id === selectedId) || null
  const reviewStatus = currentProjectSummary?.reviewStatus || 'draft'
  const reviewStatusLabel = reviewStatus.charAt(0).toUpperCase() + reviewStatus.slice(1)
  const reviewStatusColorMap = { draft: 'default', pending: 'warning', approved: 'success', declined: 'error' }
  const reviewChipColor = reviewStatusColorMap[reviewStatus] || 'default'
  const isPendingReview = reviewStatus === 'pending'

  return (
    <>
      <Grid container spacing={3} alignItems="stretch">
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            <Card elevation={0} sx={cardStyles}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Projects</Typography>
              <List sx={{ p: 0, m: 0 }}>
                {projects.map(p => {
                  const selected = selectedId===p._id
                  return (
                    <ListItemButton
                      key={p._id}
                      selected={selected}
                      onClick={()=> onSelect(p._id)}
                      sx={{
                        borderRadius: 2,
                        mb: 1.5,
                        px: 2,
                        py: 1.5,
                        border: '1px solid',
                        borderColor: selected ? 'primary.main' : 'grey.200',
                        backgroundColor: selected ? 'rgba(25, 118, 210, 0.08)' : '#fff',
                        transition: 'all 0.2s ease',
                        '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.08)', borderColor: 'primary.main' },
                        '&.Mui-selected': { backgroundColor: 'rgba(25, 118, 210, 0.12)', borderColor: 'primary.main' },
                        '&.Mui-selected:hover': { backgroundColor: 'rgba(25, 118, 210, 0.16)' }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36, color: selected ? 'primary.main' : 'text.secondary' }}>
                        <FolderOutlinedIcon />
                      </ListItemIcon>
                      <ListItemText primary={p.name} primaryTypographyProps={{ fontWeight: 500 }} />
                    </ListItemButton>
                  )
                })}
              </List>
              {!projects.length && (
                <Box sx={{ textAlign: 'center', color: 'text.secondary', py: 4 }}>
                  <Typography variant="body2">No projects yet.</Typography>
                </Box>
              )}
            </Card>
            <Card elevation={0} sx={cardStyles}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Create Project</Typography>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Name"
                  placeholder="Project name"
                  value={name}
                  onChange={e=> setName(e.target.value)}
                />
                <TextField
                  fullWidth
                  label="Description"
                  placeholder="Short description"
                  value={desc}
                  onChange={e=> setDesc(e.target.value)}
                />
                {isAdmin && (
                  <TextField
                    select
                    fullWidth
                    label="Project Manager"
                    placeholder="Select manager"
                    value={createManagerId}
                    onChange={(e)=> setCreateManagerId(e.target.value)}
                  >
                    {(users.filter(u => u.role === 'manager') || []).map(u => (
                      <MenuItem key={u._id} value={u._id}>{u.name} ({u.email})</MenuItem>
                    ))}
                  </TextField>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <AsyncButton
                    startIcon={<AddCircleOutlineIcon />}
                    variant="contained"
                    size="large"
                    onClick={createProject}
                    disabled={!name}
                    sx={{ textTransform: 'none' }}
                  >
                    Create
                  </AsyncButton>
                </Box>
              </Stack>
            </Card>
          </Stack>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card elevation={0} sx={cardStyles}>
            <Stack spacing={3}>
              <Stack direction={{ xs:'column', md:'row' }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between">
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Edit Project</Typography>
                  {selectedId && (
                    <Chip label={`Status: ${reviewStatusLabel}`} color={reviewChipColor} variant="outlined" />
                  )}
                </Stack>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: { xs: 'flex-start', md: 'flex-end' }, width: { xs: '100%', md: 'auto' } }}>
                  <AsyncButton startIcon={<SaveIcon />} variant="contained" color="primary" size="large" onClick={saveConfig} disabled={!selectedId || !hasUnsavedChanges} sx={{ textTransform: 'none' }}>Save</AsyncButton>
                  <AsyncButton
                    startIcon={<SendIcon />}
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={sendForReview}
                    disabled={!selectedId || (isPendingReview && !hasUnsavedChanges)}
                    sx={{ textTransform: 'none' }}
                    title={(isPendingReview && !hasUnsavedChanges) ? 'This project is already pending review.' : ''}
                  >
                    {isPendingReview && hasUnsavedChanges ? 'Resend Updated Version' : 'Send For Review'}
                  </AsyncButton>
                  {isAdmin && !!selectedId && (
                    <Button startIcon={<DeleteForeverIcon />} color="error" variant="outlined" onClick={confirmDelete} sx={{ textTransform: 'none' }}>
                      Delete Project
                    </Button>
                  )}
                </Box>
              </Stack>
              {selectedId ? (
                <>
                  <Tabs value={tab} onChange={(_,v)=> setTab(v)} sx={{ borderBottom: '1px solid', borderColor: 'grey.200', '& .MuiTabs-indicator': { backgroundColor: accent } }}>
                    <Tab icon={<InfoIcon />} iconPosition="start" label="Project Info" sx={{ '&.Mui-selected': { color: accent } }} />
                    <Tab icon={<PersonIcon />} iconPosition="start" label="Fields" sx={{ '&.Mui-selected': { color: accent } }} />
                    <Tab icon={<SlideshowIcon />} iconPosition="start" label="Slides" sx={{ '&.Mui-selected': { color: accent } }} />
                    <Tab icon={<QuizIcon />} iconPosition="start" label="Questions" sx={{ '&.Mui-selected': { color: accent } }} />
                    <Tab icon={<GroupIcon />} iconPosition="start" label="Assigned Users" sx={{ '&.Mui-selected': { color: accent } }} />
                  </Tabs>
                  <Box sx={{ mt: 3 }} hidden={tab!==0}>
                    <ProjectInfoSection value={config.projectInfo} onChange={(val)=> setConfig({ ...config, projectInfo: val })} />
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Managers</Typography>
                      {managers && managers.length ? (
                        <List dense>
                          {managers.map((m) => (
                            <ListItemButton key={m._id} sx={{ cursor: 'default', borderRadius: 1 }}>
                              <ListItemIcon sx={{ minWidth: 36 }}><PersonIcon /></ListItemIcon>
                              <ListItemText primary={m.name || m.email || m._id} secondary={m.email || ''} />
                            </ListItemButton>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body2" sx={{ opacity: 0.7 }}>No managers assigned.</Typography>
                      )}
                    </Box>
                  </Box>
                  <Box sx={{ mt: 3 }} hidden={tab!==1}>
                    <ProjectFieldsEditor projectId={selectedId} />
                  </Box>
                  <Box sx={{ mt: 3 }} hidden={tab!==2}>
                    <SlidesSection value={config.slides} onChange={(val)=> setConfig({ ...config, slides: val })} />
                  </Box>
                  <Box sx={{ mt: 3 }} hidden={tab!==3}>
                    <QuestionsSection value={config.questions} onChange={(val)=> setConfig({ ...config, questions: val })} />
                  </Box>
                  <Box sx={{ mt: 3 }} hidden={tab!==4}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <GroupIcon color="action" />
                      <Typography variant="subtitle2">Assigned Users</Typography>
                      <Box sx={{ flex: 1 }} />
                      <Button variant="contained" onClick={openAssign} sx={{ textTransform: 'none' }}>{isAdmin ? 'Assign Manager' : 'Assign Worker'}</Button>
                    </Stack>
                    <List>
                      {assignments.map((a) => (
                        <ListItemButton key={a._id} sx={{ borderRadius: 1 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}><PersonIcon /></ListItemIcon>
                          <ListItemText primary={`${a?.user?.name || a?.user} - ${a.role}`} secondary={a?.user?.email || ''} />
                          <Button color="error" onClick={()=> removeAssignment(a._id)}>Remove</Button>
                        </ListItemButton>
                      ))}
                    </List>
                    {!assignments.length && (
                      <Typography variant="body2" sx={{ opacity: 0.7 }}>No users assigned to this project.</Typography>
                    )}
                  </Box>
                </>
              ) : (
                <Box sx={{ mt: 2, minHeight: 260, borderRadius: 2, border: '1px dashed', borderColor: 'divider', backgroundColor: 'grey.50', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'text.secondary' }}>
                  <Typography variant="body1">Select a project to edit.</Typography>
                </Box>
              )}
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* Assign Modal */}
    <Dialog open={assignOpen} onClose={closeAssign} maxWidth="sm" fullWidth>
      <CardHeader title={<Typography variant="subtitle1">{isAdmin ? 'Assign Project Manager' : 'Assign Worker to Project'}</Typography>} />
      <CardContent>
        <Stack spacing={2}>
          <TextField
            select
            label="User"
            value={assignUserId}
            onChange={(e)=> setAssignUserId(e.target.value)}
            helperText={isAdmin ? 'Select a manager to assign' : 'Select a worker to assign'}
          >
            {users.map(u => (
              <MenuItem key={u._id} value={u._id}>{u.name} ({u.email})</MenuItem>
            ))}
          </TextField>
          {!isAdmin && (
            <TextField
              select
              label="Role"
              value={assignRole}
              onChange={(e)=> setAssignRole(e.target.value)}
            >
              <MenuItem value="worker">Worker</MenuItem>
            </TextField>
          )}
        </Stack>
      </CardContent>
      <Stack direction="row" spacing={1} sx={{ px: 2, pb: 2, justifyContent: 'flex-end' }}>
        <Button onClick={closeAssign}>Cancel</Button>
        <AsyncButton variant="contained" disabled={!assignUserId} onClick={doAssign}>Assign</AsyncButton>
      </Stack>
    </Dialog>

    {/* Delete Project Confirmation */}
    <Dialog open={deleteOpen} onClose={closeDelete} maxWidth="xs" fullWidth>
      <CardHeader title={<Typography variant="subtitle1">{deleteSubCount > 0 ? `This project still has ${deleteSubCount} submissions.` : 'Delete Project'}</Typography>} />
      <CardContent>
        <Typography variant="body2">
          {deleteSubCount > 0
            ? 'Deleting this project will also delete all related submissions. This action cannot be undone.'
            : 'Are you sure? This action cannot be undone.'}
        </Typography>
      </CardContent>
      <Stack direction="row" spacing={1} sx={{ px: 2, pb: 2, justifyContent: 'flex-end' }}>
        <Button onClick={closeDelete}>Cancel</Button>
        <AsyncButton color="error" variant="contained" onClick={doDelete}>
          {deleteSubCount > 0 ? 'Delete Project & Submissions' : 'Delete'}
        </AsyncButton>
      </Stack>
    </Dialog>
    </>
  )
}

