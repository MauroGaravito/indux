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
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } import {
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  Alert, Button, Paper, Stack, Typography, Tabs, Tab, Chip, Dialog, DialogTitle,
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  DialogContent, DialogActions, TextField, Grid, Box, Divider, List, ListItem, ListItemText,
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  Table, TableBody, TableCell, TableHead, TableRow, Tooltip, MenuItem
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]} from '@mui/material'
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]import GroupIcon from '@mui/icons-material/Group'
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]import DownloadIcon from '@mui/icons-material/Download'
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]import DescriptionIcon from '@mui/icons-material/Description'
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]import SlideshowIcon from '@mui/icons-material/Slideshow'
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]import ImageIcon from '@mui/icons-material/Image'
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]import api from '../utils/api.js'
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } import { presignGet } from '../utils/upload.js'
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]import AsyncButton from '../components/AsyncButton.jsx'
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } import { useAuthStore } from '../store/auth.js'
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } import { notifyError, notifySuccess } from '../notifications/store.js'
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]function StatusChip({ status }) {
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const color = status === 'approved' ? 'success' : status === 'declined' ? 'error' : status === 'cancelled' ? 'default' : 'warning'
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const label = status ? (status === 'cancelled' ? 'Cancelled' : status.charAt(0).toUpperCase() + status.slice(1)) : 'Pending'
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  return <Chip size="small" color={color} label={label} />
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]}
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]// Project Configuration viewer with tabs
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]function ProjectConfigViewer({ config }) {
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const [tab, setTab] = React.useState(0)
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const cfg = config || {}
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const pinfoAll = cfg.projectInfo || {}
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const mapKey = pinfoAll?.projectMapKey || pinfoAll?.mapKey || ''
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const [projectMapUrl, setProjectMapUrl] = React.useState('')
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  React.useEffect(() => {
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]    let cancelled = false
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]    async function load() {
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]      try {
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]        if (!mapKey) { setProjectMapUrl(''); return }
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]        if (/^https?:/i.test(mapKey)) { setProjectMapUrl(mapKey); return }
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]        const { url } = await presignGet(mapKey)
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]        if (!cancelled) setProjectMapUrl(url || '')
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]      } catch (_) {
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]        if (!cancelled) setProjectMapUrl(mapKey ? `/${mapKey}` : '')
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]      }
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]    }
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]    load()
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]    return () => { cancelled = true }
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  }, [mapKey])
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const hasProjectInfo = !!cfg.projectInfo && Object.keys(cfg.projectInfo || {}).length > 0
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const hasPersonal = !!cfg.personalDetails && Array.isArray(cfg.personalDetails?.fields) && cfg.personalDetails.fields.length > 0
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const slides = cfg.slides || cfg.materials
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const uploads = cfg?.uploads || cfg?.files
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const hasSlides = !!slides && ((Array.isArray(slides) && slides.length > 0) || (!!slides && Object.keys(slides).length > 0))
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]    || (Array.isArray(uploads) && uploads.length > 0)
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const hasQuestions = Array.isArray(cfg.questions) && cfg.questions.length > 0
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const tabs = [
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]    hasProjectInfo && { key: 'info', label: 'Project Info' },
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]    hasPersonal && { key: 'personal', label: 'Personal Details' },
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]    hasSlides && { key: 'slides', label: 'Slides & Files' },
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]    hasQuestions && { key: 'questions', label: 'Questions' }
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  ].filter(Boolean)
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const effectiveIndex = Math.min(tab, Math.max(0, tabs.length - 1))
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const doExport = () => {
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]    try {
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]      const blob = new Blob([JSON.stringify(cfg, null, 2)], { type: 'application/json' })
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]      const url = URL.createObjectURL(blob)
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]      const a = document.createElement('a')
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]      a.href = url
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]      a.download = 'project-config.json'
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]      document.body.appendChild(a)
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]      a.click()
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]      document.body.removeChild(a)
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]      URL.revokeObjectURL(url)
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]    } catch (_) {}
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  }
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  return (
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]    <Box sx={{ py: 1 }}>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]        <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>Project Configuration</Typography>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]        <Button size="small" startIcon={<DownloadIcon />} onClick={doExport}>Export JSON</Button>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]      </Box>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]      <Tabs value={effectiveIndex} onChange={(_,v)=> setTab(v)} sx={{ borderBottom: '1px solid #eee' }} variant="scrollable" scrollButtons allowScrollButtonsMobile>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]        {tabs.map((t, idx) => (<Tab key={t.key} label={t.label} value={idx} />))}
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]      </Tabs>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]      <Box sx={{ mt: 2 }}>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]        {tabs[effectiveIndex]?.key === 'info' && (
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]          <Paper variant="outlined" sx={{ p: 2, maxHeight: '60vh', overflowY: 'auto' }}>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]            {(() => {
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              const pinfo = cfg.projectInfo || {}
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              const mapKey = pinfo?.projectMapKey || pinfo?.mapKey
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              return (
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                <>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                  {mapKey ? (
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    <Box sx={{ mb: 2 }}>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                      <Box component="img" src={projectMapUrl || (mapKey ? `/${mapKey}` : '')} alt="Project Map" sx={{ width: '100%', maxWidth: 300, borderRadius: 1 }} />
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>Map key: {String(mapKey)}</Typography>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    </Box>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                  ) : null}
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                  {Object.keys(pinfo).length ? (
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    <Table size="small">
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                      <TableBody>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                        {Object.entries(pinfo).map(([k, v]) => (
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                          <TableRow key={k}>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                            <TableCell sx={{ width: '35%' }}><Typography variant="subtitle2">{String(k)}</Typography></TableCell>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                            <TableCell>{typeof v === 'object' ? JSON.stringify(v) : String(v ?? '')}</TableCell>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                          </TableRow>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                        ))}
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                      </TableBody>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    </Table>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                  ) : (
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    <Typography color="text.secondary">No data available</Typography>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                  )}
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                </>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              )
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]            })()}
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]          </Paper>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]        )}
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]        {tabs[effectiveIndex]?.key === 'personal' && (
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]          <Paper variant="outlined" sx={{ p: 2, maxHeight: '60vh', overflowY: 'auto' }}>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]            {Array.isArray(cfg.personalDetails?.fields) && cfg.personalDetails.fields.length ? (
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              <Table size="small">
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                <TableHead>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                  <TableRow>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    <TableCell>Label</TableCell>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    <TableCell>Type</TableCell>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    <TableCell>Required</TableCell>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                  </TableRow>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                </TableHead>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                <TableBody>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                  {cfg.personalDetails.fields.map((f, idx) => (
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    <TableRow key={idx}>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                      <TableCell>{f.label || f.name || '-'}</TableCell>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                      <TableCell>{f.type || '-'}</TableCell>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                      <TableCell>{f.required ? <Chip size="small" color="success" label="Required" /> : <Chip size="small" label="Optional" />}</TableCell>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    </TableRow>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                  ))}
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                </TableBody>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              </Table>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]            ) : (
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              <Typography color="text.secondary">No data available</Typography>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]            )}
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]          </Paper>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]        )}
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]        {tabs[effectiveIndex]?.key === 'slides' && (
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]          <Paper variant="outlined" sx={{ p: 2, maxHeight: '60vh', overflowY: 'auto' }}>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]            {(() => {
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              const toArray = (v) => Array.isArray(v) ? v : (v && typeof v === 'object' ? Object.values(v) : [])
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              const raw = [
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                ...toArray(cfg.slides || cfg.materials),
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                ...toArray(cfg.uploads),
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                ...toArray(cfg.files)
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              ]
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              const norm = raw.map((item) => {
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                if (typeof item === 'string') {
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                  const key = item
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                  const name = key.split('/').pop() || key
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                  const url = `/${key}`
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                  return { key, name, url }
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                }
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                const key = item?.key || item?.path || item?.url || ''
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                const name = item?.name || item?.title || (typeof key === 'string' ? (key.split('/').pop() || key) : 'file')
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                const url = item?.url || (item?.key ? `/${item.key}` : (typeof key === 'string' ? `/${key}` : ''))
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                const type = item?.type || item?.mime
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                return { key, name, url, type }
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              }).filter((f) => f && (f.url || f.key))
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              if (!norm.length) return <Typography color="text.secondary">No files uploaded</Typography>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              const ext = (s) => {
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                try { return String(s || '').split('?')[0].split('#')[0].split('.').pop().toLowerCase() } catch { return '' }
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              }
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              const isImage = (s, t) => ['png','jpg','jpeg','webp','gif','bmp'].includes(ext(s)) || (typeof t === 'string' && t.startsWith('image'))
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              const iconFor = (s) => {
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                const e = ext(s)
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                if (['pdf'].includes(e)) return <PictureAsPdfIcon sx={{ fontSize: 48, color: 'error.main' }} />
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                if (['ppt','pptx','key'].includes(e)) return <SlideshowIcon sx={{ fontSize: 48, color: 'warning.main' }} />
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                if (['doc','docx','txt','rtf','csv','xls','xlsx'].includes(e)) return <DescriptionIcon sx={{ fontSize: 48, color: 'info.main' }} />
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                return <InsertDriveFileIcon sx={{ fontSize: 42, color: 'text.secondary' }} />
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              }
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              const isSlidesKey = (k) => /^slides\//.test(String(k || ''))
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              const displayName = (f) => f?.name || f?.title || (isSlidesKey(f?.key) ? 'Slides' : ((f?.key || '').split('/').pop() || 'file'))
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              const openItem = async (f) => {
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                try {
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                  if (f?.key && isSlidesKey(f.key)) {
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    const e = ext(f?.name) || ext(f?.title) || ext(f?.url) || 'pptx'
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    const n = displayName(f) || 'Slides'
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    const params = new URLSearchParams({ key: f.key, name: n, ext: e })
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    window.open(`/slides-viewer?${params.toString()}`, '_blank', 'noopener,noreferrer')
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    return
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                  }
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                  if (f?.url) { window.open(f.url, '_blank', 'noopener,noreferrer'); return }
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                  if (f?.key) {
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    const { url } = await presignGet(f.key)
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    if (url) window.open(url, '_blank', 'noopener,noreferrer')
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                  }
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                } catch (_) {}
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              }
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              return (
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                <Box>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                <Grid container spacing={2}>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                  {norm.map((f, idx) => (
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    <Grid key={`${f.key || f.url || idx}-${idx}`} item xs={12} sm={6} md={4} lg={3}>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, height: '100%' }}>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                          <Box sx={{ width: 72, height: 72, borderRadius: 1, border: '1px solid', borderColor: 'divider', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 1.5 }}>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                            {isImage(f.url || f.key, f.type) ? (
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                              <Box component="img" src={f.url} alt={f.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                            ) : (
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                              iconFor(f.url || f.key)
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                            )}
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                          </Box>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                          <Box sx={{ minWidth: 0, flex: 1 }}>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                            <Typography variant="subtitle2" noWrap title={displayName(f)}>{displayName(f)}</Typography>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                              <Button size="small" variant="outlined" onClick={()=> openItem(f)}>Open</Button>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                            </Stack>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                          </Box>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                        </Box>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                      </Paper>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    </Grid>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                  ))}
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                </Grid>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                <List>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                  {norm.map((f, idx) => {
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    const url = f?.url || ''
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    const type = f?.type || ext(f?.name) || ext(url) || (f?.key ? ext(f.key) : '-')
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    const title = displayName(f)
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    return (
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                      <ListItem key={idx} secondaryAction={<Button size="small" onClick={()=> openItem(f)}>Open</Button>}>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                        <ListItemText primary={title} secondary={`Type: ${type}${(url || f?.key) ? ' • link' : ''}`} />
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                      </ListItem>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    )
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                  })}
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                </List>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                </Box>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              )
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]            })()}
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]          </Paper>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]        )}
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]        {tabs[effectiveIndex]?.key === 'questions' && (
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]          <Paper variant="outlined" sx={{ p: 2, maxHeight: '60vh', overflowY: 'auto' }}>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]            {Array.isArray(cfg.questions) && cfg.questions.length ? (
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              <Table size="small">
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                <TableHead>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                  <TableRow>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    <TableCell>Question</TableCell>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    <TableCell>Type</TableCell>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    <TableCell>Correct Answer(s)</TableCell>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                  </TableRow>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                </TableHead>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                <TableBody>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                  {cfg.questions.map((q, idx) => {
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    const qText = q?.text || q?.question || `Q${idx+1}`
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    const qType = q?.type || (Array.isArray(q?.options) ? 'multiple-choice' : '-')
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    const correct = q?.correct ?? q?.answer ?? q?.answers
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    let correctText = '-'
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    if (Array.isArray(correct)) correctText = correct
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    else if (typeof correct === 'object' && correct != null) correctText = [JSON.stringify(correct)]
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    else if (correct != null) correctText = [String(correct)]
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    return (
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                      <TableRow key={idx}>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                        <TableCell>{qText}</TableCell>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                        <TableCell>{qType}</TableCell>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                        <TableCell>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                          {Array.isArray(correctText)
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                            ? correctText.map((a, i) => (<Typography key={i} component="span" sx={{ fontWeight: 600, mr: 1 }}>{String(a)}</Typography>))
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                            : <Typography color="text.secondary">-</Typography>}
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                        </TableCell>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                      </TableRow>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    )
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                  })}
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                </TableBody>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              </Table>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]            ) : (
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              <Typography color="text.secondary">No data available</Typography>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]            )}
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]          </Paper>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]        )}
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]      </Box>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]    </Box>
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  )
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]}
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]export default function ReviewQueue() {
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const { user } = useAuthStore()
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const [tab, setTab] = useState(0)
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const [subs, setSubs] = useState([])
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const [allSubs, setAllSubs] = useState([])
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const [historyFilter, setHistoryFilter] = useState('all') // all | pending | approved | declined
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const [projReviews, setProjReviews] = useState([])
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const [projects, setProjects] = useState([])
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const [team, setTeam] = useState([])
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const [teamLoading, setTeamLoading] = useState(false)
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const [teamQueried, setTeamQueried] = useState(false)
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const [viewOpen, setViewOpen] = useState(false)
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const [viewTitle, setViewTitle] = useState('')
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const [viewJson, setViewJson] = useState(null)
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const [declineOpen, setDeclineOpen] = useState(false)
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const [declineId, setDeclineId] = useState(null)
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const [declineKind, setDeclineKind] = useState('submission')
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const [declineReason, setDeclineReason] = useState('Not adequate')
 
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const [viewUploadUrls, setViewUploadUrls] = useState({}) // { [key:string]: url }
