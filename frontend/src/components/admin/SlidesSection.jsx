import React, { useState } from 'react'
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Stack,
  Typography,
  Button,
  LinearProgress,
  Paper
} from '@mui/material'
import SlideshowIcon from '@mui/icons-material/Slideshow'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { uploadFile } from '../../utils/upload.js'

export default function SlidesSection({ value, onChange }) {
  const v = value || {}
  const set = (k, val) => onChange({ ...v, [k]: val })
  const [localName, setLocalName] = useState('')
  const [progress, setProgress] = useState(null)

  const accent = '#1976d2'

  const uploadPPT = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const { key } = await uploadFile('slides/', file, { onProgress: setProgress })
    set('pptKey', key)
    setLocalName(file.name)
    setProgress(null)
  }

  const uploadedLabel = localName || v.pptKey

  return (
    <Card elevation={1} sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <CardHeader
        avatar={
          <Box sx={{ bgcolor: 'rgba(25,118,210,0.1)', color: accent, width: 36, height: 36, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SlideshowIcon fontSize="small" />
          </Box>
        }
        title={<Typography variant="h6" sx={{ fontWeight: 600 }}>Section 3 — Induction Slides</Typography>}
        subheader={<Typography variant="body2" color="text.secondary">Upload a PowerPoint file (.ppt or .pptx)</Typography>}
        sx={{ pb: 0 }}
      />
      <CardContent>
        <Paper
          variant="outlined"
          sx={{ p: 2, borderStyle: 'dashed', borderColor: uploadedLabel ? accent : 'divider', '&:hover': { borderColor: accent } }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1} alignItems="center">
              <CloudUploadIcon sx={{ color: accent }} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Upload PPT</Typography>
                <Typography variant="body2" color="text.secondary">.ppt, .pptx up to 20MB</Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                variant="contained"
                component="label"
                startIcon={<CloudUploadIcon />}
                sx={{ bgcolor: accent, textTransform: 'none' }}
              >
                Choose File
                <input
                  hidden
                  type="file"
                  accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                  onChange={uploadPPT}
                />
              </Button>

              {uploadedLabel && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <CheckCircleOutlineIcon color="success" />
                  <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>Uploaded: {uploadedLabel}</Typography>
                </Stack>
              )}
            </Stack>
          </Stack>

          {progress != null && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress variant="determinate" value={progress} sx={{ '& .MuiLinearProgress-bar': { backgroundColor: accent } }} />
              <Typography variant="caption" color="text.secondary">{progress}%</Typography>
            </Box>
          )}
        </Paper>
      </CardContent>
    </Card>
  )
}

