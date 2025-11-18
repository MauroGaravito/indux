import React from 'react'
import {
  Card,
  CardHeader,
  CardContent,
  Grid,
  TextField,
  Typography,
  MenuItem
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import BusinessIcon from '@mui/icons-material/Business'
import ContentPasteIcon from '@mui/icons-material/ContentPaste'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'

export default function ProjectInfoSection({ value, onChange }) {
  const v = value || {}
  const set = (k, val) => onChange({ ...v, [k]: val })
  const theme = useTheme()
  const accent = theme.palette.primary.main

  const openInMaps = () => {
    if (!v.address) return
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.address)}`
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
        if (placeIdx !== -1 && parts[placeIdx + 1]) return decodeURIComponent(parts[placeIdx + 1].replace(/\+/g, ' '))
      }
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
      set('address', addr)
    } catch {
      // ignore permission errors
    }
  }

  return (
    <Card elevation={1} sx={{ borderRadius: 2, bgcolor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <CardHeader
        avatar={<BusinessIcon sx={{ color: accent }} />}
        title={<Typography variant="h6" sx={{ fontWeight: 600 }}>Project Metadata</Typography>}
        subheader={<Typography variant="body2" color="text.secondary">Lives on the parent Project (no induction data here).</Typography>}
        sx={{ pb: 0 }}
      />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField fullWidth label="Name" value={v.name || ''} onChange={(e) => set('name', e.target.value)} />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Description"
              value={v.description || ''}
              onChange={(e) => set('description', e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              value={v.address || ''}
              onChange={(e) => set('address', e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Paste from clipboard (Maps URL supported)">
                      <span>
                        <IconButton size="small" onClick={pasteAddressFromClipboard}>
                          <ContentPasteIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title={v.address ? 'Open in Google Maps' : 'Enter an address'}>
                      <span>
                        <IconButton size="small" onClick={openInMaps} disabled={!v.address}>
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
            <TextField select fullWidth label="Status" value={v.status || 'draft'} onChange={(e) => set('status', e.target.value)}>
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="archived">Archived</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}
