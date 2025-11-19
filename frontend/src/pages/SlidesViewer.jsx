import React from 'react'
import { Box, Stack, Typography, Button, IconButton, Paper } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { presignGet } from '../utils/upload.js'

export default function SlidesViewer() {
  const params = new URLSearchParams(location.search)
  const key = params.get('key') || ''
  const name = params.get('name') || 'slides'
  const extParam = (params.get('ext') || '').toLowerCase()
  const [url, setUrl] = React.useState('')
  const [error, setError] = React.useState('')
  const [ext, setExt] = React.useState(extParam)

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      try { const { url } = await presignGet(key); if (!cancelled) setUrl(url) } catch (e) { if (!cancelled) setError('Could not load file') }
    }
    if (key) load()
    return () => { cancelled = true }
  }, [key])

  // Detect extension from url if not provided
  React.useEffect(() => {
    if (extParam) { setExt(extParam); return }
    if (!url) return
    try {
      const u = new URL(url)
      const path = u.pathname || ''
      const candidate = (path.split('.').pop() || '').toLowerCase()
      if (candidate) setExt(candidate)
    } catch {
      // ignore
    }
  }, [url, extParam])

  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <IconButton onClick={() => window.close()}><ArrowBackIcon /></IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>{name}</Typography>
        {url && (
          <Button startIcon={<OpenInNewIcon />} onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}>Open Original</Button>
        )}
      </Stack>

      {ext === 'pdf' ? <PdfPlayer url={url} /> : <OfficeViewer url={url} />}
      {error && <Typography color="error">{error}</Typography>}
    </Stack>
  )
}

function OfficeViewer({ url }) {
  if (!url) return null
  const src = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`
  return (
    <Box sx={{ height: '80vh', borderRadius: 1, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
      <iframe title="slides" src={src} style={{ border: 0, width: '100%', height: '100%' }} />
    </Box>
  )
}

function PdfPlayer({ url }) {
  const [pdf, setPdf] = React.useState(null)
  const [page, setPage] = React.useState(1)
  const [numPages, setNumPages] = React.useState(1)
  const [playing, setPlaying] = React.useState(false)
  const canvasRef = React.useRef(null)

  React.useEffect(() => {
    if (!url) return
    let cancelled = false
    async function loadPdf() {
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
      const doc = await window.pdfjsLib.getDocument(url).promise
      if (!cancelled) { setPdf(doc); setNumPages(doc.numPages); setPage(1) }
    }
    loadPdf()
    return () => { cancelled = true }
  }, [url])

  React.useEffect(() => {
    let cancelled = false
    async function render() {
      if (!pdf || !canvasRef.current) return
      const pg = await pdf.getPage(page)
      const container = canvasRef.current.parentElement
      const maxW = Math.min(container.clientWidth, 1200)
      const viewport = pg.getViewport({ scale: 1 })
      const scale = maxW / viewport.width
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      canvas.width = Math.floor(viewport.width * scale)
      canvas.height = Math.floor(viewport.height * scale)
      await pg.render({ canvasContext: ctx, viewport: pg.getViewport({ scale }) }).promise
      if (cancelled) return
    }
    render()
    return () => { cancelled = true }
  }, [pdf, page])

  React.useEffect(() => {
    if (!playing) return
    const id = setInterval(() => setPage(p => (pdf ? (p % numPages) + 1 : p)), 3500)
    return () => clearInterval(id)
  }, [playing, numPages, pdf])

  const prev = () => setPage(p => Math.max(1, p - 1))
  const next = () => setPage(p => Math.min(numPages, p + 1))

  return (
    <Stack spacing={1}>
      <Paper variant="outlined" sx={{ p: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'auto' }} />
      </Paper>
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
        <IconButton onClick={prev} disabled={page<=1}><NavigateBeforeIcon /></IconButton>
        <Typography variant="body2">{page} / {numPages}</Typography>
        <IconButton onClick={next} disabled={page>=numPages}><NavigateNextIcon /></IconButton>
        <IconButton onClick={() => setPlaying(s => !s)}>{playing ? <PauseIcon /> : <PlayArrowIcon />}</IconButton>
      </Stack>
    </Stack>
  )
}

