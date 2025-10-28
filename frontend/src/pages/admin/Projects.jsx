import React, { useEffect, useState } from 'react'
import { Box, Grid, Card, CardContent, Typography, Button, Stack, TextField, MenuItem, Divider, Tabs, Tab, List, ListItemButton, ListItemIcon, ListItemText, CardHeader } from '@mui/material'
import api from '../../utils/api.js'
import AsyncButton from '../../components/AsyncButton.jsx'
import ProjectInfoSection from '../../components/admin/ProjectInfoSection.jsx'
import PersonalDetailsSection from '../../components/admin/PersonalDetailsSection.jsx'
import SlidesSection from '../../components/admin/SlidesSection.jsx'
import QuestionsSection from '../../components/admin/QuestionsSection.jsx'
import FolderIcon from '@mui/icons-material/Folder'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import SaveIcon from '@mui/icons-material/Save'
import SendIcon from '@mui/icons-material/Send'
import InfoIcon from '@mui/icons-material/Info'
import PersonIcon from '@mui/icons-material/Person'
import SlideshowIcon from '@mui/icons-material/Slideshow'
import QuizIcon from '@mui/icons-material/Quiz'

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [config, setConfig] = useState({ projectInfo: {}, personalDetails: {}, slides: {}, questions: [] })
  const [tab, setTab] = useState(0)

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
  }

  const saveConfig = async () => {
    if (!selectedId) return
    await api.put(`/projects/${selectedId}`, { config })
  }

  const sendForReview = async () => {
    if (!selectedId) return
    await api.post('/reviews/projects', { projectId: selectedId, data: config })
  }

  const accent = '#1976d2'

  return (
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
                <AsyncButton startIcon={<SendIcon />} variant="contained" onClick={sendForReview} disabled={!selectedId} sx={{ textTransform: 'none', bgcolor: accent }}>Send For Review</AsyncButton>
              </Stack>
            </Stack>
            {selectedId ? (
              <Box sx={{ mt: 2 }}>
                <Tabs value={tab} onChange={(_,v)=> setTab(v)} sx={{ borderBottom: '1px solid #eee', '& .MuiTabs-indicator': { backgroundColor: accent } }}>
                  <Tab icon={<InfoIcon />} iconPosition="start" label="Project Info" sx={{ '&.Mui-selected': { color: accent } }} />
                  <Tab icon={<PersonIcon />} iconPosition="start" label="Personal Details" sx={{ '&.Mui-selected': { color: accent } }} />
                  <Tab icon={<SlideshowIcon />} iconPosition="start" label="Slides" sx={{ '&.Mui-selected': { color: accent } }} />
                  <Tab icon={<QuizIcon />} iconPosition="start" label="Questions" sx={{ '&.Mui-selected': { color: accent } }} />
                </Tabs>
                <Box sx={{ mt: 2 }} hidden={tab!==0}>
                  <ProjectInfoSection value={config.projectInfo} onChange={(val)=> setConfig({ ...config, projectInfo: val })} />
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
              </Box>
            ) : (
              <Typography variant="body2" sx={{ mt: 2, opacity: 0.7 }}>Select a project to edit.</Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}
