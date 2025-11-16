import React from 'react'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Stack,
  Alert,
  Chip
} from '@mui/material'
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'
import PendingActionsIcon from '@mui/icons-material/PendingActions'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined'
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined'
import RateReviewIcon from '@mui/icons-material/RateReview'
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt'
import api from '../../utils/api.js'

const Stat = ({ label, value }) => (
  <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3 }}>
    <CardContent>
      <Typography variant="overline" sx={{ opacity: 0.7 }}>{label}</Typography>
      <Typography variant="h4" sx={{ fontWeight: 800 }}>{value}</Typography>
    </CardContent>
  </Card>
)

const cardStyles = {
  borderRadius: 3,
  p: 3,
  bgcolor: '#fff',
  boxShadow: '0 8px 30px rgba(15, 23, 42, 0.03)'
}

export default function AdminDashboard() {
  const [stats, setStats] = React.useState({ projects: 0, completed: 0, pendingReviews: 0, users: 0 })
  const [projects, setProjects] = React.useState([])
  const [projectsError, setProjectsError] = React.useState('')
  const [projectsLoading, setProjectsLoading] = React.useState(true)
  const [submissions, setSubmissions] = React.useState([])
  const [submissionsError, setSubmissionsError] = React.useState('')
  const [submissionsLoading, setSubmissionsLoading] = React.useState(true)
  const [reviews, setReviews] = React.useState([])
  const [reviewsError, setReviewsError] = React.useState('')
  const [reviewsLoading, setReviewsLoading] = React.useState(true)
  const [users, setUsers] = React.useState([])
  const [usersError, setUsersError] = React.useState('')
  const [usersLoading, setUsersLoading] = React.useState(true)

  React.useEffect(() => {
    let mounted = true
    async function fetchProjects() {
      setProjectsLoading(true); setProjectsError('')
      try {
        const res = await api.get('/projects')
        if (mounted) setProjects(res.data || [])
      } catch (e) {
        if (mounted) setProjectsError(e?.response?.data?.message || 'Failed to load projects')
      } finally { if (mounted) setProjectsLoading(false) }
    }
    async function fetchSubmissions() {
      setSubmissionsLoading(true); setSubmissionsError('')
      try {
        const res = await api.get('/submissions')
        if (mounted) setSubmissions(res.data || [])
      } catch (e) {
        if (mounted) setSubmissionsError(e?.response?.data?.message || 'Failed to load submissions')
      } finally { if (mounted) setSubmissionsLoading(false) }
    }
    async function fetchReviews() {
      setReviewsLoading(true); setReviewsError('')
      try {
        const res = await api.get('/reviews/projects')
        if (mounted) setReviews(res.data || [])
      } catch (e) {
        if (mounted) setReviewsError(e?.response?.data?.message || 'Failed to load reviews')
      } finally { if (mounted) setReviewsLoading(false) }
    }
    async function fetchUsers() {
      setUsersLoading(true); setUsersError('')
      try {
        const res = await api.get('/users')
        if (mounted) setUsers(res.data || [])
      } catch (e) {
        if (mounted) setUsersError(e?.response?.data?.message || 'Failed to load users')
      } finally { if (mounted) setUsersLoading(false) }
    }
    fetchProjects()
    fetchSubmissions()
    fetchReviews()
    fetchUsers()
    return () => { mounted = false }
  }, [])

  React.useEffect(() => {
    const completedCount = submissions.filter((s) => s?.status === 'approved').length
    const pendingSubmissions = submissions.filter((s) => s?.status === 'pending').length
    const pendingProjectReviews = reviews.filter((r) => r?.status === 'pending').length
    setStats({
      projects: projects.length,
      completed: completedCount,
      pendingReviews: pendingSubmissions + pendingProjectReviews,
      users: users.length
    })
  }, [projects, submissions, reviews, users])

  const overallLoading = projectsLoading || submissionsLoading || reviewsLoading || usersLoading

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>Overview</Typography>
      {overallLoading && <LinearProgress sx={{ mb: 2 }} />}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}><Stat label="Projects" value={overallLoading ? '...' : String(stats.projects)} /></Grid>
        <Grid item xs={12} sm={6} md={3}><Stat label="Inductions Completed" value={overallLoading ? '...' : String(stats.completed)} /></Grid>
        <Grid item xs={12} sm={6} md={3}><Stat label="Pending Reviews" value={overallLoading ? '...' : String(stats.pendingReviews)} /></Grid>
        <Grid item xs={12} sm={6} md={3}><Stat label="Users" value={overallLoading ? '...' : String(stats.users)} /></Grid>
      </Grid>
      <Card sx={{ ...cardStyles, mt: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Recent Activity</Typography>
        {(projectsError || submissionsError || reviewsError || usersError) && (
          <Alert severity="error" sx={{ mb: 2 }}>{projectsError || submissionsError || reviewsError || usersError}</Alert>
        )}
        {(projectsLoading || submissionsLoading || reviewsLoading || usersLoading) && <LinearProgress sx={{ mb: 2 }} />}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <ActivityTimeline submissions={submissions} reviews={reviews} users={users} />
          </Grid>
          <Grid item xs={12} md={6}>
            <WeeklySnapshot projects={projects} submissions={submissions} users={users} />
          </Grid>
          <Grid item xs={12}>
            <SystemStatusCard projects={projects} submissions={submissions} reviews={reviews} users={users} />
          </Grid>
        </Grid>
      </Card>
    </Box>
  )
}

function ActivityTimeline({ submissions, reviews, users }) {
  const timeline = React.useMemo(() => {
    const latestSubmissions = [...(submissions || [])]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((s) => ({
        type: 'submission',
        title: 'Submission Completed',
        subtitle: `${s?.projectId?.name || s?.projectId || 'Project'} • ${s?.userId?.name || s?.user?.name || ''}`,
        date: s?.createdAt
      }))
    const latestReviews = [...(reviews || [])]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((r) => ({
        type: 'review',
        title: 'Submission Review',
        subtitle: `${r?.projectId?.name || r?.projectId || 'Project'} • Status: ${r?.status || 'pending'}`,
        date: r?.createdAt
      }))
    const latestUsers = [...(users || [])]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((u) => ({
        type: 'user',
        title: 'New User Registered',
        subtitle: `${u?.name || u?.email || 'User'} • Role: ${u?.role || '-'}`,
        date: u?.createdAt
      }))
    return [...latestSubmissions, ...latestReviews, ...latestUsers]
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
      .slice(0, 5)
  }, [submissions, reviews, users])

  const iconFor = (type) => {
    if (type === 'submission') return <AssignmentTurnedInIcon color="success" />
    if (type === 'review') return <RateReviewIcon color="warning" />
    return <PersonAddAltIcon color="primary" />
  }

  return (
    <Card sx={cardStyles}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Recent Activity</Typography>
      {!timeline.length && <Typography variant="body2" color="text.secondary">No activity yet.</Typography>}
      <Stack spacing={2}>
        {timeline.map((item, idx) => (
          <Stack key={`${item.type}-${idx}`} direction="row" spacing={2} alignItems="center" sx={{ pb: 2, borderBottom: idx !== timeline.length - 1 ? '1px solid #EDF0F7' : 'none' }}>
            {iconFor(item.type)}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{item.title}</Typography>
              <Typography variant="body2" color="text.secondary">{item.subtitle}</Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <Typography variant="caption" color="text.secondary">{item.date ? new Date(item.date).toLocaleString() : '-'}</Typography>
          </Stack>
        ))}
      </Stack>
    </Card>
  )
}

function WeeklySnapshot({ projects, submissions, users }) {
  const chartData = React.useMemo(() => {
    const days = Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date()
      d.setHours(0, 0, 0, 0)
      d.setDate(d.getDate() - (6 - idx))
      return d
    })
    const countFor = (items) => days.map((day) => {
      const count = (items || []).filter((item) => {
        const created = item?.createdAt ? new Date(item.createdAt) : null
        if (!created) return false
        created.setHours(0, 0, 0, 0)
        return created.getTime() === day.getTime()
      }).length
      return { day: day.toLocaleDateString(undefined, { weekday: 'short' }), count }
    })
    return {
      submissions: countFor(submissions),
      users: countFor(users),
      projects: countFor(projects)
    }
  }, [projects, submissions, users])

  const BarChart = ({ data, color }) => {
    const max = Math.max(...data.map((d) => d.count), 1)
    return (
      <Stack direction="row" spacing={1} alignItems="flex-end" sx={{ height: 80 }}>
        {data.map((item) => (
          <Box key={item.day} sx={{ flex: 1, textAlign: 'center' }}>
            <Box sx={{ height: `${(item.count / max) * 70 + 4}px`, bgcolor: color, borderRadius: 1 }} />
            <Typography variant="caption" color="text.secondary">{item.day}</Typography>
          </Box>
        ))}
      </Stack>
    )
  }

  return (
    <Card sx={cardStyles}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Weekly Snapshot</Typography>
      <Stack spacing={2}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={1}>
            <AssignmentTurnedInIcon color="primary" />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Submissions Past 7 Days</Typography>
            <Chip size="small" label={chartData.submissions.reduce((acc, item) => acc + item.count, 0)} />
          </Stack>
          <BarChart data={chartData.submissions} color="#2563eb" />
        </Box>
        <Box>
          <Stack direction="row" alignItems="center" spacing={1}>
            <PersonAddAltIcon color="success" />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>New Users Past 7 Days</Typography>
            <Chip size="small" label={chartData.users.reduce((acc, item) => acc + item.count, 0)} />
          </Stack>
          <BarChart data={chartData.users} color="#16a34a" />
        </Box>
        <Box>
          <Stack direction="row" alignItems="center" spacing={1}>
            <FolderOpenIcon color="warning" />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Projects Past 7 Days</Typography>
            <Chip size="small" label={chartData.projects.reduce((acc, item) => acc + item.count, 0)} />
          </Stack>
          <BarChart data={chartData.projects} color="#f97316" />
        </Box>
      </Stack>
    </Card>
  )
}

function SystemStatusCard({ projects, submissions, reviews, users }) {
  const pendingSubmissions = (submissions || []).filter((s) => s?.status === 'pending').length
  const pendingProjectReviews = (reviews || []).filter((r) => r?.status === 'pending').length
  return (
    <Card sx={cardStyles}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>System Status</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <StatusStat icon={<FolderOpenIcon color="primary" />} label="Total Projects" value={projects.length} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatusStat icon={<GroupOutlinedIcon color="secondary" />} label="Total Users" value={users.length} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatusStat icon={<TimelineOutlinedIcon color="info" />} label="Submissions" value={submissions.length} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatusStat icon={<PendingActionsIcon color="warning" />} label="Pending Reviews" value={pendingSubmissions + pendingProjectReviews} />
        </Grid>
      </Grid>
    </Card>
  )
}

function StatusStat({ icon, label, value }) {
  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, height: '100%' }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        {icon}
        <Box>
          <Typography variant="body2" color="text.secondary">{label}</Typography>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{value}</Typography>
        </Box>
      </Stack>
    </Box>
  )
}

