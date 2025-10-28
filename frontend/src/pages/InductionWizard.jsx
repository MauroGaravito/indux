import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Box, Button, Card, CardContent, Chip, Grid, LinearProgress, Paper, Stack, Step, StepLabel, Stepper, TextField, Typography } from '@mui/material'
import SignaturePad from '../components/SignaturePad.jsx'
import { useWizardStore } from '../store/wizard.js'
import { useAuthStore } from '../store/auth.js'
import api from '../utils/api.js'
import { uploadFile, presignGet } from '../utils/upload.js'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import AsyncButton from '../components/AsyncButton.jsx'

function DynamicField({ field, value, onChange }) {
  const [progress, setProgress] = React.useState(null)
  if (field.type === 'textarea') {
    return <TextField fullWidth multiline minRows={3} label={field.label} value={value||''} onChange={e=> onChange(e.target.value)} />
  }
  if (field.type === 'date') {
    return <TextField fullWidth type="date" label={field.label} InputLabelProps={{ shrink: true }} value={value||''} onChange={e=> onChange(e.target.value)} />
  }
  if (field.type === 'select' && Array.isArray(field.options)) {
    return (
      <TextField fullWidth select label={field.label} value={value||''} onChange={e=> onChange(e.target.value)}>
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

function CameraCapture({ label, value, onChange }) {
  const videoRef = useRef(null)
  const [streaming, setStreaming] = useState(false)
  const [progress, setProgress] = useState(null)
  const start = async () => {
    const s = await navigator.mediaDevices.getUserMedia({ video: true })
    videoRef.current.srcObject = s
    await videoRef.current.play()
    setStreaming(true)
  }
  const capture = async () => {
    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth; canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d'); ctx.drawImage(video, 0, 0)
    const blob = await new Promise(res=> canvas.toBlob(res, 'image/png'))
    const { key } = await uploadFile('worker-uploads/', blob, { onProgress: setProgress })
    onChange(key)
    setProgress(null)
  }
  const stop = () => {
    const s = videoRef.current?.srcObject; if (s) s.getTracks().forEach(t=> t.stop()); setStreaming(false)
  }
  return (
    <Stack spacing={1}>
      <Typography variant="body2">{label}</Typography>
      {!streaming ? <Button variant="outlined" onClick={start}>Open Camera</Button> : (
        <Stack spacing={1}>
          <video ref={videoRef} style={{ maxWidth: '100%', borderRadius: 8 }} />
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={capture}>Capture</Button>
            <Button onClick={stop}>Close</Button>
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

  const personalFields = useMemo(() => project?.config?.personalDetails?.fields || [], [project])
  const questions = useMemo(() => project?.config?.questions || [], [project])
  const totalQ = questions.length

  const validatePersonal = () => personalFields.every(f => !f.required || (personalValues[f.key] != null && personalValues[f.key] !== ''))
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
      const uploads = uploadFields.map(f => ({ type: f.type, docId: undefined }))
      const body = {
        projectId: project?._id,
        personal: personalValues,
        uploads,
        quiz: { total: totalQ, correct: Math.round(((score||0) / 100) * (totalQ||0)) },
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
                <DynamicField field={f} value={personalValues[f.key]} onChange={(val)=> setPersonalValues({ ...personalValues, [f.key]: val })} />
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
          <Stack spacing={2}>
            {questions.map((q, qi) => (
              <Card key={qi} variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Q{qi+1}. {q.questionText}</Typography>
                  <Stack>
                    {q.answers.map((a, ai) => (
                      <Button key={ai} variant={answers[qi]===ai? 'contained':'outlined'} onClick={()=> setAnswers(prev=> { const n=[...prev]; n[qi]=ai; return n })} sx={{ justifyContent:'flex-start', mb: 1 }}>{a}</Button>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button onClick={prevStep}>Back</Button>
            <Button variant="contained" onClick={finishQuiz}>Finish Test</Button>
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
    const ext = (pptKey.split('.').pop() || 'pptx').toLowerCase()
    const params = new URLSearchParams({ key: pptKey, name, ext })
    window.open(`/slides-viewer?${params.toString()}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <Paper sx={{ p:2 }}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>Slides</Typography>
      {pptKey ? (
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
          {thumbUrl ? (
            <Box component="img" src={thumbUrl} alt="Slides preview" sx={{ width: 140, height: 90, borderRadius: 1, objectFit: 'cover', border: '1px solid', borderColor: 'divider', cursor: 'pointer' }} onClick={openViewer} />
          ) : (
            <Chip icon={<InsertDriveFileIcon />} label="Open Viewer" onClick={openViewer} variant="outlined" />
          )}
          <Typography variant="body2" color="text.secondary">Your slides are ready. Open the viewer to proceed.</Typography>
        </Stack>
      ) : (
        <Typography variant="body2">No slides configured.</Typography>
      )}
      <Stack direction="row" spacing={1}>
        <Button onClick={onBack}>Back</Button>
        <Button variant="contained" onClick={onNext}>Continue</Button>
      </Stack>
    </Paper>
  )
}
