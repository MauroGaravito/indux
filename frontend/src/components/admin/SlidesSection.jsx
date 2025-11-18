import React, { useEffect, useState, useMemo } from "react"
import {
  Card,
  CardHeader,
  CardContent,
  Stack,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Box
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import SlideshowIcon from "@mui/icons-material/Slideshow"
import CloudUploadIcon from "@mui/icons-material/CloudUpload"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile"
import { uploadFile, presignGet } from "../../utils/upload.js"

// Slides are stored as an array in module.config.slides
// We edit the first item (primary deck) for simplicity
export default function SlidesSection({ slides, onChange }) {
  const theme = useTheme()
  const accent = theme.palette.primary.main
  const primary = useMemo(() => (Array.isArray(slides) && slides.length ? slides[0] : null), [slides])
  const [progress, setProgress] = useState(null)
  const [thumbUrl, setThumbUrl] = useState("")
  const [localName, setLocalName] = useState("")

  const setPrimary = (patch) => {
    const base = primary || { key: "primary", title: "Induction Slides", fileKey: "", order: 1 }
    const next = { ...base, ...patch }
    const rest = Array.isArray(slides) ? slides.slice(1) : []
    onChange([next, ...rest])
  }

  useEffect(() => {
    let cancelled = false
    async function loadThumb() {
      if (!primary?.thumbKey) { setThumbUrl(''); return }
      try {
        const { url } = await presignGet(primary.thumbKey)
        if (!cancelled) setThumbUrl(url)
      } catch {
        if (!cancelled) setThumbUrl("")
      }
    }
    loadThumb()
    return () => { cancelled = true }
  }, [primary?.thumbKey])

  const uploadPPT = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const { key } = await uploadFile('slides/', file, { onProgress: setProgress })
    setProgress(null)
    setLocalName(file.name)
    setPrimary({ fileKey: key, title: file.name, order: primary?.order ?? 1 })
    // thumbnail optional
    const ext = (file.name.split('.').pop() || '').toLowerCase()
    if (ext === 'pdf') {
      try {
        const { url } = await presignGet(key)
        const blob = await renderPdfFirstPageToBlob(url, 300)
        if (blob) {
          const { key: tkey } = await uploadFile('slides/', blob, { onProgress: undefined })
          setPrimary({ fileKey: key, thumbKey: tkey, title: file.name, order: primary?.order ?? 1 })
          const { url: turl } = await presignGet(tkey)
          setThumbUrl(turl)
        }
      } catch {
        // ignore thumbnail failures
      }
    }
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

  const openViewer = () => {
    if (!primary?.fileKey) return
    const params = new URLSearchParams({ key: primary.fileKey, name: localName || primary.title || 'slides', ext: 'pdf' })
    window.open(`/slides-viewer?${params.toString()}`, '_blank', 'noopener,noreferrer')
  }

  const uploadedLabel = localName || primary?.title || primary?.fileKey

  return (
    <Card elevation={1} sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <CardHeader
        avatar={<SlideshowIcon sx={{ color: accent }} />}
        title={<Typography variant="h6" sx={{ fontWeight: 600 }}>Slides</Typography>}
        subheader={<Typography variant="body2" color="text.secondary">Stored in module.config.slides[0]</Typography>}
        sx={{ pb: 0 }}
      />
      <CardContent>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1} alignItems="center">
              <CloudUploadIcon sx={{ color: accent }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Upload Slides</Typography>
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
              )}
            </Stack>
          </Stack>
          {progress != null && (
            <Stack spacing={1}>
              <LinearProgress variant="determinate" value={progress} sx={{ '& .MuiLinearProgress-bar': { backgroundColor: accent } }} />
              <Typography variant="caption" color="text.secondary">{progress}%</Typography>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}
