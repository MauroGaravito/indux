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
        const [projResp, usersResp] = await Promise.all([
          api.get('/projects'),
          api.get('/users')
        ])
        const projects = projResp.data || []
        const users = usersResp.data || []

        // load modules per project
        let approvedSubs = 0
        let pendingSubs = 0
        let pendingModuleReviews = 0
        for (const p of projects) {
          try {
            const modResp = await api.get(`/projects/${p._id}/modules/induction`)
            const mod = modResp.data.module
            if (!mod?._id) continue
            const [approved, pending, reviews] = await Promise.all([
              api.get(`/modules/${mod._id}/submissions`, { params: { status: 'approved' } }).catch(() => ({ data: [] })),
              api.get(`/modules/${mod._id}/submissions`, { params: { status: 'pending' } }).catch(() => ({ data: [] })),
              api.get(`/modules/${mod._id}/reviews`).catch(() => ({ data: [] }))
            ])
            approvedSubs += (approved.data || []).length
            pendingSubs += (pending.data || []).length
            pendingModuleReviews += (reviews.data || []).filter((r) => r.status === 'pending').length
          } catch (_) {}
        }

        if (!mounted) return
        setStats({
          projects: projects.length,
          completed: approvedSubs,
          pendingReviews: pendingSubs + pendingModuleReviews,
          users: users.length
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
        <Grid item xs={12} sm={6} md={3}><Stat label="Projects" value={loading ? '...' : String(stats.projects)} /></Grid>
        <Grid item xs={12} sm={6} md={3}><Stat label="Inductions Completed" value={loading ? '...' : String(stats.completed)} /></Grid>
        <Grid item xs={12} sm={6} md={3}><Stat label="Pending Reviews" value={loading ? '...' : String(stats.pendingReviews)} /></Grid>
        <Grid item xs={12} sm={6} md={3}><Stat label="Users" value={loading ? '...' : String(stats.users)} /></Grid>
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
