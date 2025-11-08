import React from 'react'
import { Grid, Card, CardContent, Typography, Box, LinearProgress } from '@mui/material'
import api from '../../utils/api.js'

const Stat = ({ label, value }) => (
  <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3 }}>
    <CardContent>
      <Typography variant="overline" sx={{ opacity: 0.7 }}>{label}</Typography>
      <Typography variant="h4" sx={{ fontWeight: 800 }}>{value}</Typography>
    </CardContent>
  </Card>
)

export default function AdminDashboard() {
  const [loading, setLoading] = React.useState(true)
  const [stats, setStats] = React.useState({ projects: 0, completed: 0, pendingReviews: 0, users: 0 })

  React.useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const [proj, users, approved, pendingSubs, projReviews] = await Promise.all([
          api.get('/projects'),
          api.get('/users'),
          api.get('/submissions', { params: { status: 'approved' } }),
          api.get('/submissions', { params: { status: 'pending' } }),
          api.get('/reviews/projects')
        ])
        if (!mounted) return
        const projectsCount = (proj.data || []).length
        const usersCount = (users.data || []).length
        const completedCount = (approved.data || []).length
        const pendingSubmissions = (pendingSubs.data || []).length
        const pendingProjectReviews = (projReviews.data || []).length
        setStats({
          projects: projectsCount,
          completed: completedCount,
          pendingReviews: pendingSubmissions + pendingProjectReviews,
          users: usersCount
        })
      } finally { if (mounted) setLoading(false) }
    }
    load()
    return () => { mounted = false }
  }, [])

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>Overview</Typography>
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}><Stat label="Projects" value={loading ? '—' : String(stats.projects)} /></Grid>
        <Grid item xs={12} sm={6} md={3}><Stat label="Inductions Completed" value={loading ? '—' : String(stats.completed)} /></Grid>
        <Grid item xs={12} sm={6} md={3}><Stat label="Pending Reviews" value={loading ? '—' : String(stats.pendingReviews)} /></Grid>
        <Grid item xs={12} sm={6} md={3}><Stat label="Users" value={loading ? '—' : String(stats.users)} /></Grid>
      </Grid>
      <Card elevation={0} sx={{ mt: 3, border: '1px solid #E5E7EB', borderRadius: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Activity</Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>Charts and detailed metrics can be integrated here.</Typography>
        </CardContent>
      </Card>
    </Box>
  )
}

