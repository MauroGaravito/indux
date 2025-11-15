import React, { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Grid,
  Card,
  Typography,
  Stack,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab,
  Chip,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button
} from '@mui/material'
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined'
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined'
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import { Link as RouterLink } from 'react-router-dom'
import api from '../../utils/api.js'

const statusChipColor = (status) => {
  if (!status || status === 'pending') return 'warning'
  if (status === 'approved') return 'success'
  if (status === 'declined' || status === 'rejected') return 'error'
  return 'default'
}

export default function ManagerProjects() {
  const [projects, setProjects] = useState([])
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [projectsError, setProjectsError] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [selectedProject, setSelectedProject] = useState(null)
  const [tab, setTab] = useState(0)

  const [team, setTeam] = useState([])
  const [teamLoading, setTeamLoading] = useState(false)
  const [teamError, setTeamError] = useState('')

  const [submissions, setSubmissions] = useState([])
  const [submissionsLoading, setSubmissionsLoading] = useState(false)
  const [submissionsError, setSubmissionsError] = useState('')

  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewsError, setReviewsError] = useState('')

  const cardStyles = {
    borderRadius: 3,
    p: 3,
    bgcolor: '#fff',
    boxShadow: '0 8px 30px rgba(15, 23, 42, 0.03)'
  }

  useEffect(() => {
    let active = true
    async function loadProjects() {
      setLoadingProjects(true)
      setProjectsError('')
      try {
        const r = await api.get('/projects')
        const list = Array.isArray(r.data) ? r.data : []
        if (!active) return
        setProjects(list)
        if (!selectedProjectId && list.length) {
          setSelectedProjectId(list[0]._id)
          setSelectedProject(list[0])
        } else if (selectedProjectId) {
          const next = list.find((p) => p._id === selectedProjectId) || null
          setSelectedProject(next)
        }
      } catch (e) {
        if (!active) return
        setProjectsError(e?.response?.data?.message || 'Failed to load projects')
        setProjects([])
        setSelectedProject(null)
        setSelectedProjectId('')
      } finally {
        if (active) setLoadingProjects(false)
      }
    }
    loadProjects()
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!selectedProjectId) {
      setTeam([])
      setSubmissions([])
      setReviews([])
      return
    }
    const project = projects.find((p) => p._id === selectedProjectId) || null
    setSelectedProject(project)
  }, [selectedProjectId, projects])

  useEffect(() => {
    if (!selectedProjectId) return
    let active = true
    async function loadTeam() {
      setTeamLoading(true)
      setTeamError('')
      try {
        const r = await api.get(`/assignments/project/${selectedProjectId}`)
        const list = Array.isArray(r.data) ? r.data : []
        if (active) setTeam(list.filter((a) => a.role === 'worker'))
      } catch (e) {
        if (active) {
          setTeamError(e?.response?.data?.message || 'Failed to load team')
          setTeam([])
        }
      } finally {
        if (active) setTeamLoading(false)
      }
    }
    loadTeam()
    return () => { active = false }
  }, [selectedProjectId])

  useEffect(() => {
    if (!selectedProjectId) return
    let active = true
    async function loadSubmissions() {
      setSubmissionsLoading(true)
      setSubmissionsError('')
      try {
        const r = await api.get('/submissions', { params: { status: 'all', projectId: selectedProjectId } })
        const list = Array.isArray(r.data) ? r.data : []
        if (active) setSubmissions(list.filter((s) => {
          const pid = typeof s?.projectId === 'string' ? s.projectId : s?.projectId?._id
          return !selectedProjectId || pid === selectedProjectId
        }))
      } catch (e) {
        if (active) {
          setSubmissionsError(e?.response?.data?.message || 'Failed to load submissions')
          setSubmissions([])
        }
      } finally {
        if (active) setSubmissionsLoading(false)
      }
    }
    loadSubmissions()
    return () => { active = false }
  }, [selectedProjectId])

  useEffect(() => {
    if (!selectedProjectId) return
    let active = true
    async function loadReviews() {
      setReviewsLoading(true)
      setReviewsError('')
      try {
        const r = await api.get('/reviews/projects')
        const list = Array.isArray(r.data) ? r.data : []
        if (active) {
          setReviews(list.filter((rev) => {
            const pid = typeof rev?.projectId === 'string' ? rev.projectId : rev?.projectId?._id
            return pid === selectedProjectId
          }))
        }
      } catch (e) {
        if (active) {
          setReviewsError(e?.response?.data?.message || 'Failed to load review history')
          setReviews([])
        }
      } finally {
        if (active) setReviewsLoading(false)
      }
    }
    loadReviews()
    return () => { active = false }
  }, [selectedProjectId])

  const metrics = useMemo(() => {
    const totalWorkers = team.length
    const totalSubmissions = submissions.length
    const pendingSubmissions = submissions.filter((s) => !s?.status || s.status === 'pending').length
    const lastReview = [...reviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
    return { totalWorkers, totalSubmissions, pendingSubmissions, lastReview }
  }, [team, submissions, reviews])

  const renderProjectList = () => (
    <Card sx={cardStyles}>
      <Stack spacing={2}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>My Projects</Typography>
        {loadingProjects && <Typography variant="body2" color="text.secondary">Loading projects...</Typography>}
        {projectsError && <Typography variant="body2" color="error.main">{projectsError}</Typography>}
        {!loadingProjects && !projects.length && (
          <Typography variant="body2" color="text.secondary">You have no assigned projects yet.</Typography>
        )}
        <List sx={{ p: 0, m: 0 }}>
          {projects.map((project) => {
            const selected = selectedProjectId === project._id
            return (
              <ListItemButton
                key={project._id}
                selected={selected}
                onClick={() => setSelectedProjectId(project._id)}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  border: '1px solid',
                  borderColor: selected ? 'primary.main' : 'grey.200',
                  backgroundColor: selected ? 'rgba(25, 118, 210, 0.08)' : '#fff'
                }}
              >
                <ListItemIcon sx={{ color: selected ? 'primary.main' : 'text.secondary', minWidth: 40 }}>
                  <FolderOutlinedIcon />
                </ListItemIcon>
                <ListItemText
                  primary={project.name}
                  primaryTypographyProps={{ fontWeight: selected ? 600 : 500 }}
                  secondary={project.description || 'Active'}
                  secondaryTypographyProps={{ color: 'text.secondary' }}
                />
              </ListItemButton>
            )
          })}
        </List>
      </Stack>
    </Card>
  )

  const overviewTab = (
    <Box sx={{ mt: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" color="text.secondary">Name</Typography>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedProject?.name || '-'}</Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" color="text.secondary">Status</Typography>
          <Chip
            size="small"
            label={selectedProject?.status || 'Active'}
            color={statusChipColor(selectedProject?.status)}
            sx={{ mt: 0.5 }}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle2" color="text.secondary">Description</Typography>
          <Typography variant="body1">{selectedProject?.description || 'No description provided.'}</Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" color="text.secondary">Created</Typography>
          <Typography variant="body2">{selectedProject?.createdAt ? new Date(selectedProject.createdAt).toLocaleString() : '-'}</Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" color="text.secondary">Last Updated</Typography>
          <Typography variant="body2">{selectedProject?.updatedAt ? new Date(selectedProject.updatedAt).toLocaleString() : '-'}</Typography>
        </Grid>
      </Grid>
      <Divider sx={{ my: 3 }} />
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, p: 2, bgcolor: 'grey.50', boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <PeopleAltOutlinedIcon color="primary" />
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Team Members</Typography>
                <Typography variant="h6">{metrics.totalWorkers}</Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, p: 2, bgcolor: 'grey.50', boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <TimelineOutlinedIcon color="primary" />
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Total Submissions</Typography>
                <Typography variant="h6">{metrics.totalSubmissions}</Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, p: 2, bgcolor: 'grey.50', boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <AssignmentIndOutlinedIcon color="primary" />
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Pending</Typography>
                <Typography variant="h6">{metrics.pendingSubmissions}</Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>
      {reviewsError && <Typography variant="body2" color="error.main" sx={{ mt: 2 }}>{reviewsError}</Typography>}
      {metrics.lastReview && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" color="text.secondary">Last Review</Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }}>
            <Chip size="small" label={metrics.lastReview.status} color={statusChipColor(metrics.lastReview.status)} />
            <Typography variant="body2" color="text.secondary">
              {metrics.lastReview.updatedAt ? new Date(metrics.lastReview.updatedAt).toLocaleString() : metrics.lastReview.createdAt ? new Date(metrics.lastReview.createdAt).toLocaleString() : ''}
            </Typography>
          </Stack>
        </Box>
      )}
    </Box>
  )

  const teamTab = (
    <Box sx={{ mt: 3 }}>
      {teamLoading && <Typography variant="body2" color="text.secondary">Loading team...</Typography>}
      {teamError && <Typography variant="body2" color="error.main">{teamError}</Typography>}
      {!teamLoading && !team.length && (
        <Typography variant="body2" color="text.secondary">No workers assigned to this project yet.</Typography>
      )}
      {!!team.length && (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Worker</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Assigned At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {team.map((member) => (
              <TableRow key={member._id} hover>
                <TableCell>{member?.user?.name || member.user}</TableCell>
                <TableCell>{member?.user?.email || '-'}</TableCell>
                <TableCell>{member?.createdAt ? new Date(member.createdAt).toLocaleString() : '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  )

  const activityTab = (
    <Box sx={{ mt: 3 }}>
      {submissionsLoading && <Typography variant="body2" color="text.secondary">Loading submissions...</Typography>}
      {submissionsError && <Typography variant="body2" color="error.main">{submissionsError}</Typography>}
      {!submissionsLoading && !submissions.length && (
        <Typography variant="body2" color="text.secondary">No submissions yet for this project.</Typography>
      )}
      {!!submissions.length && (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Worker</TableCell>
              <TableCell>Submitted At</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {submissions.map((submission) => {
              const worker = submission?.userId || submission?.user || {}
              return (
                <TableRow key={submission._id} hover>
                  <TableCell>{worker?.name || submission?.userId || '-'}</TableCell>
                  <TableCell>{submission?.createdAt ? new Date(submission.createdAt).toLocaleString() : '-'}</TableCell>
                  <TableCell>
                    <Chip size="small" color={statusChipColor(submission.status)} label={submission.status || 'pending'} />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="outlined"
                      component={RouterLink}
                      to="/manager/review"
                      sx={{ textTransform: 'none' }}
                    >
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
    </Box>
  )

  const renderDetails = () => {
    if (!selectedProject) {
      return (
        <Card sx={cardStyles}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Project Details</Typography>
          <Box
            sx={{
              mt: 2,
              borderRadius: 2,
              border: '1px dashed',
              borderColor: 'divider',
              bgcolor: 'grey.50',
              minHeight: 240,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              color: 'text.secondary'
            }}
          >
            Select a project on the left to view details.
          </Box>
        </Card>
      )
    }

    return (
      <Card sx={cardStyles}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>{selectedProject?.name}</Typography>
        {selectedProject?.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {selectedProject.description}
          </Typography>
        )}
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mt: 3, borderBottom: '1px solid', borderColor: 'grey.200' }}>
          <Tab label="Overview" />
          <Tab label="Team" />
          <Tab label="Activity" />
        </Tabs>
        <Box hidden={tab !== 0}>{overviewTab}</Box>
        <Box hidden={tab !== 1}>{teamTab}</Box>
        <Box hidden={tab !== 2}>{activityTab}</Box>
      </Card>
    )
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>Projects</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          {renderProjectList()}
        </Grid>
        <Grid item xs={12} md={8}>
          {renderDetails()}
        </Grid>
      </Grid>
    </Box>
  )
}


