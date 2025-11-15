import React, { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Card,
  Chip,
  Grid,
  LinearProgress,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Typography,
  Button
} from '@mui/material'
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'
import PendingActionsIcon from '@mui/icons-material/PendingActions'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined'
import { Link as RouterLink } from 'react-router-dom'
import api from '../../utils/api.js'
import { useAuthStore } from '../../context/authStore.js'

const cardStyles = {
  borderRadius: 3,
  p: 3,
  bgcolor: '#fff',
  boxShadow: '0 8px 30px rgba(15, 23, 42, 0.03)'
}

const metricCardStyles = {
  borderRadius: 2,
  border: '1px solid',
  borderColor: 'divider',
  p: 2.5,
  boxShadow: 'none'
}

export default function WorkerDashboard() {
  const { user } = useAuthStore()
  const userId = user?._id || user?.id
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [projects, setProjects] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [tab, setTab] = useState(0)

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
        const subs = Array.isArray(submissionsRes.data) ? submissionsRes.data : []
        setProjects(ownedProjects)
        setSubmissions(subs)
      } catch (e) {
        if (active) setError(e?.response?.data?.message || 'Failed to load worker data')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [userId])

  const metrics = useMemo(() => {
    const totalProjects = projects.length
    const totalSubs = submissions.length
    const pendingSubs = submissions.filter((s) => s?.status === 'pending').length
    const completedSubs = submissions.filter((s) => s?.status === 'approved').length
    return { totalProjects, totalSubs, pendingSubs, completedSubs }
  }, [projects, submissions])

  const latestSubmissions = useMemo(() => submissions.slice(0, 5), [submissions])

  const overviewTab = (
    <Box sx={{ mt: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <Card sx={metricCardStyles}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <FolderOpenIcon color="primary" />
              <Box>
                <Typography variant="body2" color="text.secondary">Assigned Projects</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{metrics.totalProjects}</Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={metricCardStyles}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <AssignmentTurnedInIcon color="success" />
              <Box>
                <Typography variant="body2" color="text.secondary">Completed Inductions</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{metrics.completedSubs}</Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={metricCardStyles}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <TimelineOutlinedIcon color="info" />
              <Box>
                <Typography variant="body2" color="text.secondary">Total Submissions</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{metrics.totalSubs}</Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={metricCardStyles}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <PendingActionsIcon color="warning" />
              <Box>
                <Typography variant="body2" color="text.secondary">Pending Reviews</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{metrics.pendingSubs}</Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
        Stay up to date with your assigned inductions, upload requirements, and track completion progress.
      </Typography>
    </Box>
  )

  const projectsTab = (
    <Box sx={{ mt: 3 }}>
      {!projects.length && !loading && (
        <Alert severity="info">You don't have any assigned projects yet.</Alert>
      )}
      {!!projects.length && (
        <List sx={{ p: 0 }}>
          {projects.map((project) => {
            const submission = submissions.find((s) => {
              const projId = typeof s?.projectId === 'string' ? s.projectId : s?.projectId?._id
              return projId === project._id
            })
            const status = submission?.status || 'not started'
            return (
              <ListItemButton key={project._id} sx={{ borderRadius: 2, mb: 1, border: '1px solid', borderColor: 'divider' }}>
                <ListItemText
                  primary={<Typography sx={{ fontWeight: 600 }}>{project.name}</Typography>}
                  secondary={project.description || 'No description provided'}
                />
                <Chip
                  label={status === 'not started' ? 'Not Started' : status.charAt(0).toUpperCase() + status.slice(1)}
                  color={status === 'approved' ? 'success' : status === 'pending' ? 'warning' : 'default'}
                  size="small"
                  sx={{ mr: 2 }}
                />
                <Button
                  size="small"
                  variant="outlined"
                  component={RouterLink}
                  to="/wizard"
                  sx={{ textTransform: 'none' }}
                >
                  Open Wizard
                </Button>
              </ListItemButton>
            )
          })}
        </List>
      )}
    </Box>
  )

  const activityTab = (
    <Box sx={{ mt: 3 }}>
      {!latestSubmissions.length && !loading && (
        <Alert severity="info">You have not submitted any inductions yet.</Alert>
      )}
      {!!latestSubmissions.length && (
        <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', p: 0 }}>
          <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Project</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Submitted</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {latestSubmissions.map((submission) => {
                  const projectName = typeof submission?.projectId === 'string' ? submission.projectId : submission?.projectId?.name || submission?.projectId?._id
                  return (
                    <TableRow key={submission._id} hover>
                      <TableCell>{projectName || 'Project'}</TableCell>
                      <TableCell>
                        <Chip size="small" label={submission?.status || 'pending'} color={submission?.status === 'approved' ? 'success' : submission?.status === 'declined' ? 'error' : 'warning'} />
                      </TableCell>
                      <TableCell>{submission?.createdAt ? new Date(submission.createdAt).toLocaleString() : '-'}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </Box>
        </Card>
      )}
    </Box>
  )

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>Worker Dashboard</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        View your inductions, progress, and recent activity in one place.
      </Typography>
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {error && (
        <Card sx={{ ...cardStyles, mb: 3 }}>
          <Typography variant="body2" color="error.main">{error}</Typography>
        </Card>
      )}
      <Card sx={cardStyles}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: '1px solid', borderColor: 'grey.200' }}>
          <Tab label="Overview" />
          <Tab label="My Projects" />
          <Tab label="My Activity" />
        </Tabs>
        <Box hidden={tab !== 0}>{overviewTab}</Box>
        <Box hidden={tab !== 1}>{projectsTab}</Box>
        <Box hidden={tab !== 2}>{activityTab}</Box>
      </Card>
    </Box>
  )
}
