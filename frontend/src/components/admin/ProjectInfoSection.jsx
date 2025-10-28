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
  IconButton
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import BusinessIcon from '@mui/icons-material/Business'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { uploadFile } from '../../utils/upload.js'

export default function ProjectInfoSection({ value, onChange }) {
  const v = value || {}
  const set = (k, val) => onChange({ ...v, [k]: val })

  const [progress, setProgress] = React.useState(null)

  const accent = '#1976d2'

  const uploadMap = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const { key } = await uploadFile('maps/', file, { onProgress: setProgress })
    set('projectMapKey', key)
    setProgress(null)
  }

  const openInMaps = () => {
    if (!v.projectAddress) return
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.projectAddress)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

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
                    <Tooltip title={v.projectAddress ? 'Open in Google Maps' : 'Enter an address'}>
                      <span>
                        <IconButton size="small" onClick={openInMaps} disabled={!v.projectAddress} aria-label="Open in Google Maps">
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
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
                '&:hover': { borderColor: accent }
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                alignItems="center"
                justifyContent="space-between"
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <CloudUploadIcon sx={{ color: accent }} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Upload Project Map
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      PNG, JPG. Max 10MB.
                    </Typography>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={2} alignItems="center">
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
                    <Chip
                      icon={<CheckCircleOutlineIcon />}
                      color="success"
                      variant="outlined"
                      label="Uploaded"
                    />
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
    </Card>
  )
}
