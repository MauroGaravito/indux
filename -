import React, { useEffect, useState } from 'react'
import { Box, Grid, Card, CardContent, Typography, Button, Stack, TextField, MenuItem, Divider, Tabs, Tab } from '@mui/material'
import api from '../../utils/api.js'
import AsyncButton from '../../components/AsyncButton.jsx'
import ProjectInfoSection from '../../components/admin/ProjectInfoSection.jsx'
import PersonalDetailsSection from '../../components/admin/PersonalDetailsSection.jsx'
import SlidesSection from '../../components/admin/SlidesSection.jsx'
import QuestionsSection from '../../components/admin/QuestionsSection.jsx'

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

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Projects</Typography>
            <Stack spacing={1}>
              {projects.map(p => (
                <Button key={p._id} variant={selectedId===p._id? 'contained':'outlined'} onClick={()=> onSelect(p._id)} sx={{ justifyContent:'flex-start' }}>{p.name}</Button>
              ))}
              {!projects.length && <Typography variant="body2" sx={{ opacity: 0.7 }}>No projects yet.</Typography>}
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Create Project</Typography>
            <Stack direction="row" spacing={1}>
              <TextField size="small" label="Name" value={name} onChange={e=> setName(e.target.value)} />
              <TextField size="small" label="Description" value={desc} onChange={e=> setDesc(e.target.value)} />
            </Stack>
                <AsyncButton sx={{ mt: 1 }} variant="contained" onClick={createProject} disabled={!name}>Create</AsyncButton>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={8}>
        <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3 }}>
          <CardContent>
            <Stack direction={{ xs:'column', md:'row' }} justifyContent="space-between" alignItems={{ md:'center' }} spacing={1}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Edit Project</Typography>
              <Stack direction="row" spacing={1}>
                <AsyncButton variant="outlined" onClick={saveConfig} disabled={!selectedId}>Save</AsyncButton>
                <AsyncButton variant="contained" onClick={sendForReview} disabled={!selectedId}>Send For Review</AsyncButton>
              </Stack>
            </Stack>
            {selectedId ? (
              <Box sx={{ mt: 2 }}>
                <Tabs value={tab} onChange={(_,v)=> setTab(v)} sx={{ borderBottom: '1px solid #eee' }}>
                  <Tab label="Project Info" />
                  <Tab label="Personal Details" />
                  <Tab label="Slides" />
                  <Tab label="Questions" />
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
