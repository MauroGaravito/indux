import React from 'react'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import SlideshowIcon from '@mui/icons-material/Slideshow'
import { presignGet } from '../../utils/upload.js'
import api from '../../utils/api.js'

const statusChipColor = (status) => {
  if (status === 'approved') return 'success'
  if (status === 'declined') return 'error'
  if (status === 'pending') return 'warning'
  return 'default'
}

export default function ProjectReviewModal({
  open,
  review,
  loading,
  onClose,
  onApprove,
  onDecline,
  declineProcessing,
  approveProcessing
}) {
  const [reason, setReason] = React.useState('')
  const [mapImageError, setMapImageError] = React.useState(false)
  const [mapLightboxOpen, setMapLightboxOpen] = React.useState(false)
  const [slidesImageError, setSlidesImageError] = React.useState(false)
  const [slidesLightboxOpen, setSlidesLightboxOpen] = React.useState(false)
  const [viewerOpen, setViewerOpen] = React.useState(false)
  const [viewerUrl, setViewerUrl] = React.useState('')
  const [mapPreviewUrl, setMapPreviewUrl] = React.useState('')
  const [slidesPreviewUrl, setSlidesPreviewUrl] = React.useState('')
  const [mapMeta, setMapMeta] = React.useState(null)
  const [slidesMeta, setSlidesMeta] = React.useState(null)
  const [slidesInfo, setSlidesInfo] = React.useState({ previewUrl: '', contentType: '' })

  React.useEffect(() => {
    if (!open) {
      setReason('')
    }
  }, [open])

  const data = review?.data || {}
  const fields = Array.isArray(data?.fields) ? data.fields : []
  const configSnapshot = data?.config || {}
  // Debug snapshot to verify structure coming from backend
  console.log('DEBUG REVIEW CONFIG:', configSnapshot)
  const mapKey = configSnapshot?.projectMapKey || configSnapshot?.projectInfo?.projectMapKey
  const slidesKey = configSnapshot?.slides?.pptKey || configSnapshot?.pptKey
  const slidesThumbKey = configSnapshot?.slides?.thumbKey || configSnapshot?.thumbKey
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080'
  const buildStreamUrl = (key) => (key ? `${apiBaseUrl}/uploads/stream?key=${encodeURIComponent(key)}` : '')
  const mapStreamUrl = buildStreamUrl(mapKey)
  const slidesStreamUrl = buildStreamUrl(slidesKey)
  const slidesFilename = slidesKey ? slidesKey.split('/').pop() : 'slides'
  const resolvePreviewUrl = async (key) => {
    if (!key) return ''
    const fallback = buildStreamUrl(key)
    try {
      const { url } = await presignGet(key)
      return url || fallback
    } catch {
      return fallback
    }
  }

  const slidesContentType = (slidesInfo?.contentType || '').toLowerCase()
  const slidesIsImage = slidesContentType.startsWith('image/')
  const slidesIsPdf = slidesContentType === 'application/pdf'
  const slidesIsPpt = slidesContentType === 'application/vnd.ms-powerpoint' ||
    slidesContentType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'

  React.useEffect(() => {
    setMapImageError(false)
    if (!mapKey) {
      setMapLightboxOpen(false)
    }
  }, [mapKey])

  React.useEffect(() => {
    if (!mapKey) {
      setMapPreviewUrl('')
      setMapMeta(null)
      return
    }
    ;(async () => {
      try {
        const [metaRes, url] = await Promise.all([
          api.get('/uploads/meta', { params: { key: mapKey } }).catch(() => ({ data: {} })),
          openViaPresign(mapKey)
        ])
        setMapMeta(metaRes?.data || {})
        setMapPreviewUrl(url || mapStreamUrl)
      } catch {
        setMapMeta(null)
        setMapPreviewUrl(mapStreamUrl)
      }
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapKey])

  React.useEffect(() => {
    if (!slidesKey) {
      setSlidesPreviewUrl('')
      setSlidesMeta(null)
      setSlidesInfo({ previewUrl: '', contentType: '' })
      return
    }
    ;(async () => {
      try {
        const targetKey = slidesThumbKey || slidesKey
        const [metaRes, resolvedUrl] = await Promise.all([
          api.get('/uploads/meta', { params: { key: targetKey } }).catch(() => ({ data: {} })),
          resolvePreviewUrl(targetKey)
        ])
        const meta = metaRes?.data || {}
        setSlidesMeta(meta)
        setSlidesInfo({ previewUrl: resolvedUrl, contentType: meta?.contentType || '' })
        setSlidesPreviewUrl(resolvedUrl || buildStreamUrl(targetKey))
      } catch {
        setSlidesMeta(null)
        setSlidesInfo({ previewUrl: '', contentType: '' })
        setSlidesPreviewUrl(buildStreamUrl(slidesThumbKey || slidesKey))
      }
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slidesKey, slidesThumbKey])

  const renderMapPreview = () => {
    if (!mapKey || mapImageError) {
      return (
        <Typography variant="body2" color="text.secondary">
          No map available
        </Typography>
      )
    }
    const isImage = mapMeta?.contentType
      ? (mapMeta.contentType || '').toLowerCase().startsWith('image/')
      : true // if no metadata, attempt preview
    if (!isImage) {
      return <Typography variant="body2" color="text.secondary">Map file is not previewable</Typography>
    }
    return (
      <Box
        component="img"
        src={mapPreviewUrl || mapStreamUrl}
        alt="Project map preview"
        onError={() => setMapImageError(true)}
        onClick={() => setMapLightboxOpen(true)}
        sx={{
          width: 150,
          maxWidth: '100%',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
          cursor: 'pointer',
          objectFit: 'cover'
        }}
      />
    )
  }

  const openViaPresign = async (key) => {
    if (!key) return
    const fallback = buildStreamUrl(key)
    try {
      const { url } = await presignGet(key)
      return url || fallback
    } catch (_) {
      return fallback
    }
  }

  const openInViewer = async (key, preferredUrl) => {
    const url = preferredUrl || (await resolvePreviewUrl(key))
    if (!url) return
    setViewerUrl(url)
    setViewerOpen(true)
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
        <DialogTitle sx={{ pb: 0 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Project Review</Typography>
            {review && (
              <>
                <Typography variant="subtitle1" color="text.secondary">
                  {review?.projectId?.name || review?.projectId || 'Project'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Requested by {review?.requestedBy?.name || review?.requestedBy || 'Unknown'} on{' '}
                  {review?.createdAt ? new Date(review.createdAt).toLocaleString() : 'N/A'}
                </Typography>
              </>
            )}
          </Box>
          {review && (
            <Chip label={review?.status || 'pending'} color={statusChipColor(review?.status)} />
          )}
        </Stack>
      </DialogTitle>
      <DialogContent dividers sx={{ mt: 2 }}>
        {loading && (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography color="text.secondary">Loading…</Typography>
          </Box>
        )}
        {!loading && !review && (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography color="text.secondary">No review data available.</Typography>
          </Box>
        )}
        {!loading && review && (
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Requester</Typography>
              <Typography variant="body2" color="text.secondary">
                {review?.requestedBy?.name || review?.requestedBy || 'Unknown'} —{' '}
                {review?.requestedBy?.email || 'No email'}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Project Info</Typography>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                    <TableCell>{configSnapshot?.projectName || configSnapshot?.projectInfo?.projectName || review?.projectId?.name || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Address</TableCell>
                    <TableCell>{configSnapshot?.projectAddress || configSnapshot?.projectInfo?.projectAddress || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Map</TableCell>
                    <TableCell>{renderMapPreview()}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Slides</Typography>
              {slidesKey ? (
                <Stack spacing={1} alignItems="flex-start">
                  {slidesIsImage && !slidesImageError ? (
                    <Box
                      component="img"
                      src={slidesPreviewUrl || slidesStreamUrl}
                      alt="Slides preview"
                      onError={() => setSlidesImageError(true)}
                      onClick={() => setSlidesLightboxOpen(true)}
                      sx={{
                        width: 150,
                        maxWidth: '100%',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        cursor: 'pointer',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar sx={{ bgcolor: 'grey.100', color: 'text.secondary' }}>
                        {slidesIsPdf ? <PictureAsPdfIcon /> : <SlideshowIcon />}
                      </Avatar>
                      <Typography variant="body2" color="text.secondary">
                        {slidesFilename || 'Slides'}
                      </Typography>
                    </Stack>
                  )}
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => openInViewer(slidesKey, slidesInfo.previewUrl)}
                    >
                      View
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={async () => {
                        const url = await openViaPresign(slidesKey)
                        if (!url) return
                        const a = document.createElement('a')
                        a.href = url
                        a.download = slidesFilename || 'slides'
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                      }}
                    >
                      Download
                    </Button>
                  </Stack>
                </Stack>
              ) : (
                <Alert severity="info">No training slides uploaded.</Alert>
              )}
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Questions</Typography>
              {Array.isArray(configSnapshot?.questions) && configSnapshot.questions.length ? (
                <Stack spacing={1.5}>
                  {configSnapshot.questions.map((question, idx) => (
                    <Box key={`question-${idx}`} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {question?.questionText || `Question ${idx + 1}`}
                      </Typography>
                      {Array.isArray(question?.answers) && question.answers.length ? (
                        <Stack component="ul" sx={{ pl: 3, mt: 1 }}>
                          {question.answers.map((answer, ai) => (
                            <Typography component="li" key={`answer-${ai}`} variant="body2">
                              {answer}
                            </Typography>
                          ))}
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary">No answers provided.</Typography>
                      )}
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Alert severity="info">No quiz questions included in this snapshot.</Alert>
              )}
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Personal Fields</Typography>
              {fields.length ? (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Label</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Required</TableCell>
                      <TableCell>Help Text</TableCell>
                      <TableCell>Options</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fields.map((field) => (
                      <TableRow key={field._id || field.key}>
                        <TableCell>{field.label || field.key}</TableCell>
                        <TableCell>{field.type}</TableCell>
                        <TableCell>{field.required ? 'Yes' : 'No'}</TableCell>
                        <TableCell>{field.helpText || '-'}</TableCell>
                        <TableCell>
                          {Array.isArray(field.options) && field.options.length
                            ? field.options.join(', ')
                            : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Alert severity="info">No field metadata provided in this snapshot.</Alert>
              )}
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Decline Reason (optional)</Typography>
              <TextField
                fullWidth
                multiline
                minRows={3}
                placeholder="Provide a reason if declining this review."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </Box>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button
          color="error"
          variant="outlined"
          disabled={declineProcessing}
          onClick={() => onDecline?.(reason)}
        >
          {declineProcessing ? 'Declining…' : 'Decline'}
        </Button>
        <Button
          color="success"
          variant="contained"
          disabled={approveProcessing}
          onClick={() => onApprove?.()}
        >
          {approveProcessing ? 'Approving…' : 'Approve'}
        </Button>
      </DialogActions>
    </Dialog>
      {mapKey && (mapPreviewUrl || mapStreamUrl) && (
        <Dialog open={mapLightboxOpen} onClose={() => setMapLightboxOpen(false)} fullScreen>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: '100%',
              bgcolor: '#000',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <IconButton
              aria-label="Close map preview"
              onClick={() => setMapLightboxOpen(false)}
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                color: '#fff',
                bgcolor: 'rgba(0,0,0,0.4)'
              }}
            >
              <CloseIcon />
            </IconButton>
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 3
              }}
            >
              {!mapImageError ? (
                <Box
                  component="img"
                  src={mapPreviewUrl || mapStreamUrl}
                  alt="Project map full view"
                  onError={() => setMapImageError(true)}
                  sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              ) : (
                <Typography color="#fff">No map available</Typography>
              )}
            </Box>
          </Box>
        </Dialog>
      )}
      {slidesKey && (slidesPreviewUrl || slidesStreamUrl) && slidesIsImage && !slidesImageError && (
        <Dialog open={slidesLightboxOpen} onClose={() => setSlidesLightboxOpen(false)} fullScreen>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: '100%',
              bgcolor: '#000',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <IconButton
              aria-label="Close slides preview"
              onClick={() => setSlidesLightboxOpen(false)}
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                color: '#fff',
                bgcolor: 'rgba(0,0,0,0.4)'
              }}
            >
              <CloseIcon />
            </IconButton>
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 3
              }}
            >
                {!slidesImageError ? (
                  <Box
                    component="img"
                    src={slidesPreviewUrl || slidesStreamUrl}
                    alt="Slides full view"
                  onError={() => setSlidesImageError(true)}
                  sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              ) : (
                <Typography color="#fff">No preview available</Typography>
              )}
            </Box>
          </Box>
        </Dialog>
      )}
      <Dialog open={viewerOpen} onClose={() => setViewerOpen(false)} fullWidth maxWidth="lg">
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Preview</Typography>
            <IconButton onClick={() => setViewerOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {viewerUrl ? (
            <iframe
              src={viewerUrl}
              title="preview"
              style={{ width: '100%', height: '80vh', border: 0 }}
            />
          ) : (
            <Box sx={{ p: 2 }}>
              <Typography color="text.secondary">No preview available.</Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
