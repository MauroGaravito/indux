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

export default function AdminConsole() {
  const { user } = useAuthStore()
  const [projects, setProjects] = useState([])
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [config, setConfig] = useState({ projectInfo: {}, personalDetails: {}, slides: {}, questions: [] })
  const load = () => api.get('/projects').then(r => setProjects(r.data))
  useEffect(()=> { load() }, [])

  if (!user) return <Alert severity="info">Please log in as admin.</Alert>
  if (user.role !== 'admin') return <Alert severity="warning">Admins only.</Alert>

  const createProject = async () => {
    await api.post('/projects', { name, description: desc, steps: [] })
    setName(''); setDesc('');
    await load()
  }

  const onProjectChange = (id) => {
    setSelectedId(id)
    const p = projects.find(x => x._id === id)
    setConfig(p?.config || { projectInfo: {}, personalDetails: {}, slides: {}, questions: [] })
  }

  const saveConfig = async () => {
    if (!selectedId) return
    await api.put(`/projects/${selectedId}`, { config })
  }

  const sendForReview = async () => {
    if (!selectedId) return
    await api.post('/reviews/projects', { projectId: selectedId, data: config })
    alert('Sent for review')
  }

  const accent = '#1976d2'

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Admin Console</Typography>
      <Card elevation={1} sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <CardHeader title={<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Create Project</Typography>} />
        <CardContent>
          <Stack direction="row" spacing={2}>
            <TextField label="Name" value={name} onChange={e=> setName(e.target.value)} />
            <TextField label="Description" value={desc} onChange={e=> setDesc(e.target.value)} />
            <Button startIcon={<AddCircleOutlineIcon />} variant="contained" onClick={createProject} disabled={!name} sx={{ textTransform: 'none', bgcolor: accent }}>Create</Button>
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
            <ProjectInfoSection value={config.projectInfo} onChange={(val)=> setConfig({ ...config, projectInfo: val })} />
            <Divider />
            <PersonalDetailsSection value={config.personalDetails} onChange={(val)=> setConfig({ ...config, personalDetails: val })} />
            <Divider />
            <SlidesSection value={config.slides} onChange={(val)=> setConfig({ ...config, slides: val })} />
            <Divider />
            <QuestionsSection value={config.questions} onChange={(val)=> setConfig({ ...config, questions: val })} />
            <Stack direction="row" spacing={2}>
              <Button startIcon={<SaveIcon />} variant="outlined" onClick={saveConfig} sx={{ textTransform: 'none' }}>Save</Button>
              <Button startIcon={<SendIcon />} variant="contained" onClick={sendForReview} sx={{ textTransform: 'none', bgcolor: accent }}>Send For Review</Button>
            </Stack>
          </Stack>
        )}
        </CardContent>
      </Card>
    </Stack>
  )
}
