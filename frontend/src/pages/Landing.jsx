import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Box, Container, Typography, Button, Grid, Card, CardContent, Stack, Link } from '@mui/material'

const brand = {
  primary: '#0046FF',
  secondary: '#0B132B',
  accent: '#00D084',
  bg: '#F9FAFB',
}

export default function Landing() {
  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #F9FAFB 0%, #E3E9FF 100%)',
      color: brand.secondary,
    }}>
      <Container maxWidth="lg" sx={{ pt: { xs: 10, md: 14 }, pb: { xs: 8, md: 12 } }}>
        {/* Hero */}
        <Stack spacing={3} alignItems="center" textAlign="center">
          <Typography variant="h2" sx={{ fontWeight: 800, lineHeight: 1.1, fontFamily: 'Inter, Poppins, Roboto, sans-serif' }}>
            Smarter WHS inductions for Australian construction teams
          </Typography>
          <Typography variant="h6" sx={{ maxWidth: 900, opacity: 0.9 }}>
            Deliver digital inductions, track WHS compliance, and onboard crews securely in one place.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 1 }}>
            <Button component={RouterLink} to="/login" variant="contained" size="large" sx={{
              px: 4, py: 1.2, borderRadius: 2, textTransform: 'none', fontWeight: 700, backgroundColor: brand.primary
            }}>
              Access Demo Site
            </Button>
            <Button variant="outlined" size="large" href="#features" sx={{
              px: 4, py: 1.2, borderRadius: 2, textTransform: 'none', fontWeight: 700, borderColor: brand.primary, color: brand.primary
            }}>
              Explore Features
            </Button>
          </Stack>
        </Stack>

        {/* Features */}
        <Box id="features" sx={{ mt: { xs: 8, md: 12 } }}>
          <Typography variant="h4" align="center" sx={{ fontWeight: 800, mb: 4 }}>
            Everything required to run compliant site inductions.
          </Typography>
          <Grid container spacing={3}>
            {[
              { title: 'Admin Control Centre', desc: 'Configure induction content, slides, and workforce requirements with confidence.' },
              { title: 'Worker-Friendly Induction Wizard', desc: 'Mobile-ready steps that guide every crew member through site safety expectations.' },
              { title: 'Manager Approvals & Certificates', desc: 'Review submissions quickly and issue certificates instantly.' },
              { title: 'Secure WHS Records', desc: 'Slides, uploads, and certificates stored safely with S3-compatible encryption.' },
            ].map((f, i) => (
              <Grid key={i} item xs={12} sm={6} md={3}>
                <Card elevation={0} sx={{ height: '100%', borderRadius: 3, border: '1px solid #E5E7EB', background: '#fff' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: brand.secondary }}>{f.title}</Typography>
                    <Typography variant="body1" sx={{ opacity: 0.85 }}>{f.desc}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* CTA Footer */}
        <Box sx={{ mt: { xs: 8, md: 12 } }}>
          <Card elevation={0} sx={{
            borderRadius: 4,
            p: { xs: 3, md: 5 },
            background: `linear-gradient(135deg, ${brand.primary} 0%, ${brand.accent} 100%)`,
            color: '#fff',
          }}>
            <Stack direction={{ xs: 'column', md: 'row' }} alignItems="center" justifyContent="space-between" spacing={2}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                Ready to modernise your WHS induction process?
              </Typography>
              <Button component={RouterLink} to="/login" size="large" variant="contained" sx={{
                backgroundColor: '#fff', color: brand.secondary, textTransform: 'none', fontWeight: 800, px: 4
              }}>
                Start Now
              </Button>
            </Stack>
          </Card>
        </Box>

        <Box sx={{ mt: 6, textAlign: 'center', opacity: 0.6 }}>
          <Typography variant="body2">Indux Safety {new Date().getFullYear()} - Down Under Solutions</Typography>
        </Box>
      </Container>
    </Box>
  )
}
