import React, { useEffect, useState } from 'react'
import { Alert, Button, Card, CardHeader, CardContent, Stack, TextField, Typography, MenuItem, Divider } from '@mui/material'
import api from '../utils/api.js'
import { useAuthStore } from '../store/auth.js'
import ProjectInfoSection from '../components/admin/ProjectInfoSection.jsx'
import PersonalDetailsSection from '../components/admin/PersonalDetailsSection.jsx'
import SlidesSection from '../components/admin/SlidesSection.jsx'
import QuestionsSection from '../components/admin/QuestionsSection.jsx'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import SaveIcon from '@mui/icons-material/Save'
import SendIcon from '@mui/icons-material/Send'
import AsyncButton from '../components/AsyncButton.jsx'

const defaultConfig = {
  steps: ['personal', 'uploads', 'slides', 'quiz', 'sign'],
  slides: [],
  quiz: { questions: [] },
  settings: { passMark: 80, randomizeQuestions: false, allowRetry: true }
}

export default function AdminConsole() {
  const { user } = useAuthStore()
  const [projects, setProjects] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [projectForm, setProjectForm] = useState({ name: '', description: '', address: '', status: 'draft' })
  const [module, setModule] = useState(null)
  const [moduleConfig, setModuleConfig] = useState(defaultConfig)
  const [fields, setFields] = useState([])
  const [newProject, setNewProject] = useState({ name: '', description: '' })

  const accent = '#1976d2'
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

  if (!user) return <Alert severity="info">Please log in as admin.</Alert>
  if (user.role !== 'admin') return <Alert severity="warning">Admins only.</Alert>

  const createProject = async () => {
    await api.post('/projects', { name: newProject.name, description: newProject.description })
    setNewProject({ name: '', description: '' })
    await loadProjects()
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
        setModule(null); setModuleConfig(defaultConfig); setFields([])
      }
    }
  }

  const onProjectChange = async (id) => {
    setSelectedId(id)
    const p = projects.find(x => x._id === id)
    setProjectForm({ name: p?.name || '', description: p?.description || '', address: p?.address || '', status: p?.status || 'draft' })
    if (id) await loadModule(id)
  }

  const saveProject = async () => {
    if (!selectedId) return
    await api.put(`/projects/${selectedId}`, projectForm)
    await loadProjects()
  }

  const saveModule = async () => {
    if (!module?._id) return
    const r = await api.put(`/modules/${module._id}`, { config: moduleConfig, fields })
    setModule(r.data.module)
    setFields(r.data.fields || fields)
  }

  const sendForReview = async () => {
    if (!module?._id) return
    await api.post(`/modules/${module._id}/reviews`)
    alert('Sent for review')
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Admin Console</Typography>
      <Card elevation={1} sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <CardHeader title={<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Create Project</Typography>} />
        <CardContent>
          <Stack direction="row" spacing={2}>
            <TextField label="Name" value={newProject.name} onChange={e=> setNewProject({ ...newProject, name: e.target.value })} />
            <TextField label="Description" value={newProject.description} onChange={e=> setNewProject({ ...newProject, description: e.target.value })} />
            <AsyncButton startIcon={<AddCircleOutlineIcon />} variant="contained" onClick={createProject} disabled={!newProject.name} sx={{ textTransform: 'none', bgcolor: accent }}>Create</AsyncButton>
          </Stack>
        </CardContent>
      </Card>
      <Card elevation={1} sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <CardHeader title={<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Edit Project</Typography>} />
        <CardContent>
        <TextField select label="Select Project" value={selectedId} onChange={e=> onProjectChange(e.target.value)}>
          {projects.map(p => <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>)}
        </TextField>
        {selectedId && (
          <Stack spacing={3} sx={{ mt:2 }}>
            <ProjectInfoSection value={projectForm} onChange={setProjectForm} />
            <Divider />
            <PersonalDetailsSection fields={fields} onChange={setFields} />
            <Divider />
            <SlidesSection slides={moduleConfig.slides} onChange={(slides) => setModuleConfig({ ...moduleConfig, slides })} />
            <Divider />
            <QuestionsSection
              questions={moduleConfig.quiz?.questions || []}
              settings={moduleConfig.settings}
              onChange={(qs) => setModuleConfig({ ...moduleConfig, quiz: { questions: qs } })}
              onSettingsChange={(settings) => setModuleConfig({ ...moduleConfig, settings })}
            />
            <Stack direction="row" spacing={2}>
              <AsyncButton startIcon={<SaveIcon />} variant="outlined" onClick={saveProject} sx={{ textTransform: 'none' }}>Save Project</AsyncButton>
              <AsyncButton startIcon={<SaveIcon />} variant="contained" onClick={saveModule} sx={{ textTransform: 'none' }}>Save Module</AsyncButton>
              <AsyncButton startIcon={<SendIcon />} variant="contained" onClick={sendForReview} sx={{ textTransform: 'none', bgcolor: accent }}>Send For Review</AsyncButton>
            </Stack>
          </Stack>
        )}
        </CardContent>
      </Card>
    </Stack>
  )
}
