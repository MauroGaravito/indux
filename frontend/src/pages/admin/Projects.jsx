import React, { useEffect, useState } from 'react'
import { Box, Grid, Card, CardContent, Typography, Button, Stack, TextField, MenuItem, Divider, Tabs, Tab, List, ListItemButton, ListItemIcon, ListItemText, CardHeader, Dialog } from '@mui/material'
import api from '../../utils/api.js'
import AsyncButton from '../../components/AsyncButton.jsx'
import ProjectInfoSection from '../../components/admin/ProjectInfoSection.jsx'
import PersonalDetailsSection from '../../components/admin/PersonalDetailsSection.jsx'
import SlidesSection from '../../components/admin/SlidesSection.jsx'
import QuestionsSection from '../../components/admin/QuestionsSection.jsx'
import FolderIcon from '@mui/icons-material/Folder'
import GroupIcon from '@mui/icons-material/Group'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import SaveIcon from '@mui/icons-material/Save'
import SendIcon from '@mui/icons-material/Send'
import InfoIcon from '@mui/icons-material/Info'
import PersonIcon from '@mui/icons-material/Person'
import SlideshowIcon from '@mui/icons-material/Slideshow'
import QuizIcon from '@mui/icons-material/Quiz'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import { useAuthStore } from '../../store/auth.js'
import { notifyError, notifySuccess } from '../../notifications/store.js'

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [config, setConfig] = useState({ projectInfo: {}, personalDetails: {}, slides: {}, questions: [] })
  const [tab, setTab] = useState(0)
  const [assignments, setAssignments] = useState([])
  const [users, setUsers] = useState([])
  const [assignOpen, setAssignOpen] = useState(false)
  const [assignUserId, setAssignUserId] = useState('')
  const [assignRole, setAssignRole] = useState('worker')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'admin'
  const [managers, setManagers] = useState([])
  const [hasPendingReview, setHasPendingReview] = useState(false)

  const load = async () => {
    const r = await api.get('/projects')
    setProjects(r.data)
  }
  useEffect(()=> { load() }, [])

  const createProject = async () => {
    await api.post('/projects', { name, description: desc, steps: [] })
    setName(''); setDesc('');
    await load()
  }

  const onSelect = (id) => {
    setSelectedId(id)
    const p = projects.find(x => x._id === id)
    setConfig(p?.config || { projectInfo: {}, personalDetails: {}, slides: {}, questions: [] })
    // load assignments for this project
    if (id) {
      api.get(`/assignments/project/${id}`).then(r => setAssignments(r.data || [])).catch(()=> setAssignments([]))
      // also fetch managers via project detail endpoint
      api.get(`/projects/${id}`).then(r => setManagers(r.data?.managers || [])).catch(()=> setManagers([]))
      // check pending reviews for this project
      api.get('/reviews/projects').then(r => {
        const list = r.data || []
        const pending = list.some((rev) => String(rev?.projectId?._id || rev.projectId) === String(id))
        setHasPendingReview(pending)
      }).catch(()=> setHasPendingReview(false))
    } else {
      setAssignments([])
      setManagers([])
      setHasPendingReview(false)
    }
  }

  const saveConfig = async () => {
    if (!selectedId) return
    await api.put(`/projects/${selectedId}`, { config })
  }

  const sendForReview = async () => {
    if (!selectedId) return
    if (hasPendingReview) return
    await api.post('/reviews/projects', { projectId: selectedId, data: config })
    setHasPendingReview(true)
  }

  const confirmDelete = () => setDeleteOpen(true)
  const closeDelete = () => setDeleteOpen(false)
  const doDelete = async () => {
    if (!selectedId) return
    try {
      const r = await api.delete(`/projects/${selectedId}`)
      notifySuccess(r?.data?.message || 'Project deleted successfully')
      setProjects(prev => prev.filter(p => p._id !== selectedId))
      setSelectedId('')
      setConfig({ projectInfo: {}, personalDetails: {}, slides: {}, questions: [] })
      setAssignments([])
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || 'Failed to delete project'
      notifyError(msg)
    } finally {
      setDeleteOpen(false)
    }
  }

  const openAssign = async () => {
    setAssignOpen(true)
    // Fetch users on demand (admin only route)
    try { const r = await api.get('/users'); setUsers(r.data || []) } catch { setUsers([]) }
  }
  const closeAssign = () => setAssignOpen(false)
  const doAssign = async () => {
    if (!selectedId || !assignUserId) return
    await api.post('/assignments', { user: assignUserId, project: selectedId, role: assignRole })
    setAssignUserId(''); setAssignRole('worker'); setAssignOpen(false)
    const r = await api.get(`/assignments/project/${selectedId}`)
    setAssignments(r.data || [])
    // refresh managers list in case a manager was assigned
    try { const pr = await api.get(`/projects/${selectedId}`); setManagers(pr.data?.managers || []) } catch { setManagers([]) }
  }
  const removeAssignment = async (id) => {
    await api.delete(`/assignments/${id}`)
    const r = await api.get(`/assignments/project/${selectedId}`)
    setAssignments(r.data || [])
    // refresh managers if a manager assignment was removed
    try { const pr = await api.get(`/projects/${selectedId}`); setManagers(pr.data?.managers || []) } catch { setManagers([]) }
  }

  const accent = '#1976d2'

  return (
    <>
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <Card elevation={1} sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <CardHeader title={<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Projects</Typography>} />
          <CardContent>
            <List sx={{ mb: 1 }}>
              {projects.map(p => {
                const selected = selectedId===p._id
                return (
                  <ListItemButton key={p._id} selected={selected} onClick={()=> onSelect(p._id)} sx={{ borderRadius: 1 }}>
                    <ListItemIcon sx={{ minWidth: 36, color: selected ? accent : 'action.active' }}>
                      <FolderIcon />
                    </ListItemIcon>
                    <ListItemText primary={p.name} primaryTypographyProps={{ fontWeight: selected ? 600 : 400 }} />
                  </ListItemButton>
                )
              })}
              {!projects.length && <Typography variant="body2" sx={{ opacity: 0.7, px: 2, py: 1 }}>No projects yet.</Typography>}
            </List>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Create Project</Typography>
            <Stack direction="row" spacing={1}>
              <TextField size="small" label="Name" value={name} onChange={e=> setName(e.target.value)} />
              <TextField size="small" label="Description" value={desc} onChange={e=> setDesc(e.target.value)} />
            </Stack>
            <AsyncButton startIcon={<AddCircleOutlineIcon />} sx={{ mt: 1, textTransform: 'none' }} variant="contained" onClick={createProject} disabled={!name}>Create</AsyncButton>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={8}>
        <Card elevation={1} sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <CardContent>
            <Stack direction={{ xs:'column', md:'row' }} justifyContent="space-between" alignItems={{ md:'center' }} spacing={1}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Edit Project</Typography>
              <Stack direction="row" spacing={1}>
                <AsyncButton startIcon={<SaveIcon />} variant="outlined" onClick={saveConfig} disabled={!selectedId} sx={{ textTransform: 'none' }}>Save</AsyncButton>
                <AsyncButton startIcon={<SendIcon />} variant="contained" onClick={sendForReview} disabled={!selectedId || hasPendingReview} sx={{ textTransform: 'none', bgcolor: accent }} title={hasPendingReview ? 'This project is already pending review.' : ''}>Send For Review</AsyncButton>
                {isAdmin && !!selectedId && (
                  <Button startIcon={<DeleteForeverIcon />} color="error" variant="outlined" onClick={confirmDelete} sx={{ textTransform: 'none' }}>
                    Delete Project
                  </Button>
                )}
              </Stack>
            </Stack>
            {selectedId ? (
              <Box sx={{ mt: 2 }}>
                <Tabs value={tab} onChange={(_,v)=> setTab(v)} sx={{ borderBottom: '1px solid #eee', '& .MuiTabs-indicator': { backgroundColor: accent } }}>
                  <Tab icon={<InfoIcon />} iconPosition="start" label="Project Info" sx={{ '&.Mui-selected': { color: accent } }} />
                  <Tab icon={<PersonIcon />} iconPosition="start" label="Personal Details" sx={{ '&.Mui-selected': { color: accent } }} />
                  <Tab icon={<SlideshowIcon />} iconPosition="start" label="Slides" sx={{ '&.Mui-selected': { color: accent } }} />
                  <Tab icon={<QuizIcon />} iconPosition="start" label="Questions" sx={{ '&.Mui-selected': { color: accent } }} />
                  <Tab icon={<GroupIcon />} iconPosition="start" label="Assigned Users" sx={{ '&.Mui-selected': { color: accent } }} />
                </Tabs>
                <Box sx={{ mt: 2 }} hidden={tab!==0}>
                  <ProjectInfoSection value={config.projectInfo} onChange={(val)=> setConfig({ ...config, projectInfo: val })} />
                  {/* Managers List */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Managers</Typography>
                    {managers && managers.length ? (
                      <List dense>
                        {managers.map((m) => (
                          <ListItemButton key={m._id} sx={{ cursor: 'default' }}>
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
                <Box sx={{ mt: 2 }} hidden={tab!==1}>
                  <PersonalDetailsSection value={config.personalDetails} onChange={(val)=> setConfig({ ...config, personalDetails: val })} />
                </Box>
                <Box sx={{ mt: 2 }} hidden={tab!==2}>
                  <SlidesSection value={config.slides} onChange={(val)=> setConfig({ ...config, slides: val })} />
                </Box>
                <Box sx={{ mt: 2 }} hidden={tab!==3}>
                  <QuestionsSection value={config.questions} onChange={(val)=> setConfig({ ...config, questions: val })} />
                </Box>
                <Box sx={{ mt: 2 }} hidden={tab!==4}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <GroupIcon color="action" />
                    <Typography variant="subtitle2">Assigned Users</Typography>
                    <Box sx={{ flex: 1 }} />
                    <Button variant="contained" onClick={openAssign} sx={{ textTransform: 'none' }}>Assign User</Button>
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
              </Box>
            ) : (
              <Typography variant="body2" sx={{ mt: 2, opacity: 0.7 }}>Select a project to edit.</Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>

    {/* Assign User Modal */}
    <Dialog open={assignOpen} onClose={closeAssign} maxWidth="sm" fullWidth>
      <CardHeader title={<Typography variant="subtitle1">Assign User to Project</Typography>} />
      <CardContent>
        <Stack spacing={2}>
          <TextField
            select
            label="User"
            value={assignUserId}
            onChange={(e)=> setAssignUserId(e.target.value)}
            helperText="Select a user to assign"
          >
            {users.map(u => (
              <MenuItem key={u._id} value={u._id}>{u.name} ({u.email})</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Role"
            value={assignRole}
            onChange={(e)=> setAssignRole(e.target.value)}
          >
            <MenuItem value="worker">Worker</MenuItem>
            <MenuItem value="manager">Manager</MenuItem>
          </TextField>
        </Stack>
      </CardContent>
      <Stack direction="row" spacing={1} sx={{ px: 2, pb: 2, justifyContent: 'flex-end' }}>
        <Button onClick={closeAssign}>Cancel</Button>
        <AsyncButton variant="contained" disabled={!assignUserId} onClick={doAssign}>Assign</AsyncButton>
      </Stack>
    </Dialog>

    {/* Delete Project Confirmation */}
    <Dialog open={deleteOpen} onClose={closeDelete} maxWidth="xs" fullWidth>
      <CardHeader title={<Typography variant="subtitle1">Delete Project</Typography>} />
      <CardContent>
        <Typography variant="body2">Are you sure? This action cannot be undone.</Typography>
      </CardContent>
      <Stack direction="row" spacing={1} sx={{ px: 2, pb: 2, justifyContent: 'flex-end' }}>
        <Button onClick={closeDelete}>Cancel</Button>
        <AsyncButton color="error" variant="contained" onClick={doDelete}>Delete</AsyncButton>
      </Stack>
    </Dialog>
    </>
  )
}
