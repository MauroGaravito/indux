import React, { useEffect, useState } from 'react'
import {
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
  Dialog
} from '@mui/material'
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
import { useTheme } from '@mui/material/styles'

const defaultConfig = {
  steps: ['personal', 'uploads', 'slides', 'quiz', 'sign'],
  slides: [],
  quiz: { questions: [] },
  settings: { passMark: 80, randomizeQuestions: false, allowRetry: true }
}

export default function Projects() {
  const theme = useTheme()
  const [projects, setProjects] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [projectForm, setProjectForm] = useState({ name: '', description: '', address: '', status: 'draft' })
  const [module, setModule] = useState(null)
  const [moduleConfig, setModuleConfig] = useState(defaultConfig)
  const [fields, setFields] = useState([])
  const [tab, setTab] = useState(0)
  const [assignments, setAssignments] = useState([])
  const [users, setUsers] = useState([])
  const [assignOpen, setAssignOpen] = useState(false)
  const [assignUserId, setAssignUserId] = useState('')
  const [assignRole, setAssignRole] = useState('worker')
  const [newProject, setNewProject] = useState({ name: '', description: '' })

  const accent = theme.palette.primary.main

  const normalizeConfig = (cfg) => ({
    steps: Array.isArray(cfg?.steps) ? cfg.steps : defaultConfig.steps,
    slides: Array.isArray(cfg?.slides) ? cfg.slides : [],
    quiz: cfg?.quiz && Array.isArray(cfg.quiz.questions) ? { questions: cfg.quiz.questions } : { questions: [] },
    settings: cfg?.settings ? { ...defaultConfig.settings, ...cfg.settings } : { ...defaultConfig.settings }
  })

  const loadProjects = async () => {
    const r = await api.get('/projects')
    setProjects(r.data || [])
  }
  useEffect(() => { loadProjects() }, [])

  const createProject = async () => {
    if (!newProject.name) return
    await api.post('/projects', { name: newProject.name, description: newProject.description })
    setNewProject({ name: '', description: '' })
    await loadProjects()
  }

  const loadAssignments = async (projectId) => {
    try {
      const r = await api.get(`/assignments/project/${projectId}`)
      setAssignments(r.data || [])
    } catch {
      setAssignments([])
    }
  }

  const loadModule = async (projectId) => {
    try {
      const r = await api.get(`/projects/${projectId}/modules/induction`)
      setModule(r.data.module)
      setModuleConfig(normalizeConfig(r.data.module?.config))
      setFields(r.data.fields || [])
    } catch (e) {
      if (e?.response?.status === 404) {
        const created = await api.post(`/projects/${projectId}/modules/induction`, {})
        setModule(created.data)
        setModuleConfig(normalizeConfig(created.data?.config))
        setFields([])
      } else {
        setModule(null)
        setModuleConfig(defaultConfig)
        setFields([])
      }
    }
  }

  const onSelect = async (id) => {
    setSelectedId(id)
    const p = projects.find(x => x._id === id)
    setProjectForm({ name: p?.name || '', description: p?.description || '', address: p?.address || '', status: p?.status || 'draft' })
    if (id) {
      await Promise.all([loadModule(id), loadAssignments(id)])
    } else {
      setModule(null)
      setModuleConfig(defaultConfig)
      setFields([])
      setAssignments([])
    }
  }

  const saveProject = async () => {
    if (!selectedId) return
    await api.put(`/projects/${selectedId}`, projectForm)
    await loadProjects()
  }

  const saveModule = async () => {
    if (!module?._id) return
    const payload = { config: moduleConfig, fields }
    const r = await api.put(`/modules/${module._id}`, payload)
    setModule(r.data.module)
    setFields(r.data.fields || fields)
  }

  const sendForReview = async () => {
    if (!module?._id) return
    await api.post(`/modules/${module._id}/reviews`)
    await loadModule(selectedId)
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

  return (
    <>
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <Card elevation={1} sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <CardHeader title={<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Projects</Typography>} />
          <CardContent>
            <List sx={{ mb: 1 }}>
              {projects.map(p => {
                const selected = selectedId === p._id
                return (
                  <ListItemButton key={p._id} selected={selected} onClick={() => onSelect(p._id)} sx={{ borderRadius: 1 }}>
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
      </Grid>

      <Grid item xs={12} md={8}>
        <Card elevation={1} sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <CardContent>
            {selectedId ? (
              <>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6">Manage Project</Typography>
                  <Box sx={{ flex: 1 }} />
                  <AsyncButton startIcon={<SaveIcon />} variant="outlined" onClick={saveProject}>Save Project</AsyncButton>
                  <AsyncButton startIcon={<SaveIcon />} variant="contained" onClick={saveModule}>Save Module</AsyncButton>
                  <AsyncButton startIcon={<SendIcon />} variant="contained" color="secondary" onClick={sendForReview}>Send For Review</AsyncButton>
                </Stack>

                <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: '1px solid #eee', '& .MuiTabs-indicator': { backgroundColor: accent } }}>
                  <Tab icon={<InfoIcon />} iconPosition="start" label="Project Info" sx={{ '&.Mui-selected': { color: accent } }} />
                  <Tab icon={<PersonIcon />} iconPosition="start" label="Fields" sx={{ '&.Mui-selected': { color: accent } }} />
                  <Tab icon={<SlideshowIcon />} iconPosition="start" label="Slides" sx={{ '&.Mui-selected': { color: accent } }} />
                  <Tab icon={<QuizIcon />} iconPosition="start" label="Quiz" sx={{ '&.Mui-selected': { color: accent } }} />
                  <Tab icon={<GroupIcon />} iconPosition="start" label="Assignments" sx={{ '&.Mui-selected': { color: accent } }} />
                </Tabs>

                <Box sx={{ mt: 2 }} hidden={tab !== 0}>
                  <ProjectInfoSection value={projectForm} onChange={(val) => setProjectForm(val)} />
                </Box>

                <Box sx={{ mt: 2 }} hidden={tab !== 1}>
                  <PersonalDetailsSection fields={fields} onChange={setFields} />
                </Box>

                <Box sx={{ mt: 2 }} hidden={tab !== 2}>
                  <SlidesSection slides={moduleConfig.slides} onChange={(slides) => setModuleConfig({ ...moduleConfig, slides })} />
                </Box>

                <Box sx={{ mt: 2 }} hidden={tab !== 3}>
                  <QuestionsSection
                    questions={moduleConfig.quiz?.questions || []}
                    settings={moduleConfig.settings}
                    onChange={(qs) => setModuleConfig({ ...moduleConfig, quiz: { questions: qs } })}
                    onSettingsChange={(settings) => setModuleConfig({ ...moduleConfig, settings })}
                  />
                </Box>

                <Box sx={{ mt: 2 }} hidden={tab !== 4}>
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
    </>
  )
}
