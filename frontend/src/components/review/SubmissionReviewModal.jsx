import React from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Typography
} from '@mui/material'
import { presignGet } from '../../utils/upload.js'

const statusChipColor = (status) => {
  if (status === 'approved') return 'success'
  if (status === 'declined') return 'error'
  if (status === 'cancelled') return 'default'
  return 'warning'
}

const formatDate = (value) => (value ? new Date(value).toLocaleString() : '—')

export default function SubmissionReviewModal({ open, onClose, loading, data, onApprove, onDecline, onDelete }) {
  const [tab, setTab] = React.useState('details')
  React.useEffect(() => {
    if (!open) setTab('details')
  }, [open])

  const isReady = !loading && data && data.submission
  const submission = isReady ? data.submission : null
  const project = isReady ? (data.project || submission?.projectId || {}) : {}
  const fields = Array.isArray(data?.fields) ? data.fields : []
  const config = (project && project.config) || {}
  const personal = submission?.personal && typeof submission.personal === 'object' ? submission.personal : {}
  const uploads = Array.isArray(submission?.uploads) ? submission.uploads : []
  const worker = submission?.userId || submission?.user || {}
  const workerName = worker?.name || submission?.workerName || 'Worker'
  const workerEmail = worker?.email || submission?.workerEmail || ''
  const slidesCount = Array.isArray(config?.slides) ? config.slides.length : 0
  const slidesCompleted = typeof submission?.slidesCompleted === 'number' ? submission.slidesCompleted : 0
  const quizInfo = submission?.quiz || {}
  const timeline = [
    { label: 'Submitted at', value: formatDate(submission?.createdAt) },
    { label: 'Updated at', value: formatDate(submission?.updatedAt) },
    {
      label: 'Slides completed',
      value: slidesCount ? `${Math.min(100, Math.round((slidesCompleted / slidesCount) * 100))}%` : 'N/A'
    },
    {
      label: 'Quiz score',
      value: typeof quizInfo.total === 'number' && quizInfo.total > 0
        ? `${quizInfo.correct ?? 0}/${quizInfo.total}`
        : 'N/A'
    },
    { label: 'Signature', value: submission?.signatureDataUrl || submission?.signatureKey ? 'Present' : 'Not present' },
    { label: 'Reviewed by', value: submission?.reviewedBy?.name || submission?.reviewedBy || '—' }
  ]

  const openFile = async (item) => {
    try {
      const key = typeof item === 'string' ? item : item?.key
      if (!key) return
      const { url } = await presignGet(key)
      if (url) window.open(url, '_blank', 'noopener,noreferrer')
    } catch (_) {}
  }

  const renderPersonalValue = (field, value) => {
    if (value === null || value === undefined || (typeof value === 'string' && !value.trim())) return 'Not provided'
    if (Array.isArray(value)) return value.join(', ')
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
      <DialogTitle sx={{ pb: 0 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Submission Review</Typography>
            {isReady && (
              <>
                <Typography variant="subtitle1" color="text.secondary">{workerName}</Typography>
                {workerEmail && <Typography variant="body2" color="text.secondary">{workerEmail}</Typography>}
              </>
            )}
          </Box>
          {isReady && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label={submission.status || 'pending'} color={statusChipColor(submission.status)} />
              <Button color="success" variant="contained" onClick={onApprove} sx={{ textTransform: 'none' }}>Approve</Button>
              <Button color="error" variant="outlined" onClick={onDecline} sx={{ textTransform: 'none' }}>Decline</Button>
              {onDelete && (
                <Button color="error" variant="contained" onClick={() => {
                  if (window.confirm('Delete this submission?')) onDelete()
                }} sx={{ textTransform: 'none' }}>
                  Delete
                </Button>
              )}
            </Stack>
          )}
        </Stack>
      </DialogTitle>
      <DialogContent dividers sx={{ mt: 2 }}>
        {loading && (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography color="text.secondary">Loading…</Typography>
          </Box>
        )}
        {!loading && !isReady && (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography color="text.secondary">No submission data available.</Typography>
          </Box>
        )}
        {isReady && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Stack spacing={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Worker Info</Typography>
                    <Typography variant="h6">{workerName}</Typography>
                    {workerEmail && <Typography color="text.secondary">{workerEmail}</Typography>}
                  </CardContent>
                </Card>
                <Divider />
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Project Info</Typography>
                    <Typography variant="body1">{project?.name || submission?.projectName || '—'}</Typography>
                  </CardContent>
                </Card>
                <Divider />
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Timeline</Typography>
                    <List dense>
                      {timeline.map((item, idx) => (
                        <ListItem key={idx} disablePadding sx={{ mb: 1 }}>
                          <ListItemText
                            primary={<Typography variant="body2" color="text.secondary">{item.label}</Typography>}
                            secondary={<Typography variant="body1">{item.value}</Typography>}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>

            <Grid item xs={12} md={8}>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <Tabs
                  value={tab}
                  onChange={(_, value) => setTab(value)}
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  <Tab label="Worker Details" value="details" />
                  <Tab label="Documents" value="documents" />
                  <Tab label="Induction Materials" value="slides" />
                  <Tab label="Quiz" value="quiz" />
                  <Tab label="Signature" value="signature" />
                </Tabs>
              </Card>

              {tab === 'details' && (
                <Card variant="outlined">
                  <CardContent>
                    {fields.length ? (
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Field</TableCell>
                            <TableCell>Value</TableCell>
                            <TableCell align="right">Required</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {fields.map((field) => (
                            <TableRow key={field._id || field.key}>
                              <TableCell>{field.label || field.key}</TableCell>
                              <TableCell>{renderPersonalValue(field, personal[field.key])}</TableCell>
                              <TableCell align="right">{field.required ? 'Yes' : 'No'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <Typography color="text.secondary">No worker detail fields configured.</Typography>
                    )}
                  </CardContent>
                </Card>
              )}

              {tab === 'documents' && (
                <Card variant="outlined">
                  <CardContent>
                    {uploads.length ? (
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell align="right">Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {uploads.map((upload, idx) => {
                            const name = typeof upload === 'string' ? upload.split('/').pop() : (upload?.name || upload?.title || upload?.key || `file-${idx + 1}`)
                            const type = typeof upload === 'string' ? 'file' : (upload?.type || 'file')
                            return (
                              <TableRow key={idx}>
                                <TableCell>{name}</TableCell>
                                <TableCell>{type}</TableCell>
                                <TableCell align="right">
                                  <Button size="small" onClick={() => openFile(upload)}>Open</Button>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    ) : (
                      <Typography color="text.secondary">No documents uploaded.</Typography>
                    )}
                  </CardContent>
                </Card>
              )}

              {tab === 'slides' && (
                <Card variant="outlined">
                  <CardContent>
                    {Array.isArray(config?.slides) && config.slides.length ? (
                      <List>
                        {config.slides.map((slide, idx) => (
                          <ListItem key={idx} alignItems="flex-start">
                            <ListItemText
                              primary={slide?.title || slide?.name || `Induction Material ${idx + 1}`}
                              secondary={slide?.description || slide?.notes}
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography color="text.secondary">No induction materials configured.</Typography>
                    )}
                  </CardContent>
                </Card>
              )}

              {tab === 'quiz' && (
                <Card variant="outlined">
                  <CardContent>
                    <Stack spacing={1}>
                      <Typography>Total Questions: {quizInfo.total ?? 0}</Typography>
                      <Typography>Correct Answers: {quizInfo.correct ?? 0}</Typography>
                      <Typography>Pass Mark: {quizInfo.pass_mark ?? 0}</Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography>Result:</Typography>
                        <Chip
                          label={(quizInfo.total && quizInfo.correct >= (quizInfo.pass_mark ?? 0)) ? 'Passed' : 'Pending/Failed'}
                          color={(quizInfo.total && quizInfo.correct >= (quizInfo.pass_mark ?? 0)) ? 'success' : 'warning'}
                          size="small"
                        />
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              )}

              {tab === 'signature' && (
                <Card variant="outlined">
                  <CardContent>
                    {(submission?.signatureDataUrl || submission?.signatureKey) ? (
                      <Stack spacing={2}>
                        {submission?.signatureDataUrl && (
                          <Box
                            component="img"
                            src={submission.signatureDataUrl}
                            alt="signature"
                            sx={{ maxWidth: '100%', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
                          />
                        )}
                        {submission?.signatureKey && (
                          <Button variant="outlined" onClick={() => openFile(submission.signatureKey)}>Download Signature</Button>
                        )}
                      </Stack>
                    ) : (
                      <Typography color="text.secondary">No signature captured.</Typography>
                    )}
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Stack direction="row" spacing={1} sx={{ flexGrow: 1 }}>
          {isReady && (
            <Button color="warning" variant="outlined" onClick={() => {
              if (window.confirm('Send this submission back to the worker?')) onDecline?.()
            }}>
              Send Back
            </Button>
          )}
        </Stack>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}
