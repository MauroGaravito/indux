import React, { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Grid,
  LinearProgress,
  Stack,
  Typography
} from '@mui/material'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import { Link as RouterLink } from 'react-router-dom'
import api from '../../utils/api.js'
import { useAuthStore } from '../../context/authStore.js'

const cardStyles = {
  borderRadius: 3,
  p: 3,
  bgcolor: '#fff',
  boxShadow: '0 8px 30px rgba(15, 23, 42, 0.03)'
}

export default function WorkerInductions() {
  const { user } = useAuthStore()
  const userId = user?._id || user?.id
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [projects, setProjects] = useState([])
  const [submissions, setSubmissions] = useState([])

  useEffect(() => {
    let active = true
    async function load() {
      if (!userId) return
      setLoading(true)
      setError('')
      try {
        const [projectsRes, submissionsRes] = await Promise.all([
          api.get('/projects'),
          api.get('/submissions')
        ])
        if (!active) return
        const ownedProjects = Array.isArray(projectsRes.data) ? projectsRes.data : []
        const mySubs = Array.isArray(submissionsRes.data) ? submissionsRes.data : []
        setProjects(ownedProjects)
        setSubmissions(mySubs)
      } catch (e) {
        if (active) setError(e?.response?.data?.message || 'Failed to load inductions')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [userId])

  const inductionStatus = useMemo(() => {
    const map = new Map()
    submissions.forEach((submission) => {
      const projectId = typeof submission?.projectId === 'string' ? submission.projectId : submission?.projectId?._id
      if (!projectId) return
      map.set(projectId, submission.status || 'pending')
    })
    return map
  }, [submissions])

  const statusChip = (status) => {
    const color = status === 'approved' ? 'success' : status === 'pending' ? 'warning' : 'default'
    const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Not Started'
    return <Chip size="small" color={color} label={label} />
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>My Inductions</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Start or resume your assigned inductions. Progress updates once you complete each step of the wizard.
      </Typography>
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {error && (
        <Card sx={{ ...cardStyles, mb: 3 }}>
          <Typography variant="body2" color="error.main">{error}</Typography>
        </Card>
      )}
      <Card sx={cardStyles}>
        {!projects.length && !loading && (
          <Alert severity="info">No inductions have been assigned yet.</Alert>
        )}
        <Grid container spacing={2}>
          {projects.map((project) => {
            const status = inductionStatus.get(project._id) || 'not started'
            const icon = status === 'approved' ? <DoneAllIcon color="success" /> : status === 'pending' ? <PlayCircleOutlineIcon color="warning" /> : <SchoolOutlinedIcon color="primary" />
            return (
              <Grid item xs={12} md={6} key={project._id}>
                <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', p: 2.5, boxShadow: 'none', height: '100%' }}>
                  <Stack spacing={1.5}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      {icon}
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{project.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{project.description || 'No description provided.'}</Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                      {statusChip(status)}
                      <Button
                        variant="outlined"
                        size="small"
                        component={RouterLink}
                        to="/wizard"
                        sx={{ textTransform: 'none' }}
                      >
                        {status === 'approved' ? 'Review' : 'Open Wizard'}
                      </Button>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {/* TODO: requires backend endpoint to show due dates or additional metadata */}
                      Ensure you complete this induction before arriving onsite.
                    </Typography>
                  </Stack>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      </Card>
    </Box>
  )
}
