import React, { useEffect, useMemo, useState } from 'react'
import {
  Alert, Button, Paper, Stack, Typography, Tabs, Tab, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Grid, Box, Divider, List, ListItem, ListItemText,
  Table, TableBody, TableCell, TableHead, TableRow, Tooltip, MenuItem, Card
} from '@mui/material'
import GroupIcon from '@mui/icons-material/Group'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import DownloadIcon from '@mui/icons-material/Download'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import DescriptionIcon from '@mui/icons-material/Description'
import SlideshowIcon from '@mui/icons-material/Slideshow'
import ImageIcon from '@mui/icons-material/Image'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import api from '../utils/api.js'
import { presignGet } from '../utils/upload.js'
import AsyncButton from '../components/common/AsyncButton.jsx'
import { useAuthStore } from '../context/authStore.js'
import { notifyError, notifySuccess } from '../context/notificationStore.js'

const cardStyles = {
  borderRadius: 3,
  p: 3,
  bgcolor: '#fff',
  boxShadow: '0 8px 30px rgba(15, 23, 42, 0.03)'
}

const itemCardStyles = {
  borderRadius: 2,
  border: '1px solid',
  borderColor: 'divider',
  p: 2.5,
  boxShadow: 'none'
}

function StatusChip({ status }) {
  const color = status === 'approved' ? 'success' : status === 'declined' ? 'error' : status === 'cancelled' ? 'default' : 'warning'
  const label = status ? (status === 'cancelled' ? 'Cancelled' : status.charAt(0).toUpperCase() + status.slice(1)) : 'Pending'
  return <Chip size="small" color={color} label={label} />
}

// Submission Overview modal
function SubmissionOverview({ data, loading }) {
  const [tab, setTab] = React.useState('summary')
  React.useEffect(() => { setTab('summary') }, [loading, data?.submission?._id])

  if (loading) return <Typography variant="body2" color="text.secondary">Loading submission overview…</Typography>
  if (!data) return <Typography variant="body2" color="text.secondary">No submission data available.</Typography>
  if (data?.error) return <Alert severity="error">{data.error}</Alert>

  const submission = data.submission
  const project = data.project || {}
  const fields = Array.isArray(data.fields) ? data.fields : []
  if (!submission) return <Typography variant="body2" color="text.secondary">Submission record not found.</Typography>

  const steps = Array.isArray(project?.steps) ? project.steps : []
  const config = project?.config || {}
  const personal = submission?.personal && typeof submission.personal === 'object' ? submission.personal : {}
  const uploads = Array.isArray(submission?.uploads) ? submission.uploads : []
  const worker = submission?.userId || submission?.user
  const workerName = typeof worker === 'object' ? (worker?.name || worker?.email || worker?._id || 'Worker') : (submission?.workerName || worker || 'Worker')
  const workerEmail = typeof worker === 'object' ? worker?.email : submission?.workerEmail
  const projectName = typeof submission?.projectId === 'object'
    ? (submission?.projectId?.name || submission?.projectId?._id)
    : (project?.name || submission?.projectName || submission?.projectId)

  const stepByKey = Object.fromEntries(steps.map((s) => [s.key, s]))
  const isStepEnabled = (key) => !!(stepByKey[key] && stepByKey[key].enabled !== false)
  const formatDate = (value) => (value ? new Date(value).toLocaleString() : '—')
  const hasValue = (val) => !(val === undefined || val === null || (typeof val === 'string' && val.trim() === ''))

  const requiredFields = fields.filter((f) => f.required)
  const personalComplete = requiredFields.every((field) => hasValue(personal[field.key]))
  const documentsComplete = !isStepEnabled('uploads') || uploads.length > 0
  const slidesCount = Array.isArray(config?.slides) ? config.slides.length : 0
  const slidesComplete = !isStepEnabled('slides') || (submission?.slidesCompleted ? submission.slidesCompleted >= slidesCount : slidesCount === 0)
  const quizInfo = submission?.quiz || {}
  const quizCorrect = typeof quizInfo.correct === 'number' ? quizInfo.correct : 0
  const quizTotal = typeof quizInfo.total === 'number'
    ? quizInfo.total
    : (Array.isArray(config?.questions) ? config.questions.length : 0)
  const passMark = stepByKey?.quiz?.pass_mark ?? 0
  const quizComplete = !isStepEnabled('quiz') || (quizTotal > 0 && quizCorrect >= passMark)
  const signatureComplete = !isStepEnabled('sign') || Boolean(submission?.signatureDataUrl || submission?.signatureKey)

  const tabs = [
    { key: 'summary', label: 'Submission Summary' },
    { key: 'personal', label: 'Worker Details' },
    { key: 'documents', label: 'Documents' },
    { key: 'slides', label: 'Induction Materials' },
    { key: 'quiz', label: 'Quiz' },
    { key: 'signature', label: 'Signature' }
  ]
  const activeTab = tabs.find((t) => t.key === tab) ? tab : 'summary'

  const renderCompletionCard = (label, complete) => (
    <Card key={label} sx={{ flex: 1, p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
      <Typography variant="subtitle2" color="text.secondary">{label}</Typography>
      <Typography variant="h6" color={complete ? 'success.main' : 'error.main'}>
        {complete ? 'Complete' : 'Pending'}
      </Typography>
    </Card>
  )

  const openUpload = async (item) => {
    try {
      const key = typeof item === 'string' ? item : item?.key
      if (!key) return
      const { url } = await presignGet(key)
      if (url) window.open(url, '_blank', 'noopener,noreferrer')
    } catch (_) {}
  }

  const renderPersonalValue = (field, value) => {
    if (!hasValue(value)) return <Typography color="error.main">Not provided</Typography>
    if (field.type === 'boolean') return <Typography>{value ? 'Yes' : 'No'}</Typography>
    if (field.type === 'date') return <Typography>{formatDate(value)}</Typography>
    if (field.type === 'file') {
      return (
        <Button size="small" onClick={() => openUpload(value)}>
          View file
        </Button>
      )
    }
    if (Array.isArray(value)) return <Typography>{value.join(', ')}</Typography>
    if (typeof value === 'object') return <Typography>{JSON.stringify(value)}</Typography>
    return <Typography>{String(value)}</Typography>
  }

  return (
    <Box sx={{ py: 1, minWidth: { xs: 'auto', md: 600 } }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>Submission Overview</Typography>
        <Chip label={submission.status || 'pending'} color={statusChipColor(submission.status)} size="small" />
      </Stack>

      <Tabs value={activeTab} onChange={(_, value) => setTab(value)} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
        variant="scrollable" scrollButtons allowScrollButtonsMobile>
        {tabs.map((t) => <Tab key={t.key} value={t.key} label={t.label} />)}
      </Tabs>

      <Box sx={{ mt: 2 }}>
        {activeTab === 'summary' && (
          <Stack spacing={2}>
            <Card sx={cardStyles}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Worker</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{workerName}</Typography>
                  {workerEmail && <Typography variant="body2" color="text.secondary">{workerEmail}</Typography>}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Project</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{projectName || '—'}</Typography>
                  <Typography variant="body2" color="text.secondary">Submitted: {formatDate(submission?.createdAt)}</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">Total Steps</Typography>
                  <Typography variant="h6">{steps.filter((s) => s.enabled !== false).length}</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">Reviewed Status</Typography>
                  <Typography variant="h6">{submission.status || 'pending'}</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">Last Updated</Typography>
                  <Typography variant="h6">{formatDate(submission?.updatedAt)}</Typography>
                </Grid>
              </Grid>
            </Card>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              {renderCompletionCard('Worker Details', personalComplete)}
              {renderCompletionCard('Documents', documentsComplete)}
              {renderCompletionCard('Induction Materials', slidesComplete)}
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              {renderCompletionCard('Quiz', quizComplete)}
              {renderCompletionCard('Signature', signatureComplete)}
            </Stack>
          </Stack>
        )}

        {activeTab === 'personal' && (
          <Card sx={cardStyles}>
            {fields.length ? (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Field</TableCell>
                    <TableCell>Value</TableCell>
                    <TableCell>Required</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fields.map((field) => (
                    <TableRow key={field._id || field.key}>
                      <TableCell>{field.label || field.key}</TableCell>
                      <TableCell>{renderPersonalValue(field, personal[field.key])}</TableCell>
                      <TableCell>{field.required ? 'Yes' : 'No'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography color="text.secondary">No personal detail fields configured.</Typography>
            )}
          </Card>
        )}

        {activeTab === 'documents' && (
          <Card sx={cardStyles}>
            {uploads.length ? (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Document</TableCell>
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
                          <Button size="small" onClick={() => openUpload(upload)}>Open</Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            ) : (
              <Typography color="text.secondary">No documents uploaded.</Typography>
            )}
          </Card>
        )}

        {activeTab === 'slides' && (
          <Card sx={cardStyles}>
            {Array.isArray(config?.slides) && config.slides.length ? (
              <Stack spacing={1.5}>
                <Typography variant="subtitle2" color="text.secondary">Total Materials: {config.slides.length}</Typography>
                <List>
                  {config.slides.map((slide, idx) => (
                    <ListItem key={idx}>
                      <ListItemText primary={slide?.title || slide?.name || `Induction Material ${idx + 1}`} secondary={slide?.description || slide?.notes} />
                    </ListItem>
                  ))}
                </List>
              </Stack>
            ) : (
              <Typography color="text.secondary">No induction materials configured.</Typography>
            )}
          </Card>
        )}

        {activeTab === 'quiz' && (
          <Card sx={cardStyles}>
            <Stack spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">Total Questions: {quizTotal}</Typography>
              <Typography variant="subtitle2" color="text.secondary">Correct Answers: {quizCorrect}</Typography>
              <Typography variant="subtitle2" color="text.secondary">Pass Mark: {passMark}</Typography>
              <Typography variant="subtitle2" color="text.secondary">
                Result: <Typography component="span" color={quizComplete ? 'success.main' : 'error.main'}>{quizComplete ? 'Passed' : 'Pending/Failed'}</Typography>
              </Typography>
            </Stack>
          </Card>
        )}

        {activeTab === 'signature' && (
          <Card sx={cardStyles}>
            <Stack spacing={2}>
              {(submission?.signatureDataUrl || submission?.signatureKey) ? (
                <>
                  <Typography variant="subtitle2" color="text.secondary">Signature Evidence</Typography>
                  {submission?.signatureDataUrl ? (
                    <Box
                      component="img"
                      src={submission.signatureDataUrl}
                      alt="Worker signature"
                      sx={{ maxWidth: '100%', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
                    />
                  ) : null}
                  {submission?.signatureKey && (
                    <Button size="small" variant="outlined" onClick={() => openUpload(submission.signatureKey)}>
                      Download Signature
                    </Button>
                  )}
                </>
              ) : (
                <Typography color="text.secondary">No signature captured.</Typography>
              )}
            </Stack>
          </Card>
        )}
      </Box>
    </Box>
  )
}


// Submission viewer for managers/admins
function SubmissionViewer({ submission }) {
  const s = submission || {}
  const worker = s?.userId || s?.user || {}
  const project = s?.projectId || {}
  const created = s?.createdAt ? new Date(s.createdAt).toLocaleString() : ''
  const quiz = s?.quiz || {}
  const pct = typeof quiz.total === 'number' && quiz.total > 0 ? Math.round((quiz.correct || 0) * 100 / quiz.total) : null
  const personal = s?.personal && typeof s.personal === 'object' ? s.personal : {}
  const uploads = Array.isArray(s?.uploads) ? s.uploads : []

  const ext = (str) => { try { return String(str||'').split('?')[0].split('#')[0].split('.').pop().toLowerCase() } catch { return '' } }
  const iconFor = (name) => {
    const e = ext(name)
    if (['pdf'].includes(e)) return <PictureAsPdfIcon sx={{ fontSize: 32, color: 'error.main' }} />
    if (['png','jpg','jpeg','webp','gif','bmp'].includes(e)) return <ImageIcon sx={{ fontSize: 32, color: 'success.main' }} />
    if (['ppt','pptx','key'].includes(e)) return <SlideshowIcon sx={{ fontSize: 32, color: 'warning.main' }} />
    if (['doc','docx','txt','rtf','csv','xls','xlsx'].includes(e)) return <DescriptionIcon sx={{ fontSize: 32, color: 'info.main' }} />
    return <InsertDriveFileIcon sx={{ fontSize: 28, color: 'text.secondary' }} />
  }

  const openFile = async (u) => {
    try {
      const key = typeof u === 'string' ? u : (u?.key || '')
      if (!key) return
      const { url } = await presignGet(key)
      window.open(url || `/${key}`, '_blank', 'noopener,noreferrer')
    } catch (_) {}
  }

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Summary</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}><Typography variant="body2"><b>Worker:</b> {worker?.name} ({worker?.email})</Typography></Grid>
          <Grid item xs={12} sm={6} md={3}><Typography variant="body2"><b>Project:</b> {project?.name}</Typography></Grid>
          <Grid item xs={12} sm={6} md={3}><Typography variant="body2"><b>Date:</b> {created}</Typography></Grid>
          <Grid item xs={12} sm={6} md={3}><Typography variant="body2"><b>Status:</b> {s?.status}</Typography></Grid>
        </Grid>
      </Box>

      <Divider />
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Quiz</Typography>
        <Stack direction="row" spacing={1}>
          <Chip size="small" label={`Total: ${quiz.total ?? '-'}`} />
          <Chip size="small" color="success" label={`Correct: ${quiz.correct ?? '-'}`} />
          {pct != null && <Chip size="small" color={pct >= 80 ? 'success' : pct >= 50 ? 'warning' : 'error'} label={`${pct}%`} />}
        </Stack>
      </Box>

      {!!(personal && Object.keys(personal).length) && (
        <>
          <Divider />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Worker Details</Typography>
            <Grid container spacing={1}>
              {Object.entries(personal).map(([k,v]) => (
                <Grid key={k} item xs={12} sm={6} md={4}><Typography variant="body2"><b>{k}:</b> {String(v ?? '')}</Typography></Grid>
              ))}
            </Grid>
          </Box>
        </>
      )}

      {!!uploads.length && (
        <>
          <Divider />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Uploads</Typography>
            <Grid container spacing={2}>
              {uploads.map((u, idx) => {
                const name = typeof u === 'string' ? u.split('/').pop() : (u?.name || u?.key || `file-${idx+1}`)
                return (
                  <Grid key={idx} item xs={12} sm={6} md={4}>
                    <Paper variant="outlined" sx={{ p:1 }}>
                      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                        <Stack direction="row" spacing={1} alignItems="center">
                          {iconFor(name)}
                          <Typography variant="body2" sx={{ maxWidth: 240, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</Typography>
                        </Stack>
                        <Button size="small" startIcon={<DownloadIcon />} onClick={()=> openFile(u)}>Open</Button>
                      </Stack>
                    </Paper>
                  </Grid>
                )
              })}
            </Grid>
          </Box>
        </>
      )}

      {!!s?.signatureDataUrl && (
        <>
          <Divider />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Signature</Typography>
            <img src={s.signatureDataUrl} alt="signature" style={{ maxWidth: '100%', border: '1px solid #eee', borderRadius: 8 }} />
          </Box>
        </>
      )}
    </Stack>
  )
}
function ReviewQueue() {
  // Minimal wrapper so Admin/Reviews.jsx continues to work
  return <SubmissionOverview data={null} loading={false} />
}

export default ReviewQueue;

