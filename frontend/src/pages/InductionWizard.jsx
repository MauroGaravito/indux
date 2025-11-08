import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Box, Button, Card, CardContent, Chip, Grid, LinearProgress, Paper, Stack, Step, StepLabel, Stepper, TextField, Typography, FormControl, FormLabel, RadioGroup, Radio, FormControlLabel, Select, MenuItem, Collapse } from '@mui/material'
import SignaturePad from '../components/SignaturePad.jsx'
import { useWizardStore } from '../store/wizard.js'
import { useAuthStore } from '../store/auth.js'
import api from '../utils/api.js'
import { uploadFile, presignGet } from '../utils/upload.js'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import AsyncButton from '../components/AsyncButton.jsx'

function DynamicField({ field, value, onChange }) {
  const [progress, setProgress] = React.useState(null)
  if (field.key === 'medicalIssues') {
    return <MedicalField label={field.label || 'Medical Condition'} value={value} onChange={onChange} />
  }
  if (field.type === 'textarea') {
    return <TextField fullWidth multiline minRows={3} label={field.label} value={value||''} onChange={e=> onChange(e.target.value)} />
  }
  if (field.type === 'date') {
    return <TextField fullWidth type="date" label={field.label} InputLabelProps={{ shrink: true }} value={value||''} onChange={e=> onChange(e.target.value)} />
  }
  if (field.type === 'select' && Array.isArray(field.options)) {
    return (
      <TextField fullWidth select label={field.label} value={value||''} onChange={e=> onChange(e.target.value)} SelectProps={{ native: true }}>
        {field.options.map((opt,i)=> <option key={i} value={opt}>{opt}</option>)}
      </TextField>
    )
  }
  if (field.type === 'image') {
    return (
      <Stack spacing={1}>
        <Typography variant="body2">{field.label}</Typography>
        <Button variant="outlined" component="label">Upload Image
          <input hidden type="file" accept="image/*" onChange={async (e)=>{
            const file = e.target.files?.[0]; if (!file) return;
            const { key } = await uploadFile('worker-uploads/', file, { onProgress: setProgress })
            onChange(key)
            setProgress(null)
          }} />
        </Button>
        {progress!=null && <LinearProgress variant="determinate" value={progress} />}
        {value && <Chip label={`Uploaded: ${value}`} size="small" />}
      </Stack>
    )
  }
  if (field.type === 'camera') {
    return <CameraCapture label={field.label} value={value} onChange={onChange} />
  }
  return <TextField fullWidth label={field.label} value={value||''} onChange={e=> onChange(e.target.value)} />
}

function MedicalField({ label, value, onChange }) {
  const v = value || { hasCondition: false, description: '' }
  const has = !!v.hasCondition
  const handleSelect = (evt) => {
    const next = evt.target.value === 'yes'
    onChange({ hasCondition: next, description: next ? (v.description || '') : '' })
  }
  return (
    <FormControl fullWidth>
      <FormLabel sx={{ mb: 1 }}>{label || 'Has any medical condition?'}</FormLabel>
      <Select value={has ? 'yes' : 'no'} onChange={handleSelect} size="small">
        <MenuItem value="no">No</MenuItem>
        <MenuItem value="yes">Yes</MenuItem>
      </Select>
      <Collapse in={has} timeout="auto" unmountOnExit>
        <TextField
          sx={{ mt: 1 }}
          fullWidth
          multiline
          minRows={2}
          label="Describe the condition"
          value={v.description || ''}
          onChange={(e)=> onChange({ hasCondition: true, description: e.target.value })}
        />
      </Collapse>
    </FormControl>
  )
}

function CameraCapture({ label, value, onChange }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [streaming, setStreaming] = useState(false)
  const [progress, setProgress] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [previewBlob, setPreviewBlob] = useState(null)

  // Cleanup media stream on unmount
  useEffect(() => {
    return () => {
      try {
        const v = videoRef.current
        if (v && v.srcObject) {
          const s = v.srcObject
          // @ts-ignore
          s && s.getTracks && s.getTracks().forEach(t => t.stop())
          // @ts-ignore
          v.srcObject = null
        }
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop())
          streamRef.current = null
        }
      } catch {}
    }
  }, [])

  // When streaming state turns true and we have a stream, attach it to the video element
  useEffect(() => {
    if (!streaming) return
    const v = videoRef.current
    const s = streamRef.current
    if (v && s) {
      // @ts-ignore
      v.srcObject = s
      v.play().catch(() => {})
    }
  }, [streaming])

  const start = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true })
      streamRef.current = s
      setStreaming(true)
      setPreviewUrl('')
      setPreviewBlob(null)
    } catch (e) {
      setStreaming(false)
    }
  }
  const capture = async () => {
    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth; canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d'); ctx.drawImage(video, 0, 0)
    const blob = await new Promise(res=> canvas.toBlob(res, 'image/png'))
    const url = canvas.toDataURL('image/png')
    setPreviewBlob(blob)
    setPreviewUrl(url)
  }
  const stop = () => {
    try {
      const v = videoRef.current
      // @ts-ignore
      const current = v?.srcObject
      if (current && current.getTracks) current.getTracks().forEach(t => t.stop())
      if (v) {
        // @ts-ignore
        v.srcObject = null
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
        streamRef.current = null
      }
    } finally {
      setStreaming(false)
    }
  }
  const retake = () => {
    setPreviewBlob(null)
    setPreviewUrl('')
  }
  const cancel = () => {
    // Do not change existing value; just close everything
    setPreviewBlob(null)
    setPreviewUrl('')
    setProgress(null)
    stop()
  }
  const accept = async () => {
    if (!previewBlob) return
    const { key } = await uploadFile('worker-uploads/', previewBlob, { onProgress: setProgress })
    onChange(key)
    setProgress(null)
    setPreviewBlob(null)
    setPreviewUrl('')
    stop()
  }
  return (
    <Stack spacing={1}>
      <Typography variant="body2">{label}</Typography>
      {!streaming && (
        <Button variant="outlined" onClick={start}>Open Camera</Button>
      )}
      {streaming && !previewUrl && (
        <Stack spacing={1}>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', maxWidth: 480, borderRadius: 8, background: '#000' }}
            />
          </Box>
          <Stack direction="row" spacing={1} justifyContent="center">
            <Button variant="outlined" onClick={capture}>Capture</Button>
            <Button onClick={cancel}>Cancel</Button>
          </Stack>
        </Stack>
      )}
      {streaming && !!previewUrl && (
        <Stack spacing={1}>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box component="img" src={previewUrl} alt="Preview" sx={{ width: '100%', maxWidth: 480, borderRadius: 1, border: '1px solid', borderColor: 'divider' }} />
          </Box>
          <Stack direction="row" spacing={1} justifyContent="center">
            <Button onClick={retake}>Retake</Button>
            <Button onClick={cancel}>Cancel</Button>
            <Button variant="contained" onClick={accept} disabled={progress!=null}>Accept</Button>
          </Stack>
          {progress!=null && <LinearProgress variant="determinate" value={progress} />}
        </Stack>
      )}
      {value && <Chip label={`Captured: ${value}`} size="small" />}
    </Stack>
  )
}

export default function InductionWizard() {
  const { user } = useAuthStore()
  const [projects, setProjects] = useState([])
  const [project, setProject] = useState(null)
  const [step, setStep] = useState(0)
  const [personalValues, setPersonalValues] = useState({})
  const [answers, setAnswers] = useState([])
  const [score, setScore] = useState(null)
  const [passed, setPassed] = useState(null)
  const [signature, setSignature] = useState(null)
  const [status, setStatus] = useState('idle')

  useEffect(() => { api.get('/projects').then(r => setProjects(r.data || [])) }, [])

  const defaultPersonalFields = useMemo(() => ([
    { key: 'name', label: 'Name', type: 'text', required: false, builtin: true },
    { key: 'dob', label: 'Date of Birth', type: 'date', required: false, builtin: true },
    { key: 'address', label: 'Address', type: 'text', required: false, builtin: true },
    { key: 'phone', label: 'Phone', type: 'text', required: false, builtin: true },
    { key: 'medicalIssues', label: 'Medical Issues', type: 'textarea', required: false, builtin: true },
    { key: 'nextOfKin', label: 'Next of Kin', type: 'text', required: false, builtin: true },
    { key: 'nextOfKinPhone', label: 'Next of Kin Phone', type: 'text', required: false, builtin: true },
    { key: 'isIndigenous', label: 'Is Indigenous', type: 'select', options: ['Yes','No','Prefer not to say'], required: false, builtin: true },
    { key: 'isApprentice', label: 'Is Apprentice', type: 'select', options: ['Yes','No'], required: false, builtin: true }
  ]), [])
  const personalFields = useMemo(() => {
    const cfg = project?.config?.personalDetails?.fields
    return Array.isArray(cfg) && cfg.length ? cfg : defaultPersonalFields
  }, [project, defaultPersonalFields])
  const questions = useMemo(() => project?.config?.questions || [], [project])
  const totalQ = questions.length
  const answeredCount = React.useMemo(() => answers.filter(a => a !== undefined && a !== null).length, [answers])
  const canFinish = totalQ > 0 && answeredCount === totalQ

  const validatePersonal = () => personalFields.every(f => {
    if (!f.required) return true
    if (f.key === 'medicalIssues') {
      const m = personalValues.medical
      if (!m) return false
      if (m.hasCondition === false) return true
      return typeof m.description === 'string' && m.description.trim().length > 0
    }
    const val = personalValues[f.key]
    return val != null && val !== ''
  })
  const nextStep = () => setStep(s => s + 1)
  const prevStep = () => setStep(s => Math.max(0, s - 1))
  // Only select project here; advance with an explicit Continue
  const selectProject = (id) => {
    const p = projects.find(x => x._id === id)
    setProject(p || null)
    // Reset dependent state when project changes
    setPersonalValues({})
    setAnswers([])
    setScore(null)
    setPassed(null)
    setSignature(null)
  }
  const finishQuiz = () => {
    const correct = answers.reduce((acc, a, i) => acc + (a === questions[i]?.correctIndex ? 1 : 0), 0)
    const pct = Math.round((correct / (totalQ || 1)) * 100)
    const passMark = project?.config?.passMark ?? Math.ceil((totalQ || 1) * 0.6)
    setScore(pct)
    setPassed(correct >= (typeof passMark === 'number' && passMark <= totalQ ? passMark : Math.ceil((totalQ || 1) * 0.6)))
    nextStep()
  }
  const submit = async () => {
    try {
      setStatus('submitting')
      const uploadFields = personalFields.filter(f => ['image','camera'].includes(f.type))
      // Map image/camera fields to uploaded object keys (if present)
      const uploads = uploadFields
        .map(f => ({ type: f.type, key: personalValues[f.key] }))
        .filter(u => typeof u.key === 'string' && u.key.length > 0)
      const body = {
        projectId: project?._id,
        personal: personalValues,
        uploads,
        quiz: { total: totalQ, correct: Math.round(((score||0) / 100) * (totalQ||0)), answers },
        signatureDataUrl: signature || undefined
      }
      await api.post('/submissions', body)
      setStatus('done')
    } catch (e) {
      setStatus('error')
    }
  }

  if (!user) return <Alert severity="info">Please log in as a worker to complete induction.</Alert>
  if (user.role !== 'worker') return <Alert severity="warning">Switch to a worker account to submit an induction.</Alert>

  return (
    <Stack spacing={3}>
      <Typography variant="h5">Induction Wizard</Typography>
      <Stepper activeStep={step} alternativeLabel>
        {['Project','Personal','Slides','Test','Sign','Submit'].map((label)=>(<Step key={label}><StepLabel>{label}</StepLabel></Step>))}
      </Stepper>

      {step===0 && (
        <Paper sx={{ p:2 }}>
          <Typography variant="subtitle1">Select Project</Typography>
          <TextField fullWidth select SelectProps={{ native: true }} value={project?._id || ''} onChange={(e)=> selectProject(e.target.value)} sx={{ mt: 1 }}>
            <option value="">Choose a project</option>
            {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </TextField>
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button variant="contained" onClick={nextStep} disabled={!project}>Continue</Button>
          </Stack>
        </Paper>
      )}

      {step===1 && project && (
        <Paper sx={{ p:2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Personal Details</Typography>
          <Grid container spacing={2}>
            {personalFields.map((f)=> (
              <Grid item xs={12} sm={f.type==='textarea'?12:6} key={f.key}>
                <DynamicField
                  field={f}
                  value={f.key==='medicalIssues' ? personalValues.medical : personalValues[f.key]}
                  onChange={(val)=> setPersonalValues({ ...personalValues, ...(f.key==='medicalIssues' ? { medical: val } : { [f.key]: val }) })}
                />
              </Grid>
            ))}
          </Grid>
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button onClick={prevStep}>Back</Button>
            <Button variant="contained" onClick={()=> validatePersonal() ? nextStep() : null} disabled={!validatePersonal()}>Continue</Button>
          </Stack>
        </Paper>
      )}

      {step===2 && project && (
        <SlidesStep project={project} onBack={prevStep} onNext={nextStep} />
      )}

      {step===3 && project && (
        <Paper sx={{ p:2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Test</Typography>
          {!questions.length && <Alert severity="info">No questions configured.</Alert>}
          {questions.length > 0 && (
            <Stack spacing={1} sx={{ mb: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="body2" color="text.secondary">{answeredCount}/{totalQ} answered</Typography>
              </Stack>
              <LinearProgress variant="determinate" value={(answeredCount/totalQ)*100} />
            </Stack>
          )}
          <Stack spacing={2}>
            {questions.map((q, qi) => (
              <Card key={qi} variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Q{qi+1}. {q.questionText}</Typography>
                  <FormControl component="fieldset" fullWidth>
                    <RadioGroup
                      name={`q-${qi}`}
                      value={typeof answers[qi] === 'number' ? String(answers[qi]) : ''}
                      onChange={(e)=> {
                        const ai = parseInt(e.target.value, 10)
                        setAnswers(prev=> { const n=[...prev]; n[qi]=ai; return n })
                      }}
                    >
                      {q.answers.map((a, ai) => (
                        <FormControlLabel
                          key={ai}
                          value={String(ai)}
                          control={<Radio />}
                          label={a}
                          sx={{ my: 0.25 }}
                        />
                      ))}
                    </RadioGroup>
                  </FormControl>
                </CardContent>
              </Card>
            ))}
          </Stack>
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button onClick={prevStep}>Back</Button>
            <Button variant="contained" onClick={finishQuiz} disabled={!canFinish}>Finish Test</Button>
          </Stack>
        </Paper>
      )}

      {step===4 && (
        <Paper sx={{ p:2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Signature</Typography>
          <SignaturePad value={signature} onChange={setSignature} height={200} />
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button onClick={prevStep}>Back</Button>
            <Button variant="contained" onClick={nextStep} disabled={!signature}>Continue</Button>
          </Stack>
        </Paper>
      )}

      {step===5 && (
        <Paper sx={{ p:2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Review & Submit</Typography>
          {score != null && (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="body2">Score:</Typography>
              <Chip label={`${score}%`} color={passed? 'success':'error'} />
            </Stack>
          )}
          {status==='submitting' && <LinearProgress sx={{ my: 1 }} />}
          <Stack direction="row" spacing={1}>
            <Button onClick={prevStep}>Back</Button>
            <AsyncButton variant="contained" onClick={submit} disabled={status==='submitting'}>Submit</AsyncButton>
          </Stack>
          {status==='done' && <Alert severity="success" sx={{ mt: 2 }}>Submission sent! A manager will review it.</Alert>}
          {status==='error' && <Alert severity="error" sx={{ mt: 2 }}>Error submitting. Try again.</Alert>}
        </Paper>
      )}
    </Stack>
  )
}

function SlidesStep({ project, onBack, onNext }) {
  const slides = project?.config?.slides || {}
  const pptKey = slides.pptKey
  const thumbKey = slides.thumbKey
  const [thumbUrl, setThumbUrl] = React.useState('')
  const [totalSlides, setTotalSlides] = React.useState(1)
  const [slideIndex, setSlideIndex] = React.useState(1) // 1-based
  const [viewerOpen, setViewerOpen] = React.useState(false)
  const [blocked, setBlocked] = React.useState(true)
  const [countdown, setCountdown] = React.useState(5)
  const [viewedMap, setViewedMap] = React.useState({}) // { [index:number]: true }
  const timerRef = React.useRef(null)
  const name = `${project?.name || 'Slides'}`

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      if (!thumbKey) { setThumbUrl(''); return }
      try { const { url } = await presignGet(thumbKey); if (!cancelled) setThumbUrl(url) } catch { if (!cancelled) setThumbUrl('') }
    }
    load()
    return () => { cancelled = true }
  }, [thumbKey])

  const openViewer = () => {
    if (!pptKey) return
    setViewerOpen(true)
    // Start timer if this slide is not yet viewed
    if (!viewedMap[slideIndex]) {
      startTimer()
    } else {
      setBlocked(false)
      setCountdown(0)
    }
  }

  const closeViewer = () => {
    setViewerOpen(false)
    // If timer is running and slide not marked as viewed, keep blocked state
    clearTimer()
    if (!viewedMap[slideIndex]) {
      setBlocked(true)
    }
  }

  function clearTimer() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }

  function startTimer() {
    clearTimer()
    setBlocked(true)
    setCountdown(5)
    let secs = 5
    timerRef.current = setInterval(() => {
      secs -= 1
      setCountdown(secs)
      if (secs <= 0) {
        clearTimer()
        setBlocked(false)
        setViewedMap((m) => ({ ...m, [slideIndex]: true }))
      }
    }, 1000)
  }

  // Try to detect slide count for PDFs; default to 1 otherwise
  React.useEffect(() => {
    let cancelled = false
    async function detectSlides() {
      setTotalSlides(1)
      setSlideIndex(1)
      setViewedMap({})
      setViewerOpen(false)
      setBlocked(true)
      setCountdown(5)
      if (!pptKey) return
      const ext = (pptKey.split('.').pop() || 'pptx').toLowerCase()
      if (ext !== 'pdf') return
      try {
        const { url } = await presignGet(pptKey)
        // Lazy load pdf.js if not present
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
        const pdf = await window.pdfjsLib.getDocument(url).promise
        if (!cancelled) setTotalSlides(Math.max(1, pdf.numPages || 1))
      } catch {
        // ignore failures; keep default 1
      }
    }
    detectSlides()
    return () => { cancelled = true }
  }, [pptKey])

  // On slide change, reset viewer state and blocking unless already viewed
  React.useEffect(() => {
    clearTimer()
    setViewerOpen(false)
    if (viewedMap[slideIndex]) {
      setBlocked(false)
      setCountdown(0)
    } else {
      setBlocked(true)
      setCountdown(5)
    }
  }, [slideIndex])

  // Cleanup timers on unmount
  React.useEffect(() => () => clearTimer(), [])

  const nextSlide = () => {
    if (slideIndex < totalSlides) setSlideIndex(slideIndex + 1)
  }
  const prevSlide = () => {
    if (slideIndex > 1) setSlideIndex(slideIndex - 1)
  }

  return (
    <Paper sx={{ p:2 }}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>Slides</Typography>
      {pptKey ? (
        <Stack spacing={2} sx={{ mb: 1 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            {thumbUrl ? (
              <Box component="img" src={thumbUrl} alt="Slides preview" sx={{ width: 140, height: 90, borderRadius: 1, objectFit: 'cover', border: '1px solid', borderColor: 'divider', cursor: 'pointer' }} onClick={openViewer} />
            ) : (
              <Chip icon={<InsertDriveFileIcon />} label="Open Viewer" onClick={openViewer} variant="outlined" />
            )}
            <Typography variant="body2" color="text.secondary">Open the viewer to start the 5s review for each slide.</Typography>
          </Stack>
          <Stack direction="row" spacing={2} alignItems="center">
            <Chip label={`Slide ${slideIndex} of ${totalSlides}`} />
            {!viewedMap[slideIndex] && viewerOpen && (
              <Typography variant="body2" color="warning.main">Please review this slide (Next available in {countdown}s)</Typography>
            )}
            {!viewerOpen && !viewedMap[slideIndex] && (
              <Typography variant="body2" color="text.secondary">Open the viewer to start the 5s review</Typography>
            )}
            {viewedMap[slideIndex] && (
              <Typography variant="body2" color="success.main">You can go next</Typography>
            )}
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button onClick={prevSlide} disabled={slideIndex===1}>Previous</Button>
            <Button variant="outlined" onClick={nextSlide} disabled={!viewedMap[slideIndex] || slideIndex===totalSlides}>Next Slide</Button>
          </Stack>
        </Stack>
      ) : (
        <Typography variant="body2">No slides configured.</Typography>
      )}
      <Stack direction="row" spacing={1}>
        <Button onClick={onBack}>Back</Button>
        <Button variant="contained" onClick={onNext} disabled={!pptKey ? false : !(slideIndex===totalSlides && viewedMap[slideIndex])}>Continue</Button>
      </Stack>

      {/* Embedded Viewer Modal */}
      <Dialog open={viewerOpen} onClose={closeViewer} maxWidth="lg" fullWidth>
        <DialogTitle>{name} — Slide {slideIndex}/{totalSlides}</DialogTitle>
        <DialogContent dividers>
          {pptKey ? (
            <Box sx={{ position: 'relative', pt: '56.25%' }}>
              <Box component="iframe"
                   src={`/slides-viewer?${new URLSearchParams({ key: pptKey, name, ext: (pptKey.split('.').pop()||'pptx').toLowerCase() }).toString()}`}
                   title="Slides Viewer"
                   sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
              />
            </Box>
          ) : (
            <Typography variant="body2">No slides available.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeViewer}>Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}
