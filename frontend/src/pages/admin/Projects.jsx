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
  Snackbar
} from '@mui/material'
import FolderIcon from '@mui/icons-material/Folder'
import GroupIcon from '@mui/icons-material/Group'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import SaveIcon from '@mui/icons-material/Save'
import InfoIcon from '@mui/icons-material/Info'
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd'
import api from '../../utils/api.js'
import AsyncButton from '../../components/AsyncButton.jsx'
import ProjectInfoSection from '../../components/admin/ProjectInfoSection.jsx'
import { useTheme } from '@mui/material/styles'
import { useAuthStore } from '../../store/auth.js'

export default function Projects() {
  const theme = useTheme()
  const accent = theme.palette.primary.main
  const navigate = useNavigate()
  const { projectId: projectIdParam } = useParams()
  const { user } = useAuthStore()

  const [projects, setProjects] = useState([])
  const [archivedProjects, setArchivedProjects] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [projectForm, setProjectForm] = useState({ name: '', description: '', address: '', status: 'draft' })
  const [tab, setTab] = useState(0)
  const [assignments, setAssignments] = useState([])
  const [users, setUsers] = useState([])
  const [assignOpen, setAssignOpen] = useState(false)
  const [assignUserId, setAssignUserId] = useState('')
  const [assignRole, setAssignRole] = useState('worker')
  const [newProject, setNewProject] = useState({ name: '', description: '' })
  const [module, setModule] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

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

  const loadModule = async (projectId) => {
    if (!projectId) return setModule(null)
    try {
      const r = await api.get(`/projects/${projectId}/modules/induction`)
      setModule(r.data?.module || null)
    } catch (e) {
      if (e?.response?.status === 404) {
        setModule(null)
      } else {
        setModule(null)
      }
    }
  }

  // Select project based on param or first selection
  useEffect(() => {
    loadProjects()
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
    const p = projects.find((x) => x._id === id)
    if (p) {
      setProjectForm({ name: p.name || '', description: p.description || '', address: p.address || '', status: p.status || 'draft' })
      await Promise.all([loadAssignments(id), loadModule(id)])
      if (id) navigate(`/admin/projects/${id}`, { replace: true })
    } else {
      setProjectForm({ name: '', description: '', address: '', status: 'draft' })
      setAssignments([])
      setModule(null)
      navigate('/admin/projects', { replace: true })
    }
  }

  const createProject = async () => {
    if (!newProject.name) return
    await api.post('/projects', { name: newProject.name, description: newProject.description })
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
    setProjectForm({ name: '', description: '', address: '', status: 'draft' })
    setAssignments([])
    setModule(null)
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
      setProjectForm({ name: '', description: '', address: '', status: 'draft' })
      setAssignments([])
      setModule(null)
    } catch (e) {
      setErrorMsg(e?.response?.data?.error || 'Failed to restore project')
    }
  }

  const openAssign = async () => {
    setAssignOpen(true)
    try { const r = await api.get('/users'); setUsers(r.data || []) } catch { setUsers([]) }
  }
  const closeAssign = () => setAssignOpen(false)
  const doAssign = async () => {
    if (!selectedId || !assignUserId) return
    await api.post('/assignments', { user: assignUserId, project: selectedId, role: assignRole })
    setAssignUserId(''); setAssignRole('worker'); setAssignOpen(false)
    await loadAssignments(selectedId)
  }
  const removeAssignment = async (id) => {
    await api.delete(`/assignments/${id}`)
    await loadAssignments(selectedId)
  }

  const createModule = async () => {
    if (!selectedId) return
    const r = await api.post(`/projects/${selectedId}/modules/induction`, {})
    const mod = r.data
    setModule(mod)
    navigate(`/admin/projects/${selectedId}/modules/induction/${mod._id}`)
  }

  const openModule = () => {
    if (!selectedId || !module?._id) return
    navigate(`/admin/projects/${selectedId}/modules/induction/${module._id}`)
  }

  const projectTabs = useMemo(() => ([
    { label: 'Project Info', icon: <InfoIcon /> },
    { label: 'Assignments', icon: <AssignmentIndIcon /> }
  ]), [])

  return (
    <>
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <Stack spacing={2}>
          <Card elevation={1} sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <CardHeader title={<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Projects</Typography>} />
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
                {!projects.length && <Typography variant="body2" sx={{ opacity: 0.7, px: 2, py: 1 }}>No projects yet.</Typography>}
              </List>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Create Project</Typography>
              <Stack spacing={1}>
                <TextField size="small" label="Name" value={newProject.name} onChange={e => setNewProject({ ...newProject, name: e.target.value })} />
                <TextField size="small" label="Description" value={newProject.description} onChange={e => setNewProject({ ...newProject, description: e.target.value })} />
                <AsyncButton variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={createProject} disabled={!newProject.name}>
                  Add
                </AsyncButton>
              </Stack>
            </CardContent>
          </Card>

          {user?.role === 'admin' && (
            <Card elevation={1} sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <CardHeader title={<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Archived Projects</Typography>} />
              <CardContent>
                <List sx={{ mb: 1 }}>
                  {archivedProjects.map((p) => (
                    <ListItemButton key={p._id} sx={{ borderRadius: 1 }}>
                      <ListItemIcon sx={{ minWidth: 36, color: 'action.active' }}>
                        <FolderIcon />
                      </ListItemIcon>
                      <ListItemText primary={p.name} secondary={p.status} />
                      <Button size="small" variant="outlined" onClick={() => restoreProject(p._id)}>
                        Restore
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
              <>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6">Project</Typography>
                  <Chip label={projectForm.status || 'draft'} />
                  <Box sx={{ flex: 1 }} />
                  {projectForm.status !== 'archived' && (
                    <Button color="error" variant="outlined" onClick={archiveProject}>Archive</Button>
                  )}
                  <AsyncButton startIcon={<SaveIcon />} variant="outlined" onClick={saveProject}>Save Project</AsyncButton>
                </Stack>

                {/* Modules Section */}
                <Box sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <Typography variant="subtitle1">Modules for this Project</Typography>
                  </Stack>
                  {module ? (
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center" justifyContent="space-between">
                      <Stack spacing={0.5}>
                        <Typography variant="body1">Induction Module</Typography>
                        <Typography variant="body2" color="text.secondary">Status: {module.reviewStatus || 'draft'}</Typography>
                      </Stack>
                      <Button variant="contained" onClick={openModule} sx={{ textTransform: 'none' }}>Open</Button>
                    </Stack>
                  ) : (
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">No modules yet.</Typography>
                      <Button variant="contained" onClick={createModule} sx={{ textTransform: 'none' }}>Create Induction Module</Button>
                    </Stack>
                  )}
                </Box>

                <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: '1px solid #eee', '& .MuiTabs-indicator': { backgroundColor: accent } }}>
                  {projectTabs.map((t, idx) => (
                    <Tab key={t.label} icon={t.icon} iconPosition="start" label={t.label} sx={{ '&.Mui-selected': { color: accent } }} value={idx} />
                  ))}
                </Tabs>

                <Box sx={{ mt: 2 }} hidden={tab !== 0}>
                  <ProjectInfoSection value={projectForm} onChange={(val) => setProjectForm(val)} />
                </Box>

                <Box sx={{ mt: 2 }} hidden={tab !== 1}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <GroupIcon color="action" />
                    <Typography variant="subtitle2">Assigned Users</Typography>
                    <Box sx={{ flex: 1 }} />
                    <Button variant="contained" onClick={openAssign} sx={{ textTransform: 'none' }}>Assign User</Button>
                  </Stack>
                  <List>
                    {assignments.map((a) => (
                      <ListItemButton key={a._id} sx={{ borderRadius: 1 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}><GroupIcon /></ListItemIcon>
                        <ListItemText primary={`${a?.user?.name || a?.user} - ${a.role}`} secondary={a?.user?.email || ''} />
                        <Button color="error" onClick={() => removeAssignment(a._id)}>Remove</Button>
                      </ListItemButton>
                    ))}
                  </List>
                  {!assignments.length && (
                    <Typography variant="body2" sx={{ opacity: 0.7 }}>No users assigned to this project.</Typography>
                  )}
                </Box>
              </>
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
            onChange={(e) => setAssignUserId(e.target.value)}
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
            onChange={(e) => setAssignRole(e.target.value)}
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
    <Snackbar open={!!errorMsg} autoHideDuration={4000} onClose={() => setErrorMsg('')}>
      <Alert severity="error" onClose={() => setErrorMsg('')}>{errorMsg}</Alert>
    </Snackbar>
    </>
  )
}
