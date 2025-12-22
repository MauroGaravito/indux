import React from 'react'
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import BusinessIcon from '@mui/icons-material/Business'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import ProjectMapEditor from './ProjectMapEditor.jsx'
import { DEFAULT_PROJECT_LOCATION } from '../../constants/location.js'

export default function ProjectInfoSection({ value, onChange, onOpenFullMap }) {
  const v = value || {}
  const set = (k, val) => onChange({ ...v, [k]: val })
  const theme = useTheme()
  const accent = theme.palette.primary.main

  const locationValue =
    typeof v.location?.lat === 'number' && typeof v.location?.lng === 'number'
      ? v.location
      : DEFAULT_PROJECT_LOCATION
  const poiValue = Array.isArray(v.pointsOfInterest) ? v.pointsOfInterest : []

  return (
    <Card elevation={1} sx={{ borderRadius: 2, bgcolor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <CardHeader
        avatar={<BusinessIcon sx={{ color: accent }} />}
        title={<Typography variant="h6" sx={{ fontWeight: 600 }}>Project metadata</Typography>}
        subheader={<Typography variant="body2" color="text.secondary">General information saved on the parent project.</Typography>}
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
              label="Address / reference (optional)"
              value={v.address || ''}
              onChange={(e) => set('address', e.target.value)}
              helperText="Optional textual instructions or notes for the site."
            />
          </Grid>
          <Grid item xs={12}>
            <TextField select fullWidth label="Status" value={v.status || 'draft'} onChange={(e) => set('status', e.target.value)}>
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="archived">Archived</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              justifyContent="space-between"
              sx={{ mb: 1 }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Project location</Typography>
              {onOpenFullMap && (
                <Button
                  size="small"
                  startIcon={<FullscreenIcon />}
                  variant="contained"
                  color="secondary"
                  onClick={onOpenFullMap}
                  sx={{ textTransform: 'none' }}
                >
                  Open full map
                </Button>
              )}
            </Stack>
            <ProjectMapEditor
              canEdit
              location={locationValue}
              pointsOfInterest={poiValue}
              onLocationChange={(loc) => set('location', loc)}
              onPointsChange={(points) => set('pointsOfInterest', points)}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}
