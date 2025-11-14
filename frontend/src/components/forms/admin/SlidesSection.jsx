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
  Paper,
  Chip
} from '@mui/material'
import SlideshowIcon from '@mui/icons-material/Slideshow'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import { uploadFile, presignGet } from '../../../utils/upload.js'

export default function SlidesSection({ value, onChange }) {
  const v = value || {}
  const set = (k, val) => onChange({ ...v, [k]: val })
  const [localName, setLocalName] = useState('')
  const [progress, setProgress] = useState(null)
  const [thumbUrl, setThumbUrl] = useState('')

  const accent = '#1976d2'

  const uploadPPT = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const { key } = await uploadFile('slides/', file, { onProgress: setProgress })
    set('pptKey', key)
    setLocalName(file.name)
    setProgress(null)

    // If PDF, try to generate a thumbnail of the first page
    const ext = (file.name.split('.').pop() || '').toLowerCase()
    if (ext === 'pdf') {
      try {
        const { url } = await presignGet(key)
        const blob = await renderPdfFirstPageToBlob(url, 300)
        if (blob) {
          const { key: tkey } = await uploadFile('slides/', blob, { onProgress: undefined })
          set('thumbKey', tkey)
          const { url: turl } = await presignGet(tkey)
          setThumbUrl(turl)
        }
      } catch {
        // ignore thumbnail failures
      }
    }
  }

  const uploadedLabel = localName || v.pptKey
  
  React.useEffect(() => {
    let cancelled = false
    async function loadThumb() {
      if (!v.thumbKey) { setThumbUrl(''); return }
      try { const { url } = await presignGet(v.thumbKey); if (!cancelled) setThumbUrl(url) } catch { if (!cancelled) setThumbUrl('') }
    }
    loadThumb()
    return () => { cancelled = true }
  }, [v.thumbKey])

  const openViewer = () => {
    const ext = (localName || '').split('.').pop()?.toLowerCase() || 'pptx'
    const params = new URLSearchParams({ key: v.pptKey || '', name: localName || 'slides', ext })
    window.open(`/slides-viewer?${params.toString()}`, '_blank', 'noopener,noreferrer')
  }

  async function renderPdfFirstPageToBlob(pdfUrl, width = 300) {
    if (!window.pdfjsLib) {
      await new Promise((resolve, reject) => {
        const s = document.createElement('script')
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
        s.onload = resolve
        s.onerror = reject
        document.body.appendChild(s)
      })
    }
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
    const pdf = await window.pdfjsLib.getDocument(pdfUrl).promise
    const page = await pdf.getPage(1)
    const viewport = page.getViewport({ scale: 1 })
    const scale = width / viewport.width
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = Math.floor(viewport.width * scale)
    canvas.height = Math.floor(viewport.height * scale)
    const renderContext = { canvasContext: ctx, viewport: page.getViewport({ scale }) }
    await page.render(renderContext).promise
    return await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
  }

  return (
    <Card elevation={1} sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <CardHeader
        avatar={
          <Box sx={{ bgcolor: 'rgba(25,118,210,0.1)', color: accent, width: 36, height: 36, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SlideshowIcon fontSize="small" />
          </Box>
        }
        title={<Typography variant="h6" sx={{ fontWeight: 600 }}>Section 3 — Induction Slides</Typography>}
        subheader={<Typography variant="body2" color="text.secondary">Upload PDF or PowerPoint</Typography>}
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
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Upload Slides</Typography>
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
                  accept=".pdf,.ppt,.pptx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                  onChange={uploadPPT}
                />
              </Button>

              {uploadedLabel && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <CheckCircleOutlineIcon color="success" />
                  <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>Uploaded: {uploadedLabel}</Typography>
                </Stack>
              )}

              {(thumbUrl || uploadedLabel) && (
                <Stack direction="row" spacing={1} alignItems="center">
                  {thumbUrl ? (
                    <Box component="img" src={thumbUrl} alt="Slides preview" sx={{ width: 112, height: 72, borderRadius: 1, objectFit: 'cover', border: '1px solid', borderColor: 'divider', cursor: 'pointer' }} onClick={openViewer} />
                  ) : (
                    <Chip icon={<InsertDriveFileIcon />} label="Open Viewer" onClick={openViewer} variant="outlined" />
                  )}
                </Stack>
              )}            </Stack>
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










