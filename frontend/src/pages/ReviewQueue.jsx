import React, { useEffect, useMemo, useState } from 'react'
import {
  Alert, Button, Paper, Stack, Typography, Tabs, Tab, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Grid, Box, Divider, List, ListItem, ListItemText,
  Table, TableBody, TableCell, TableHead, TableRow, Tooltip
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
import AsyncButton from '../components/AsyncButton.jsx'
import { useAuthStore } from '../store/auth.js'
import { notifyError, notifySuccess } from '../notifications/store.js'

function StatusChip({ status }) {
  const color = status === 'approved' ? 'success' : status === 'declined' ? 'error' : status === 'cancelled' ? 'default' : 'warning'
  const label = status ? (status === 'cancelled' ? 'Cancelled' : status.charAt(0).toUpperCase() + status.slice(1)) : 'Pending'
  return <Chip size="small" color={color} label={label} />
}

// Project Configuration viewer with tabs
function ProjectConfigViewer({ config }) {
  const [tab, setTab] = React.useState(0)
  const cfg = config || {}
  const pinfoAll = cfg.projectInfo || {}
  const mapKey = pinfoAll?.projectMapKey || pinfoAll?.mapKey || ''
  const [projectMapUrl, setProjectMapUrl] = React.useState('')
  React.useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        if (!mapKey) { setProjectMapUrl(''); return }
        if (/^https?:/i.test(mapKey)) { setProjectMapUrl(mapKey); return }
        const { url } = await presignGet(mapKey)
        if (!cancelled) setProjectMapUrl(url || '')
      } catch (_) {
        if (!cancelled) setProjectMapUrl(mapKey ? `/${mapKey}` : '')
      }
    }
    load()
    return () => { cancelled = true }
  }, [mapKey])

  const anyToArray = (v) => Array.isArray(v) ? v : (v && typeof v === 'object' ? Object.values(v) : [])
  const combinedFilesArr = [
    ...anyToArray(cfg.slides || cfg.materials),
    ...anyToArray(cfg.uploads),
    ...anyToArray(cfg.files)
  ]
  const hasProjectInfo = !!cfg.projectInfo && Object.keys(cfg.projectInfo || {}).length > 0
  const hasPersonal = !!cfg.personalDetails && Array.isArray(cfg.personalDetails?.fields) && cfg.personalDetails.fields.length > 0
  const hasSlides = combinedFilesArr.length > 0
  const hasQuestions = Array.isArray(cfg.questions) && cfg.questions.length > 0

  const tabs = [
    hasProjectInfo && { key: 'info', label: 'Project Info' },
    hasPersonal && { key: 'personal', label: 'Personal Details' },
    hasSlides && { key: 'slides', label: 'Slides & Files' },
    hasQuestions && { key: 'questions', label: 'Questions' }
  ].filter(Boolean)
  const effectiveIndex = Math.min(tab, Math.max(0, tabs.length - 1))

  const doExport = () => {
    try {
      const blob = new Blob([JSON.stringify(cfg, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'project-config.json'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (_) {}
  }

  const ext = (s) => { try { return String(s || '').split('?')[0].split('#')[0].split('.').pop().toLowerCase() } catch { return '' } }
  const isImage = (s, t) => ['png','jpg','jpeg','webp','gif','bmp'].includes(ext(s)) || (typeof t === 'string' && t.startsWith('image'))
  const iconFor = (s) => {
    const e = ext(s)
    if (['pdf'].includes(e)) return <PictureAsPdfIcon sx={{ fontSize: 48, color: 'error.main' }} />
    if (['ppt','pptx','key'].includes(e)) return <SlideshowIcon sx={{ fontSize: 48, color: 'warning.main' }} />
    if (['doc','docx','txt','rtf','csv','xls','xlsx'].includes(e)) return <DescriptionIcon sx={{ fontSize: 48, color: 'info.main' }} />
    return <InsertDriveFileIcon sx={{ fontSize: 42, color: 'text.secondary' }} />
  }
  const isSlidesKey = (k) => /^slides\//.test(String(k || ''))
  const displayName = (f) => f?.name || f?.title || (isSlidesKey(f?.key) ? 'Slides' : ((f?.key || '').split('/').pop() || 'file'))
  const openItem = async (f) => {
    try {
      if (f?.key && isSlidesKey(f.key)) {
        const e = ext(f?.name) || ext(f?.title) || ext(f?.url) || 'pptx'
        const n = displayName(f) || 'Slides'
        const params = new URLSearchParams({ key: f.key, name: n, ext: e })
        window.open(`/slides-viewer?${params.toString()}`, '_blank', 'noopener,noreferrer')
        return
      }
      if (f?.url) { window.open(f.url, '_blank', 'noopener,noreferrer'); return }
      if (f?.key) {
        const { url } = await presignGet(f.key)
        if (url) window.open(url, '_blank', 'noopener,noreferrer')
      }
    } catch (_) {}
  }

  return (
    <Box sx={{ py: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>Project Configuration</Typography>
        <Button size="small" startIcon={<DownloadIcon />} onClick={doExport}>Export JSON</Button>
      </Box>

      <Tabs value={effectiveIndex} onChange={(_,v)=> setTab(v)} sx={{ borderBottom: '1px solid #eee' }} variant="scrollable" scrollButtons allowScrollButtonsMobile>
        {tabs.map((t, idx) => (<Tab key={t.key} label={t.label} value={idx} />))}
      </Tabs>

      <Box sx={{ mt: 2 }}>
        {tabs[effectiveIndex]?.key === 'info' && (
          <Paper variant="outlined" sx={{ p: 2, maxHeight: '60vh', overflowY: 'auto' }}>
            {(() => {
              const pinfo = cfg.projectInfo || {}
              const mk = pinfo?.projectMapKey || pinfo?.mapKey
              return (
                <>
                  {mk ? (
                    <Box sx={{ mb: 2 }}>
                      <Box component="img" src={projectMapUrl || (mk ? `/${mk}` : '')} alt="Project Map" sx={{ width: '100%', maxWidth: 300, borderRadius: 1 }} />
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>Map key: {String(mk)}</Typography>
                    </Box>
                  ) : null}
                  {Object.keys(pinfo).length ? (
                    <Table size="small">
                      <TableBody>
                        {Object.entries(pinfo).map(([k, v]) => (
                          <TableRow key={k}>
                            <TableCell sx={{ width: '35%' }}><Typography variant="subtitle2">{String(k)}</Typography></TableCell>
                            <TableCell>{typeof v === 'object' ? JSON.stringify(v) : String(v ?? '')}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <Typography color="text.secondary">No data available</Typography>
                  )}
                </>
              )
            })()}
          </Paper>
        )}

        {tabs[effectiveIndex]?.key === 'personal' && (
          <Paper variant="outlined" sx={{ p: 2, maxHeight: '60vh', overflowY: 'auto' }}>
            {Array.isArray(cfg.personalDetails?.fields) && cfg.personalDetails.fields.length ? (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Label</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Required</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cfg.personalDetails.fields.map((f, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{f.label || f.name || '-'}</TableCell>
                      <TableCell>{f.type || '-'}</TableCell>
                      <TableCell>{f.required ? 'Yes' : 'No'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography color="text.secondary">No data available</Typography>
            )}
          </Paper>
        )}

        {tabs[effectiveIndex]?.key === 'slides' && (
          <Paper variant="outlined" sx={{ p: 2, maxHeight: '70vh', overflowY: 'auto' }}>
            {(() => {
              const toArray = anyToArray
              const raw = [
                ...toArray(cfg.slides || cfg.materials),
                ...toArray(cfg.uploads),
                ...toArray(cfg.files)
              ]
              const norm = raw.map((item) => {
                if (typeof item === 'string') {
                  const key = item
                  const name = key.split('/').pop() || key
                  const url = `/${key}`
                  return { key, name, url }
                }
                const key = item?.key || item?.path || item?.url || ''
                const name = item?.name || item?.title || (typeof key === 'string' ? (key.split('/').pop() || key) : 'file')
                const url = item?.url || (item?.key ? `/${item.key}` : (typeof key === 'string' ? `/${key}` : ''))
                const type = item?.type || item?.mime
                return { key, name, url, type }
              }).filter((f) => f && (f.url || f.key))

              if (!norm.length) return <Typography color="text.secondary">No files uploaded</Typography>

              return (
                <Box>
                  <Grid container spacing={2}>
                    {norm.map((f, idx) => (
                      <Grid key={`${f.key || f.url || idx}-${idx}`} item xs={12} sm={6} md={4} lg={3}>
                        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, height: '100%' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: 72, height: 72, borderRadius: 1, border: '1px solid', borderColor: 'divider', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 1.5 }}>
                              {isImage(f.url || f.key, f.type) ? (
                                <Box component="img" src={f.url} alt={f.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                iconFor(f.url || f.key)
                              )}
                            </Box>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography variant="subtitle2" noWrap title={displayName(f)}>{displayName(f)}</Typography>
                              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                <Button size="small" variant="outlined" onClick={()=> openItem(f)}>Open</Button>
                              </Stack>
                            </Box>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                  <List>
                    {norm.map((f, idx) => {
                      const url = f?.url || ''
                      const type = f?.type || ext(f?.name) || ext(url) || (f?.key ? ext(f.key) : '-')
                      const title = displayName(f)
                      return (
                        <ListItem key={idx} secondaryAction={<Button size="small" onClick={()=> openItem(f)}>Open</Button>}>
                          <ListItemText primary={title} secondary={`Type: ${type}${(url || f?.key) ? ' • link' : ''}`} />
                        </ListItem>
                      )
                    })}
                  </List>
                </Box>
              )
            })()}
          </Paper>
        )}

        {tabs[effectiveIndex]?.key === 'questions' && (
          <Paper variant="outlined" sx={{ p: 2, maxHeight: '60vh', overflowY: 'auto' }}>
            {Array.isArray(cfg.questions) && cfg.questions.length ? (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Question</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Correct Answer(s)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cfg.questions.map((q, qi) => {
                    const type = q?.type || (Array.isArray(q?.answers) ? 'multiple-choice' : 'text')
                    const correctIdx = typeof q?.correctIndex === 'number' ? [q.correctIndex] : (Array.isArray(q?.correctIndices) ? q.correctIndices : [])
                    const correctAnswers = Array.isArray(q?.answers) ? q.answers.filter((_, idx) => correctIdx.includes(idx)) : (Array.isArray(q?.correctAnswers) ? q.correctAnswers : (q?.correctAnswer ? [q.correctAnswer] : []))
                    return (
                      <TableRow key={`q-${qi}`}>
                        <TableCell>{q?.questionText || q?.text || q?.question || `Question ${qi+1}`}</TableCell>
                        <TableCell>{type}</TableCell>
                        <TableCell>
                          {Array.isArray(correctAnswers) && correctAnswers.length
                            ? correctAnswers.map((a, i) => (<Typography key={i} component="span" sx={{ fontWeight: 600, mr: 1 }}>{String(a)}</Typography>))
                            : <Typography color="text.secondary">-</Typography>}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            ) : (
              <Typography color="text.secondary">No data available</Typography>
            )}
          </Paper>
        )}
      </Box>
    </Box>
  )
}

export default function ReviewQueue() {
  const { user } = useAuthStore()
  const [tab, setTab] = useState(0)
  const [subs, setSubs] = useState([])
  const [allSubs, setAllSubs] = useState([])
  const [historyFilter, setHistoryFilter] = useState('all')
  const [projReviews, setProjReviews] = useState([])
  const [projects, setProjects] = useState([])
  const [viewOpen, setViewOpen] = useState(false)
  const [viewTitle, setViewTitle] = useState('')
  const [viewJson, setViewJson] = useState(null)
  const [deleteReviewOpen, setDeleteReviewOpen] = useState(false)
  const [deleteReviewId, setDeleteReviewId] = useState(null)

  const load = () => Promise.all([
    api.get('/submissions').then(r => setSubs(r.data || [])),
    api.get('/submissions?status=all').then(r => setAllSubs(r.data || [])),
    api.get('/reviews/projects?status=all').then(r => setProjReviews(r.data || []))
  ])
  useEffect(()=> { if (user) load() }, [user])
  useEffect(()=> { api.get('/projects').then(r => setProjects(r.data || [])) }, [])

  if (!user) return <Alert severity="info">Please log in as manager/admin.</Alert>
  if (user.role === 'worker') return <Alert severity="warning">Managers/Admins only.</Alert>

  const openView = (title, data) => { setViewTitle(title); setViewJson(data); setViewOpen(true) }
  const closeView = () => setViewOpen(false)
  const openDeleteReview = (id) => { setDeleteReviewId(id); setDeleteReviewOpen(true) }
  const closeDeleteReview = () => setDeleteReviewOpen(false)

  const approveProject = async (id) => { await api.post(`/reviews/projects/${id}/approve`); await load() }
  const declineProject = async (id) => { await api.post(`/reviews/projects/${id}/decline`, { reason: 'Not adequate' }); await load() }
  const deleteReview = async () => {
    if (!deleteReviewId) return
    try {
      const r = await api.delete(`/reviews/${deleteReviewId}`)
      notifySuccess(r?.data?.message || 'Review deleted successfully')
      await load()
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || 'Failed to delete review'
      notifyError(msg)
    } finally {
      setDeleteReviewOpen(false)
      setDeleteReviewId(null)
    }
  }

  // Fetch latest project config when viewing a project review
  const viewProjectReview = async (pr) => {
    try {
      const projId = typeof pr?.projectId === 'string' ? pr.projectId : (pr?.projectId && pr.projectId._id)
      setViewTitle('Project Configuration')
      setViewOpen(true)
      if (projId) {
        const r = await api.get(`/projects/${projId}`)
        const latest = r?.data?.config || {}
        setViewJson(latest)
        return
      }
    } catch (_) {}
    setViewJson(pr?.data || {})
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Manager Review</Typography>
      <Tabs value={tab} onChange={(_,v)=> setTab(v)} sx={{ borderBottom: '1px solid #eee' }}>
        <Tab label="Project Reviews" />
        <Tab label="Worker Submissions" />
        <Tab label="All Submissions" />
      </Tabs>

      {/* Project Reviews */}
      <Box hidden={tab!==0}>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {projReviews.map(pr => (
            <Grid key={pr._id} item xs={12}>
              <Paper sx={{ p:2 }}>
                <Stack direction={{ xs:'column', md:'row' }} justifyContent="space-between" alignItems={{ md:'center' }} spacing={1}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{pr?.projectId?.name || pr.projectId}</Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <StatusChip status={pr.status || 'pending'} />
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>Requested: {new Date(pr.createdAt).toLocaleString()}</Typography>
                    </Stack>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button variant="outlined" onClick={()=> viewProjectReview(pr)}>View</Button>
                    {pr.status !== 'cancelled' && (
                      <>
                        <Button color="error" variant="outlined" onClick={()=> declineProject(pr._id)}>Decline</Button>
                        <AsyncButton color="success" variant="contained" onClick={()=> approveProject(pr._id)}>Approve</AsyncButton>
                      </>
                    )}
                    {user?.role === 'admin' && (
                      <Button color="error" variant="outlined" onClick={()=> openDeleteReview(pr._id)}>Delete</Button>
                    )}
                  </Stack>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
        {!projReviews.length && <Alert severity="info" sx={{ mt: 2 }}>No pending project reviews.</Alert>}
      </Box>

      {/* Worker Submissions */}
      <Box hidden={tab!==1}>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {subs.map(s => (
            <Grid key={s._id} item xs={12}>
              <Paper sx={{ p:2 }}>
                <Stack direction={{ xs:'column', md:'row' }} justifyContent="space-between" alignItems={{ md:'center' }} spacing={1}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Submission {s._id}</Typography>
                    <Stack direction="row" spacing={1}>
                      <StatusChip status={s.status || 'pending'} />
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>Date: {new Date(s.createdAt).toLocaleString()}</Typography>
                    </Stack>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
        {!subs.length && <Alert severity="info" sx={{ mt: 2 }}>No pending worker submissions.</Alert>}
      </Box>

      {/* All Submissions */}
      <Box hidden={tab!==2}>
        {(() => {
          const counts = allSubs.reduce((acc, s) => { acc.all++; acc[s.status] = (acc[s.status] || 0) + 1; return acc }, { all: 0, pending: 0, approved: 0, declined: 0 })
          const filtered = allSubs.filter(s => historyFilter==='all' ? true : s.status===historyFilter)
          const statusColor = (st) => st==='approved' ? 'success' : st==='declined' ? 'error' : 'warning'
          return (
            <Stack spacing={2} sx={{ mt: 2 }}>
              <Tabs value={historyFilter} onChange={(_,v)=> setHistoryFilter(v)} variant="scrollable" scrollButtons allowScrollButtonsMobile>
                <Tab value="all" label={`All (${counts.all})`} />
                <Tab value="pending" label={`Pending (${counts.pending})`} />
                <Tab value="approved" label={`Approved (${counts.approved})`} />
                <Tab value="declined" label={`Declined (${counts.declined})`} />
              </Tabs>
              <Paper sx={{ width: '100%', overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Worker</TableCell>
                      <TableCell>Project</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Submitted At</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filtered.map((s) => {
                      const workerName = s?.userId?.name || s?.user?.name || String(s.userId || '')
                      const projectName = s?.projectId?.name || String(s.projectId || '')
                      return (
                        <TableRow key={s._id} hover>
                          <TableCell>{workerName}</TableCell>
                          <TableCell>{projectName}</TableCell>
                          <TableCell><Chip size="small" color={statusColor(s.status)} label={s.status} /></TableCell>
                          <TableCell>{new Date(s.createdAt).toLocaleString()}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
                {!filtered.length && <Alert severity="info" sx={{ m: 2 }}>No submissions found.</Alert>}
              </Paper>
            </Stack>
          )
        })()}
      </Box>

      {/* View Dialog */}
      <Dialog open={viewOpen} onClose={closeView} maxWidth="md" fullWidth>
        <DialogTitle>{viewTitle}</DialogTitle>
        <DialogContent>
          {viewTitle === 'Project Configuration' && viewJson
            ? <ProjectConfigViewer config={viewJson} />
            : <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{viewJson ? JSON.stringify(viewJson, null, 2) : ''}</pre>}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeView}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Project Review */}
      <Dialog open={deleteReviewOpen} onClose={closeDeleteReview} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Review</DialogTitle>
        <DialogContent>
          <Typography variant="body2">Are you sure? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteReview}>Cancel</Button>
          <AsyncButton color="error" variant="contained" onClick={deleteReview}>Delete</AsyncButton>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}