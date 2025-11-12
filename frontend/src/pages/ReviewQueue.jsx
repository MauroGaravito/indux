import React, { useEffect, useMemo, useState } from 'react'
import {
  Alert, Button, Paper, Stack, Typography, Tabs, Tab, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Grid, Box, Divider, List, ListItem, ListItemText,
  Table, TableBody, TableCell, TableHead, TableRow, Tooltip, MenuItem
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
  // Submission decline modal state
  const [declineOpen, setDeclineOpen] = useState(false)
  const [declineId, setDeclineId] = useState(null)
  const [declineReason, setDeclineReason] = useState('Not adequate')
  // My Team state (manager)
  const [teamProjectId, setTeamProjectId] = useState('')
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState('')
  const [workerOptions, setWorkerOptions] = useState([])

  const load = () => Promise.all([
    api.get('/submissions').then(r => setSubs(r.data || [])),
    api.get('/submissions?status=all').then(r => setAllSubs(r.data || [])),
    api.get('/reviews/projects?status=all').then(r => setProjReviews(r.data || []))
  ])
  useEffect(()=> { if (user) load() }, [user])
  useEffect(()=> { api.get('/projects').then(r => setProjects(r.data || [])) }, [])
  // Reload workers when project changes (only for managers)
  useEffect(() => { if (teamProjectId) loadProjectWorkers(teamProjectId) }, [teamProjectId])

  if (!user) return <Alert severity="info">Please log in as manager/admin.</Alert>
  if (user.role === 'worker') return <Alert severity="warning">Managers/Admins only.</Alert>

  const openView = (title, data) => { setViewTitle(title); setViewJson(data); setViewOpen(true) }
  const closeView = () => setViewOpen(false)
  const openDeleteReview = (id) => { setDeleteReviewId(id); setDeleteReviewOpen(true) }
  const closeDeleteReview = () => setDeleteReviewOpen(false)

  const approveProject = async (id) => { await api.post(`/reviews/projects/${id}/approve`); await load() }
  const declineProject = async (id) => { await api.post(`/reviews/projects/${id}/decline`, { reason: 'Not adequate' }); await load() }
  // Submission review actions
  const approveSubmission = async (id) => { await api.post(`/submissions/${id}/approve`); await load() }
  const openDeclineSubmission = (id) => { setDeclineId(id); setDeclineOpen(true) }
  const doDeclineSubmission = async () => {
    if (!declineId) return
    await api.post(`/submissions/${declineId}/decline`, { reason: declineReason || 'Not adequate' })
    setDeclineOpen(false)
    setDeclineId(null)
    setDeclineReason('Not adequate')
    await load()
  }
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

  // ---- My Team helpers ----
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === 'worker'))
    } catch { setProjectWorkers([]) }
  }
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      // Admins can list all users; managers get a restricted list
      const r = await api.get(user?.role === 'admin' ? '/users' : '/users/workers')
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === 'worker'))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId('') }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post('/assignments', { user: addWorkerId, project: teamProjectId, role: 'worker' })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Manager Review</Typography>
      <Tabs value={tab} onChange={(_,v)=> setTab(v)} sx={{ borderBottom: '1px solid #eee' }}>
        <Tab label="Project Reviews" />
        <Tab label="Worker Submissions" />
        <Tab label="All Submissions" />
        <Tab icon={<GroupIcon />} iconPosition="start" label="My Team" />
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
                    {pr.status === 'pending' && (
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
                    <Stack direction="row" spacing={1} alignItems="center">
                      <StatusChip status={s.status || 'pending'} />
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>Date: {new Date(s.createdAt).toLocaleString()}</Typography>
                      {s?.userId && <Typography variant="caption" sx={{ opacity: 0.7 }}>• Worker: {s?.userId?.name || s?.user?.name || ''}</Typography>}
                      {s?.projectId && <Typography variant="caption" sx={{ opacity: 0.7 }}>• Project: {s?.projectId?.name || ''}</Typography>}
                    </Stack>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Button size="small" onClick={()=> openView('Submission', s)}>View</Button>
                    {s.status === 'pending' && (
                      <>
                        <Button size="small" color="error" variant="outlined" onClick={()=> openDeclineSubmission(s._id)}>Decline</Button>
                        <AsyncButton size="small" color="success" variant="contained" onClick={()=> approveSubmission(s._id)}>Approve</AsyncButton>
                      </>
                    )}
                  </Stack>
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

      {/* My Team */}
      <Box hidden={tab!==3}>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <Stack direction={{ xs:'column', sm:'row' }} spacing={2} alignItems={{ sm:'center' }}>
            <TextField select label="Select Project" value={teamProjectId} onChange={(e)=> setTeamProjectId(e.target.value)} sx={{ minWidth: 260 }}>
              {projects.map(p => (<MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>))}
            </TextField>
            <Box sx={{ flex: 1 }} />
            <Button variant="contained" disabled={!teamProjectId} onClick={openAddWorker} sx={{ textTransform: 'none' }}>Add Worker</Button>
          </Stack>

          <Paper sx={{ width: '100%', overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Worker</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Assignment Id</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projectWorkers.map(a => (
                  <TableRow key={a._id} hover>
                    <TableCell>{a?.user?.name || a.user}</TableCell>
                    <TableCell>{a?.user?.email || '-'}</TableCell>
                    <TableCell>{a._id}</TableCell>
                    <TableCell align="right">
                      <Button color="error" size="small" onClick={()=> removeWorker(a._id)}>Unassign</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!projectWorkers.length && teamProjectId && (
              <Alert severity="info" sx={{ m: 2 }}>No workers assigned yet.</Alert>
            )}
            {!teamProjectId && (
              <Alert severity="info" sx={{ m: 2 }}>Select a project to manage its team.</Alert>
            )}
          </Paper>
        </Stack>
      </Box>

      {/* View Dialog */}
      <Dialog open={viewOpen} onClose={closeView} maxWidth="md" fullWidth>
        <DialogTitle>{viewTitle}</DialogTitle>
        <DialogContent>
          {viewTitle === 'Project Configuration' && viewJson && (
            <ProjectConfigViewer config={viewJson} />
          )}
          {viewTitle === 'Submission' && viewJson && (
            <SubmissionViewer submission={viewJson} />
          )}
          {!viewJson && (
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{viewJson ? JSON.stringify(viewJson, null, 2) : ''}</pre>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeView}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Decline Submission Dialog */}
      <Dialog open={declineOpen} onClose={()=> setDeclineOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Decline Submission</DialogTitle>
        <DialogContent>
          <TextField autoFocus fullWidth multiline minRows={2} label="Reason" value={declineReason} onChange={(e)=> setDeclineReason(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={()=> setDeclineOpen(false)}>Cancel</Button>
          <AsyncButton color="error" variant="contained" onClick={doDeclineSubmission}>Decline</AsyncButton>
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

      {/* Add Worker Modal */}
      <Dialog open={addWorkerOpen} onClose={closeAddWorker} maxWidth="sm" fullWidth>
        <DialogTitle>Add Worker</DialogTitle>
        <DialogContent>
          <TextField fullWidth select label="Worker" value={addWorkerId} onChange={(e)=> setAddWorkerId(e.target.value)} helperText="Select a worker to assign">
            {workerOptions.map(u => (
              <MenuItem key={u._id} value={u._id}>{u.name} ({u.email})</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAddWorker}>Cancel</Button>
          <AsyncButton variant="contained" onClick={addWorker} disabled={!addWorkerId || !teamProjectId}>Add</AsyncButton>
        </DialogActions>
      </Dialog>
    </Stack>
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
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Personal Details</Typography>
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
