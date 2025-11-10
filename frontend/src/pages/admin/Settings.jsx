import React from 'react'
import { Card, CardContent, Typography, TextField, Stack, Button, Alert, Grid, Paper, Box } from '@mui/material'
import AsyncButton from '../../components/AsyncButton.jsx'
import api from '../../utils/api.js'

// Admin Settings: BrandConfig editor
// - Loads current config on mount (GET /brand-config)
// - Lets admin edit companyName, logoUrl, primaryColor, secondaryColor
// - Saves via POST (create) or PUT (update by id)

export default function Settings() {
  const [id, setId] = React.useState('')
  const [companyName, setCompanyName] = React.useState('')
  const [logoUrl, setLogoUrl] = React.useState('')
  const [primaryColor, setPrimaryColor] = React.useState('#1976d2')
  const [secondaryColor, setSecondaryColor] = React.useState('#0B132B')
  const [status, setStatus] = React.useState({ kind: 'idle', msg: '' }) // idle|success|error

  // Fetch current branding on mount
  React.useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const r = await api.get('/brand-config')
        const cfg = r.data || null
        if (!cfg) return
        if (cancelled) return
        setId(cfg._id || '')
        setCompanyName(cfg.companyName || '')
        setLogoUrl(cfg.logoUrl || '')
        setPrimaryColor(cfg.primaryColor || '#1976d2')
        setSecondaryColor(cfg.secondaryColor || '#0B132B')
      } catch (_) { /* show nothing on initial load */ }
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

  const Preview = () => (
    <Paper variant="outlined" sx={{ mt: 2, borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, background: `linear-gradient(90deg, ${primaryColor} 0%, ${secondaryColor} 100%)`, color: '#fff' }}>
        {logoUrl ? (
          <Box component="img" src={logoUrl} alt="Logo" sx={{ height: 40, width: 'auto', borderRadius: 1, bgcolor: 'rgba(255,255,255,0.1)' }} />
        ) : (
          <Box sx={{ height: 40, width: 40, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.2)' }} />
        )}
        <Typography variant="h6" sx={{ fontWeight: 800 }}>{companyName || 'Company'}</Typography>
      </Box>
    </Paper>
  )

  return (
    <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Brand Settings</Typography>

        {status.kind === 'success' && <Alert severity="success" sx={{ mb: 2 }}>{status.msg}</Alert>}
        {status.kind === 'error' && <Alert severity="error" sx={{ mb: 2 }}>{status.msg}</Alert>}

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Stack spacing={2} sx={{ maxWidth: 520 }}>
              <TextField label="Company Name" value={companyName} onChange={(e)=> setCompanyName(e.target.value)} />
              <TextField label="Logo URL" value={logoUrl} onChange={(e)=> setLogoUrl(e.target.value)} />

              {/* Colors */}
              <Stack direction="row" spacing={2} alignItems="center">
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">Primary Color</Typography>
                  <input type="color" value={primaryColor} onChange={(e)=> setPrimaryColor(e.target.value)} style={{ height: 40, width: 64, border: 'none', background: 'transparent' }} />
                </Stack>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">Secondary Color</Typography>
                  <input type="color" value={secondaryColor} onChange={(e)=> setSecondaryColor(e.target.value)} style={{ height: 40, width: 64, border: 'none', background: 'transparent' }} />
                </Stack>
              </Stack>

              <AsyncButton variant="contained" onClick={save} disabled={!companyName}>Save Changes</AsyncButton>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">Preview</Typography>
            <Preview />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}
