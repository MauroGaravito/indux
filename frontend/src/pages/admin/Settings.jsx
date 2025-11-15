import React from 'react'
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Stack,
  Button,
  Alert,
  Grid,
  Paper,
  Box,
  Divider,
  Chip,
  Switch,
  FormControlLabel
} from '@mui/material'
import AsyncButton from '../../components/common/AsyncButton.jsx'
import api from '../../utils/api.js'
import logoFallback from '../../assets/indux-logo.png'

const cardStyles = {
  borderRadius: 3,
  p: 3,
  bgcolor: '#fff',
  boxShadow: '0 8px 30px rgba(15,23,42,0.03)'
}

export default function Settings() {
  const [id, setId] = React.useState('')
  const [companyName, setCompanyName] = React.useState('')
  const [logoUrl, setLogoUrl] = React.useState('')
  const [primaryColor, setPrimaryColor] = React.useState('#1976d2')
  const [secondaryColor, setSecondaryColor] = React.useState('#0B132B')
  const [status, setStatus] = React.useState({ kind: 'idle', msg: '' }) // idle|success|error

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const r = await api.get('/brand-config')
        const cfg = r.data || null
        if (!cfg || cancelled) return
        setId(cfg._id || '')
        setCompanyName(cfg.companyName || '')
        setLogoUrl(cfg.logoUrl || '')
        setPrimaryColor(cfg.primaryColor || '#1976d2')
        setSecondaryColor(cfg.secondaryColor || '#0B132B')
      } catch (_) {}
    }
    load()
    return () => { cancelled = true }
  }, [])

  const save = async () => {
    setStatus({ kind: 'idle', msg: '' })
    try {
      const body = { companyName, logoUrl, primaryColor, secondaryColor }
      let resp
      if (id) resp = await api.put(`/brand-config/${id}`, body)
      else resp = await api.post('/brand-config', body)
      const cfg = resp.data
      setId(cfg?._id || id)
      setStatus({ kind: 'success', msg: 'Brand settings saved successfully.' })
    } catch (e) {
      setStatus({ kind: 'error', msg: 'Failed to save brand settings.' })
    }
  }

  const gradient = `linear-gradient(120deg, ${primaryColor || '#1976d2'} 0%, ${secondaryColor || '#0B132B'} 100%)`

  return (
    <Box>
      {status.kind === 'success' && <Alert severity="success" sx={{ mb: 2 }}>{status.msg}</Alert>}
      {status.kind === 'error' && <Alert severity="error" sx={{ mb: 2 }}>{status.msg}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={cardStyles}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Brand Identity</Typography>
            <Stack spacing={2}>
              <TextField
                label="Company Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                fullWidth
              />
              <TextField
                label="Logo URL"
                helperText="Public logo URL for the app header"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                fullWidth
              />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Primary Color</Typography>
                  <Box sx={{ mt: 1, border: '1px solid #E5E7EB', borderRadius: 1, p: 1.5 }}>
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      style={{ height: 40, width: '100%', border: 'none', background: 'transparent', cursor: 'pointer' }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Secondary Color</Typography>
                  <Box sx={{ mt: 1, border: '1px solid #E5E7EB', borderRadius: 1, p: 1.5 }}>
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      style={{ height: 40, width: '100%', border: 'none', background: 'transparent', cursor: 'pointer' }}
                    />
                  </Box>
                </Grid>
              </Grid>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <AsyncButton variant="contained" onClick={save} disabled={!companyName}>
                  Save Changes
                </AsyncButton>
              </Box>
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={cardStyles}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Live Brand Preview</Typography>
            <Box sx={{ borderRadius: 2, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
              <Box sx={{ p: 2, background: gradient, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    component="img"
                    src={logoUrl || logoFallback}
                    alt="Logo preview"
                    sx={{ height: 40, width: 40, borderRadius: 1, objectFit: 'contain', bgcolor: 'rgba(255,255,255,0.1)' }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{companyName || 'INDUX'}</Typography>
                </Box>
                <Stack direction="row" spacing={2} sx={{ fontSize: 13 }}>
                  <span>Dashboard</span>
                  <span>Projects</span>
                  <span>Teams</span>
                </Stack>
              </Box>
              <Divider />
              <Box sx={{ p: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>Component Preview</Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button variant="contained" sx={{ bgcolor: primaryColor || '#1976d2', '&:hover': { bgcolor: primaryColor || '#1976d2' } }}>
                    Primary Action
                  </Button>
                  <Button variant="outlined" sx={{ borderColor: secondaryColor || '#0B132B', color: secondaryColor || '#0B132B' }}>
                    Secondary Action
                  </Button>
                </Stack>
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Chip label="Active" sx={{ bgcolor: primaryColor || '#1976d2', color: '#fff' }} />
                  <Chip label="Warning" sx={{ bgcolor: secondaryColor || '#0B132B', color: '#fff' }} />
                </Stack>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={cardStyles}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>System Information</Typography>
            <Stack spacing={1.5}>
              <InfoRow label="Brand name" value={companyName || 'INDUX'} />
              <InfoRow label="Primary color" value={primaryColor} swatch />
              <InfoRow label="Secondary color" value={secondaryColor} swatch />
              <InfoRow label="Domain" value={window.location?.host || 'local'} />
              <InfoRow label="API Base" value={import.meta.env.VITE_API_URL || 'Not configured'} />
            </Stack>
            {/* TODO (backend): expose backend version via /version or /health */}
            {/* TODO (backend): attach build metadata for admin diagnostics */}
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={cardStyles}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Future Options</Typography>
            <Stack spacing={2}>
              <FormControlLabel control={<Switch disabled />} label="Enable custom favicon" />
              {/* TODO (backend): support favicon upload in BrandConfig */}
              <FormControlLabel control={<Switch disabled />} label="Enable custom typography" />
              {/* TODO (backend): extend BrandConfig with font family and typography settings */}
              <FormControlLabel control={<Switch disabled />} label="Enable multi-brand / white-label mode" />
              {/* TODO (backend): support multiple BrandConfig records and tenant scoping */}
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

function InfoRow({ label, value, swatch }) {
  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Typography variant="body2" color="text.secondary" sx={{ width: 160 }}>
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 600 }}>
        {value}
      </Typography>
      {swatch && (
        <Box sx={{ width: 20, height: 20, borderRadius: '50%', border: '1px solid #E5E7EB', bgcolor: value }} />
      )}
    </Stack>
  )
}
