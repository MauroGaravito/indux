import React, { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Grid,
  Card,
  Typography,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  LinearProgress,
  Button
} from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'
import PendingActionsIcon from '@mui/icons-material/PendingActions'
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined'
import { Link as RouterLink } from 'react-router-dom'
import api from '../../utils/api.js'

const cardStyles = {
  borderRadius: 3,
  p: 3,
  bgcolor: '#fff',
  boxShadow: '0 8px 30px rgba(15, 23, 42, 0.03)'
}

const StatCard = ({ icon, label, value }) => (
  <Card sx={cardStyles}>
    <Stack direction="row" spacing={2} alignItems="center">
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2,
          bgcolor: 'primary.light',
          color: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>{value}</Typography>
      </Box>
    </Stack>
  </Card>
)

const statusChipColor = (status) => {
  if (!status || status === 'pending') return 'warning'
  if (status === 'approved') return 'success'
  if (status === 'declined' || status === 'rejected') return 'error'
  return 'default'
}

export default function ManagerDashboard() {
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [pendingSubs, setPendingSubs] = useState([])
  const [approvedSubs, setApprovedSubs] = useState([])
  const [reviews, setReviews] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      setError('')
      try {
        const [projectsRes, allSubsRes, pendingRes, approvedRes, reviewsRes] = await Promise.all([
          api.get('/projects'),
          api.get('/submissions', { params: { status: 'all' } }),
          api.get('/submissions', { params: { status: 'pending' } }),
          api.get('/submissions', { params: { status: 'approved' } }),
          api.get('/reviews/projects')
        ])
        if (!active) return
        const ownedProjects = Array.isArray(projectsRes.data) ? projectsRes.data : []
        const projectIds = new Set(ownedProjects.map((p) => p._id))
        const filterByProject = (collection) => (Array.isArray(collection) ? collection : []).filter((item) => {
          const id = typeof item?.projectId === 'string' ? item.projectId : item?.projectId?._id
          return projectIds.has(id)
        })
        setProjects(ownedProjects)
        setSubmissions(filterByProject(allSubsRes.data).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
        setPendingSubs(filterByProject(pendingRes.data))
        setApprovedSubs(filterByProject(approvedRes.data))
        setReviews(filterByProject(reviewsRes.data))
      } catch (e) {
        if (active) {
          setError(e?.response?.data?.message || 'Failed to load dashboard')
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [])

  const stats = useMemo(() => {
    const approvedProjects = projects.filter((p) => p.reviewStatus === 'approved')
    const workersFromSubmissions = new Set(submissions.map((s) => {
      const user = s?.userId || s?.user
      if (typeof user === 'string') return user
      return user?._id || user?.email || user?.name
    }))
    return {
      projects: approvedProjects.length,
      pendingReviews: reviews.filter((r) => r.status === 'pending').length + projects.filter((p) => p.reviewStatus === 'pending').length,
      completedInductions: approvedSubs.length,
      activeWorkers: workersFromSubmissions.size
    }
  }, [projects, reviews, approvedSubs, submissions])

  const latestSubmissions = useMemo(() => submissions.slice(0, 5), [submissions])
  const projectSummary = useMemo(() => projects.slice(0, 5), [projects])

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>Manager Dashboard</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Monitor your projects, worker progress, and outstanding reviews.
      </Typography>
      {loading && <LinearProgress sx={{ mb: 3 }} />}
      {error && (
        <Card sx={{ ...cardStyles, mb: 3 }}>
          <Typography variant="body2" color="error.main">{error}</Typography>
        </Card>
      )}
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <StatCard icon={<TrendingUpIcon />} label="Active Projects" value={stats.projects} />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard icon={<PendingActionsIcon />} label="Pending Reviews" value={stats.pendingReviews} />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard icon={<AssignmentTurnedInIcon />} label="Completed Inductions" value={stats.completedInductions} />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard icon={<GroupOutlinedIcon />} label="Active Workers" value={stats.activeWorkers} />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 0.5 }}>
        <Grid item xs={12} md={7}>
          <Card sx={cardStyles}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Recent Submissions</Typography>
              <Button component={RouterLink} to="/manager/review" size="small" sx={{ textTransform: 'none' }}>
                Go to Review
              </Button>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Latest activity across your assigned projects.
            </Typography>
            {!latestSubmissions.length ? (
              <Typography variant="body2" color="text.secondary">No submissions yet.</Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Worker</TableCell>
                    <TableCell>Project</TableCell>
                    <TableCell>Submitted</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {latestSubmissions.map((submission) => {
                    const worker = submission?.userId || submission?.user || {}
                    const project = submission?.projectId
                    const workerName = typeof worker === 'string' ? worker : (worker?.name || worker?.email || worker?._id || '-')
                    const projectName = typeof project === 'string' ? project : (project?.name || project?._id || '-')
                    return (
                      <TableRow key={submission._id}>
                        <TableCell>{workerName}</TableCell>
                        <TableCell>{projectName}</TableCell>
                        <TableCell>{submission?.createdAt ? new Date(submission.createdAt).toLocaleString() : '-'}</TableCell>
                        <TableCell>
                          <Chip size="small" label={submission?.status || 'pending'} color={statusChipColor(submission?.status)} />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </Card>
        </Grid>
        <Grid item xs={12} md={5}>
          <Card sx={cardStyles}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Review Pipeline</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Track project configuration reviews awaiting your attention.
            </Typography>
            {!reviews.length ? (
              <Typography variant="body2" color="text.secondary">No reviews for your projects.</Typography>
            ) : (
              <Stack spacing={1.5}>
                {reviews.slice(0, 5).map((review) => (
                  <Card key={review._id} sx={{ borderRadius: 2, p: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{review?.projectId?.name || review?.projectId || 'Project'}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {review?.updatedAt ? new Date(review.updatedAt).toLocaleString() : review?.createdAt ? new Date(review.createdAt).toLocaleString() : ''}
                        </Typography>
                      </Box>
                      <Chip size="small" label={review?.status || 'pending'} color={statusChipColor(review?.status)} />
                    </Stack>
                  </Card>
                ))}
              </Stack>
            )}
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card sx={cardStyles}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>My Projects</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Review status for the projects you manage.
            </Typography>
            {!projectSummary.length ? (
              <Typography variant="body2" color="text.secondary">No projects assigned.</Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Project</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projectSummary.map((proj) => (
                    <TableRow key={proj._id}>
                      <TableCell>{proj.name}</TableCell>
                      <TableCell>{proj.description || 'No description provided.'}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={proj.reviewStatus || 'draft'}
                          color={statusChipColor(proj.reviewStatus)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
