import React from 'react'
import { Grid, Card, CardContent, Typography, Box } from '@mui/material'

const Stat = ({ label, value }) => (
  <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3 }}>
    <CardContent>
      <Typography variant="overline" sx={{ opacity: 0.7 }}>{label}</Typography>
      <Typography variant="h4" sx={{ fontWeight: 800 }}>{value}</Typography>
    </CardContent>
  </Card>
)

export default function AdminDashboard() {
  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>Overview</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}><Stat label="Projects" value="1" /></Grid>
        <Grid item xs={12} sm={6} md={3}><Stat label="Inductions Completed" value="—" /></Grid>
        <Grid item xs={12} sm={6} md={3}><Stat label="Pending Reviews" value="—" /></Grid>
        <Grid item xs={12} sm={6} md={3}><Stat label="Users" value="3" /></Grid>
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

