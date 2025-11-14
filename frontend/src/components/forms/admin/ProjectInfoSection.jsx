import React from 'react'
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Grid,
  Stack,
  TextField,
  Typography,
  Button,
  LinearProgress,
  Paper,
  Chip,
  InputAdornment,
  Tooltip,
  IconButton,
  Divider,
  Dialog,
  DialogContent
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import BusinessIcon from '@mui/icons-material/Business'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import ContentPasteIcon from '@mui/icons-material/ContentPaste'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { uploadFile, presignGet } from '../../../utils/upload.js'

export default function ProjectInfoSection({ value, onChange }) {
  const v = value || {}
  const set = (k, val) => onChange({ ...v, [k]: val })

  const [progress, setProgress] = React.useState(null)
  const [mapPreview, setMapPreview] = React.useState('')
  const [previewOpen, setPreviewOpen] = React.useState(false)
  const fileInputRef = React.useRef(null)

  const accent = '#1976d2'

  const uploadMap = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const { key } = await uploadFile('maps/', file, { onProgress: setProgress })
    set('projectMapKey', key)
    setProgress(null)
  }

  const uploadMapFile = async (file) => {
    if (!file) return
    const { key } = await uploadFile('maps/', file, { onProgress: setProgress })
    set('projectMapKey', key)
    setProgress(null)
  }

  const removeMap = () => {
    set('projectMapKey', '')
    setMapPreview('')
  }

  const openInMaps = () => {
    if (!v.projectAddress) return
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.projectAddress)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const extractAddressFromMapsUrl = (text) => {
    try {
      const url = new URL(text)
      const host = url.hostname
      if (host.includes('google') && url.pathname.includes('/maps')) {
        const q = url.searchParams.get('q') || url.searchParams.get('query')
        if (q) return decodeURIComponent(q.replace(/\+/g, ' '))
        const parts = url.pathname.split('/').filter(Boolean)
        const placeIdx = parts.indexOf('place')
        if (placeIdx !== -1 && parts[placeIdx+1]) return decodeURIComponent(parts[placeIdx+1].replace(/\+/g, ' '))
      }
      // Short links or other hosts fall through to raw text
      return text
    } catch (_) {
      return text
    }
  }

  const pasteAddressFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (!text) return
      const addr = extractAddressFromMapsUrl(text)
      set('projectAddress', addr)
    } catch (err) {
      // ignore permission errors; user can paste manually
    }
  }

  React.useEffect(() => {
    let cancelled = false
    async function loadPreview() {
      if (!v.projectMapKey) { setMapPreview(''); return }
      try {
        const { url } = await presignGet(v.projectMapKey)
        if (!cancelled) setMapPreview(url)
      } catch {
        if (!cancelled) setMapPreview('')
      }
    }
    loadPreview()
    return () => { cancelled = true }
  }, [v.projectMapKey])

  return (
    <Card
      elevation={1}
      sx={{
        borderRadius: 2,
        bgcolor: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        transition: 'box-shadow 0.2s ease, transform 0.15s ease',
        '&:hover': {
          boxShadow: '0 6px 16px rgba(0,0,0,0.10)',
          transform: 'translateY(-2px)'
        }
      }}
    >
      <CardHeader
        avatar={
          <Box
            sx={{
              bgcolor: 'rgba(25,118,210,0.1)',
              color: accent,
              width: 36,
              height: 36,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <BusinessIcon fontSize="small" />
          </Box>
        }
        title={
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Section 1 — Project Information
          </Typography>
        }
        sx={{
          '& .MuiCardHeader-title': { color: 'text.primary' },
          pb: 0
        }}
      />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Project Name"
              required
              value={v.projectName || ''}
              onChange={(e) => set('projectName', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BusinessIcon color="action" />
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Project Value"
              required
              type="number"
              value={v.projectValue || ''}
              onChange={(e) => set('projectValue', Number(e.target.value))}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MonetizationOnIcon color="action" />
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Project Address"
              required
              value={v.projectAddress || ''}
              onChange={(e) => set('projectAddress', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOnIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Tooltip title="Paste from clipboard">
                        <span>
                          <IconButton size="small" onClick={pasteAddressFromClipboard} aria-label="Paste address">
                            <ContentPasteIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Divider flexItem orientation="vertical" sx={{ mx: 0.5 }} />
                      <Tooltip title={v.projectAddress ? 'Open in Google Maps' : 'Enter an address'}>
                        <span>
                          <IconButton size="small" onClick={openInMaps} disabled={!v.projectAddress} aria-label="Open in Google Maps">
                            <OpenInNewIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Stack>
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderStyle: 'dashed',
                borderColor: v.projectMapKey ? accent : 'divider',
                transition: 'border-color 0.2s ease, background 0.2s ease',
                '&:hover': { borderColor: accent },
                overflow: 'hidden'
              }}
              onPaste={(e)=>{
                const items = e.clipboardData?.items || []
                for (let i=0; i<items.length; i++) {
                  const it = items[i]
                  if (it.type && it.type.startsWith('image/')) {
                    const file = it.getAsFile()
                    if (file) uploadMapFile(file)
                    e.preventDefault()
                    break
                  }
                }
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                alignItems="flex-start"
                justifyContent="flex-start"
                flexWrap
                sx={{ rowGap: 1 }}
              >
                <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 240 }}>
                  <CloudUploadIcon sx={{ color: accent }} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                      Upload Project Map
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      PNG, JPG. Max 10MB. Tip: paste a screenshot here.
                    </Typography>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={1.5} alignItems="center" flexWrap useFlexGap sx={{ rowGap: 1 }}>
                  <Button
                    variant="contained"
                    component="label"
                    color="primary"
                    startIcon={<CloudUploadIcon />}
                    sx={{ bgcolor: accent, textTransform: 'none' }}
                  >
                    Choose File
                    <input hidden type="file" accept="image/*" onChange={uploadMap} />
                  </Button>

                  {v.projectMapKey && (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip icon={<CheckCircleOutlineIcon />} color="success" variant="outlined" label="Uploaded" />
                      {mapPreview && (
                        <Box
                          component="img"
                          src={mapPreview}
                          alt="Project map preview"
                          onClick={() => setPreviewOpen(true)}
                          sx={{ width: 112, height: 72, borderRadius: 1, objectFit: 'cover', border: '1px solid', borderColor: 'divider', cursor: 'zoom-in' }}
                        />
                      )}
                      {mapPreview && (
                        <Tooltip title="Open image in new tab">
                          <span>
                            <IconButton size="small" onClick={() => window.open(mapPreview, '_blank', 'noopener,noreferrer')} aria-label="Open image">
                              <OpenInNewIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      )}
                      <Button size="small" variant="outlined" onClick={() => fileInputRef.current?.click()} sx={{ textTransform: 'none' }}>Replace</Button>
                      <Button size="small" color="error" variant="text" startIcon={<DeleteOutlineIcon />} onClick={removeMap} sx={{ textTransform: 'none' }}>Remove</Button>
                      <input ref={fileInputRef} hidden type="file" accept="image/*" onChange={uploadMap} />
                    </Stack>
                  )}
              </Stack>
              </Stack>

              {progress != null && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{ '& .MuiLinearProgress-bar': { backgroundColor: accent } }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {progress}%
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="lg">
        <DialogContent sx={{ p: 0, bgcolor: 'black' }}>
          {mapPreview && (
            <Box component="img" src={mapPreview} alt="Project map" sx={{ display: 'block', maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', m: 0 }} />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
