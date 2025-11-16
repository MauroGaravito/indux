import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  Select,
  MenuItem,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch
} from '@mui/material'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'

import SignaturePad from '../components/forms/SignaturePad.jsx'
import { useAuthStore } from '../context/authStore.js'
import api from '../utils/api.js'
import { uploadFile, presignGet } from '../utils/upload.js'
import AsyncButton from '../components/common/AsyncButton.jsx'

const deriveFieldKey = (field, index) => {
  if (field?.label) return field.label
  if (field?.key) return field.key
  if (field?._id) return field._id
  return `field-${index}`
}

// =========================================================
// DynamicField: renderiza campos del bloque Personal Details
// Incluye: textarea, date, select, image upload, camera y medicalIssues
// =========================================================
function DynamicField({ field, value, onChange }) {
  const [progress, setProgress] = useState(null)

  if (field?.key === 'medicalIssues') {
    return (
      <MedicalField label={field.label || 'Medical Condition'} value={value} onChange={onChange} />
    )
  }

  if (field?.type === 'textarea') {
    return (
      <TextField
        fullWidth
        multiline
        minRows={3}
        label={field.label}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      />
    )
  }

  if (field?.type === 'date') {
    return (
      <TextField
        fullWidth
        type="date"
        label={field.label}
        InputLabelProps={{ shrink: true }}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      />
    )
  }

  if (field?.type === 'number') {
    return (
      <TextField
        fullWidth
        type="number"
        label={field.label}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      />
    )
  }

  if (field?.type === 'select' && Array.isArray(field.options)) {
    return (
      <TextField
        fullWidth
        select
        label={field.label}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        SelectProps={{ native: true }}
      >
        {field.options.map((opt, i) => (
          <option key={i} value={opt}>
            {opt}
          </option>
        ))}
      </TextField>
    )
  }

  if (field?.type === 'boolean') {
    return (
      <FormControlLabel
        control={
          <Switch
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
          />
        }
        label={field.label}
      />
    )
  }

  if (field?.type === 'image') {
    return (
      <Stack spacing={1}>
        <Typography variant="body2">{field.label}</Typography>
        <Button variant="outlined" component="label">
          Upload Image
          <input
            hidden
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (!file) return
              const { key } = await uploadFile('worker-uploads/', file, { onProgress: setProgress })
              onChange(key)
              setProgress(null)
            }}
          />
        </Button>
        {progress != null && <LinearProgress variant="determinate" value={progress} />}
        {value && <Chip label={`Uploaded: ${value}`} size="small" />}
      </Stack>
    )
  }

  if (field?.type === 'camera') {
    return <CameraCapture label={field.label} value={value} onChange={onChange} />
  }

  return (
    <TextField
      fullWidth
      label={field?.label || 'Field'}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

// =========================================================
// MedicalField: Yes/No + descripción condicional
// Guarda en objeto: { hasCondition: boolean, description: string }
// =========================================================
function MedicalField({ label, value, onChange }) {
  const v = value || { hasCondition: false, description: '' }
  const has = !!v.hasCondition

  const handleSelect = (evt) => {
    const next = evt.target.value === 'yes'
    onChange({ hasCondition: next, description: next ? v.description || '' : '' })
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
          onChange={(e) => onChange({ hasCondition: true, description: e.target.value })}
        />
      </Collapse>
    </FormControl>
  )
}

// =========================================================
// CameraCapture: usa getUserMedia, captura, previsualiza y sube
// =========================================================
function CameraCapture({ label, value, onChange }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [streaming, setStreaming] = useState(false)
  const [progress, setProgress] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [previewBlob, setPreviewBlob] = useState(null)

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      try {
        const v = videoRef.current
        if (v && v.srcObject) {
          const s = v.srcObject
          // @ts-ignore
          s && s.getTracks && s.getTracks().forEach((t) => t.stop())
          // @ts-ignore
          v.srcObject = null
        }
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop())
          streamRef.current = null
        }
      } catch {}
    }
  }, [])

  // Adjunta el stream cuando está listo
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
    } catch {
      setStreaming(false)
    }
  }

  const capture = async () => {
    const video = videoRef.current
    if (!video) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0)
    const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'))
    const url = canvas.toDataURL('image/png')
    setPreviewBlob(blob)
    setPreviewUrl(url)
  }

  const stop = () => {
    try {
      const v = videoRef.current
      // @ts-ignore
      const current = v?.srcObject
      if (current && current.getTracks) current.getTracks().forEach((t) => t.stop())
      if (v) {
        // @ts-ignore
        v.srcObject = null
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
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
        <Button variant="outlined" onClick={start}>
          Open Camera
        </Button>
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
            <Button variant="outlined" onClick={capture}>
              Capture
            </Button>
            <Button onClick={cancel}>Cancel</Button>
          </Stack>
        </Stack>
      )}

      {streaming && !!previewUrl && (
        <Stack spacing={1}>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box
              component="img"
              src={previewUrl}
              alt="Preview"
              sx={{ width: '100%', maxWidth: 480, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
            />
          </Box>
          <Stack direction="row" spacing={1} justifyContent="center">
            <Button onClick={retake}>Retake</Button>
            <Button onClick={cancel}>Cancel</Button>
            <Button variant="contained" onClick={accept} disabled={progress != null}>
              Accept
            </Button>
          </Stack>
          {progress != null && <LinearProgress variant="determinate" value={progress} />}
        </Stack>
      )}

      {value && <Chip label={`Captured: ${value}`} size="small" />}
    </Stack>
  )
}

// =========================================================
// Componente principal: InductionWizard
// Flujo: Project → Personal → Slides → Test → Sign → Submit
// =========================================================
export default function InductionWizard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [projects, setProjects] = useState([])
  const [project, setProject] = useState(null)
  const [projectLoading, setProjectLoading] = useState(false)
  const [step, setStep] = useState(0)

  const [personalValues, setPersonalValues] = useState({})
  const [mySubmissions, setMySubmissions] = useState([])
  const [mySubsLoading, setMySubsLoading] = useState(false)
  const [answers, setAnswers] = useState([])
  const [score, setScore] = useState(null)
  const [passed, setPassed] = useState(null)
  const [signature, setSignature] = useState(null)

  const [status, setStatus] = useState('idle') // idle | submitting | done | error
  const [confirmOpen, setConfirmOpen] = useState(false)

  const personalFields = useMemo(() => {
    if (!project) return []
    const base = Array.isArray(project?.config?.personalDetails?.fields) ? project.config.personalDetails.fields : []
    const extra = Array.isArray(project?.config?.extraFields) ? project.config.extraFields : []
    return [...base, ...extra].map((field, idx) => ({
      ...field,
      type: field?.type || 'text',
      __key: deriveFieldKey(field, idx)
    }))
  }, [project])

  const questions = useMemo(() => project?.config?.questions || [], [project])
  const totalQ = questions.length
  const answeredCount = useMemo(() => answers.filter((a) => a !== undefined && a !== null).length, [answers])
  const canFinish = totalQ > 0 && answeredCount === totalQ
  const currentSubmission = useMemo(() => {
    if (!project) return null
    const targetId = project?._id
    if (!targetId) return null
    return mySubmissions.find((submission) => {
      const pid = typeof submission?.projectId === 'string'
        ? submission.projectId
        : submission?.projectId?._id
      return pid && pid === targetId
    }) || null
  }, [project, mySubmissions])
  const currentStatus = currentSubmission?.status || null
  const canStartSubmission = !currentStatus || currentStatus === 'declined'
  const statusInfo = currentStatus
    ? {
        approved: {
          severity: 'success',
          message: 'This submission has already been approved. New submissions are blocked.'
        },
        pending: {
          severity: 'info',
          message: 'Your submission is under review. Please wait for a decision before resubmitting.'
        },
        declined: {
          severity: 'warning',
          message: 'Your previous submission was declined. Update your details and resubmit.'
        }
      }[currentStatus]
    : null

  useEffect(() => {
    api.get('/projects').then((r) => setProjects(r.data || [])).catch(() => setProjects([]))
  }, [])

  useEffect(() => {
    if (user?.role !== 'worker') return
    let active = true
    setMySubsLoading(true)
    api.get('/submissions')
      .then((res) => {
        if (!active) return
        setMySubmissions(Array.isArray(res.data) ? res.data : [])
      })
      .catch(() => {
        if (!active) return
        setMySubmissions([])
      })
      .finally(() => {
        if (active) setMySubsLoading(false)
      })
    return () => { active = false }
  }, [user?.role])

  useEffect(() => {
    if (step > 0 && (!project || (currentStatus && currentStatus !== 'declined'))) {
      setStep(0)
    }
  }, [step, project, currentStatus])

  useEffect(() => {
    if (!project || !personalFields.length) {
      setPersonalValues({})
      return
    }
    if (currentSubmission?.status === 'declined' && currentSubmission.personal) {
      const next = {}
      personalFields.forEach((field) => {
        const keys = [field.label, field.__key, field.key]
        for (const key of keys) {
          if (key && currentSubmission.personal[key] !== undefined) {
            next[field.__key] = currentSubmission.personal[key]
            break
          }
        }
      })
      setPersonalValues(next)
    } else {
      setPersonalValues({})
    }
  }, [project, personalFields, currentSubmission])


  const currentStatus = currentSubmission?.status || null
  const canStartSubmission = !currentStatus || currentStatus === 'declined'
  const statusInfo = currentStatus
    ? {
        approved: {
          severity: 'success',
          message: 'This submission has already been approved. New submissions are blocked.'
        },
        pending: {
          severity: 'info',
          message: 'Your submission is under review. Please wait for a decision before resubmitting.'
        },
        declined: {
          severity: 'warning',
          message: 'Your previous submission was declined. Update your details and resubmit.'
        }
      }[currentStatus]
    : null

  const validatePersonal = () => {
    if (!personalFields.length) return true
    return personalFields.every((field) => {
      if (!field.required) return true
      const val = personalValues[field.__key]
      if (field.type === 'boolean') return typeof val === 'boolean'
      if (val === undefined || val === null) return false
      if (typeof val === 'string') return val.trim() !== ''
      return true
    })
  }
  const isPersonalValid = useMemo(() => validatePersonal(), [personalFields, personalValues])

  const isPersonalValid = useMemo(() => validatePersonal(), [personalFields, personalValues])

  const nextStep = () => setStep((s) => s + 1)
  const prevStep = () => setStep((s) => Math.max(0, s - 1))

  const handlePersonalChange = (field, value) => {
    setPersonalValues((prev) => ({ ...prev, [field.__key]: value }))
  }

  const selectProject = async (id) => {
    const fallback = projects.find((x) => x._id === id) || null
    // Reset estado dependiente
    setPersonalValues({})
    setAnswers([])
    setScore(null)
    setPassed(null)
    setSignature(null)
    if (!id) {
      setProject(null)
      return
    }
    setProject(fallback)
    setProjectLoading(true)
    try {
      const res = await api.get(`/projects/${id}`)
      setProject(res.data || fallback)
    } catch {
      setProject(fallback)
    } finally {
      setProjectLoading(false)
    }
  }

  const finishQuiz = () => {
    const correct = answers.reduce((acc, a, i) => acc + (a === questions[i]?.correctIndex ? 1 : 0), 0)
    const pct = Math.round((correct / (totalQ || 1)) * 100)
    const passMark = project?.config?.passMark ?? Math.ceil((totalQ || 1) * 0.6)
    setScore(pct)
    setPassed(correct >= (typeof passMark === 'number' && passMark <= totalQ ? passMark : Math.ceil((totalQ || 1) * 0.6)))
    nextStep()
  }

  const buildPersonalPayload = () => {
    const payload = {}
    personalFields.forEach((field) => {
      const val = personalValues[field.__key]
      if (val !== undefined) {
        payload[field.label || field.__key] = val
      }
    })
    return payload
  }

  const submit = async () => {
    try {
      setStatus('submitting')

      const uploadFields = personalFields.filter((f) => ['image', 'camera', 'file'].includes(f.type))
      const uploads = uploadFields
        .map((f) => ({ type: f.type, key: personalValues[f.__key] }))
        .filter((u) => typeof u.key === 'string' && u.key.length > 0)

      const correctCount = Math.round(((score || 0) / 100) * (totalQ || 0))

      const personalPayload = buildPersonalPayload()

      const body = {
        projectId: project?._id,
        personal: personalPayload,
        uploads,
        quiz: { total: totalQ, correct: correctCount, answers },
        signatureDataUrl: signature || undefined
      }

      await api.post('/submissions', body)
      setStatus('done')

      // ✅ Redirigir y refrescar para limpiar el estado
      navigate(0)
      
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
        {['Project', 'Personal', 'Slides', 'Test', 'Sign', 'Submit'].map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Step 0: Project */}
      {step === 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1">Select Project</Typography>
          <TextField
            fullWidth
            select
            SelectProps={{ native: true }}
            value={project?._id || ''}
            onChange={(e) => selectProject(e.target.value)}
            sx={{ mt: 1 }}
          >
            <option value="">Choose a project</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </TextField>
          {mySubsLoading && <LinearProgress sx={{ mt: 2 }} />}
          {statusInfo && (
            <Alert severity={statusInfo.severity} sx={{ mt: 2 }}>
              {statusInfo.message}
            </Alert>
          )}
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button variant="contained" onClick={nextStep} disabled={!project || !canStartSubmission || projectLoading}>
              Continue
            </Button>
          </Stack>
        </Paper>
      )}

      {/* Step 1: Personal */}
      {step === 1 && project && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Personal Details
          </Typography>
          <Stack spacing={2}>
            {projectLoading && <LinearProgress />}
            {currentStatus === 'declined' && (
              <Alert severity="warning">
                {statusInfo?.message || 'Your previous submission was declined. Please review and update the information below.'}
              </Alert>
            )}
            {!projectLoading && !personalFields.length && (
              <Alert severity="info">This project has no personal detail fields configured.</Alert>
            )}
            {!!personalFields.length && !projectLoading && (
                <Grid container spacing={2}>
                  {personalFields.map((field) => (
                    <Grid item xs={12} sm={field.type === 'textarea' ? 12 : 6} key={field.__key}>
                      <Stack spacing={0.5}>
                        <DynamicField
                          field={{ ...field, key: field.__key }}
                          value={personalValues[field.__key]}
                          onChange={(val) => handlePersonalChange(field, val)}
                        />
                        {field?.description && field.type !== 'boolean' && (
                          <Typography variant="caption" color="text.secondary">{field.description}</Typography>
                        )}
                      </Stack>
                    </Grid>
                  ))}
                </Grid>
            )}
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Button onClick={prevStep}>Back</Button>
              <Button variant="contained" onClick={nextStep} disabled={!isPersonalValid || projectLoading}>
                Continue
              </Button>
            </Stack>
          </Stack>
        </Paper>
      )}

      {/* Step 2: Slides */}
      {step === 2 && project && <SlidesStep project={project} onBack={prevStep} onNext={nextStep} />}

      {/* Step 3: Test */}
      {step === 3 && project && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Test
          </Typography>
          {!questions.length && <Alert severity="info">No questions configured.</Alert>}

          {questions.length > 0 && (
            <Stack spacing={1} sx={{ mb: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  {answeredCount}/{totalQ} answered
                </Typography>
              </Stack>
              <LinearProgress variant="determinate" value={(answeredCount / totalQ) * 100} />
            </Stack>
          )}

          <Stack spacing={2}>
            {questions.map((q, qi) => (
              <Card key={qi} variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                    Q{qi + 1}. {q.questionText}
                  </Typography>
                  <FormControl component="fieldset" fullWidth>
                    <RadioGroup
                      name={`q-${qi}`}
                      value={typeof answers[qi] === 'number' ? String(answers[qi]) : ''}
                      onChange={(e) => {
                        const ai = parseInt(e.target.value, 10)
                        setAnswers((prev) => {
                          const n = [...prev]
                          n[qi] = ai
                          return n
                        })
                      }}
                    >
                      {q.answers.map((a, ai) => (
                        <FormControlLabel key={ai} value={String(ai)} control={<Radio />} label={a} sx={{ my: 0.25 }} />
                      ))}
                    </RadioGroup>
                  </FormControl>
                </CardContent>
              </Card>
            ))}
          </Stack>

          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button onClick={prevStep}>Back</Button>
            <Button variant="contained" onClick={finishQuiz} disabled={!canFinish}>
              Finish Test
            </Button>
          </Stack>
        </Paper>
      )}

      {/* Step 4: Signature */}
      {step === 4 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Signature
          </Typography>
          <SignaturePad value={signature} onChange={setSignature} height={200} />
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button onClick={prevStep}>Back</Button>
            <Button variant="contained" onClick={nextStep} disabled={!signature}>
              Continue
            </Button>
          </Stack>
        </Paper>
      )}

      {/* Step 5: Submit */}
      {step === 5 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Review & Submit
          </Typography>

          {score != null && (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="body2">Score:</Typography>
              <Chip label={`${score}%`} color={passed ? 'success' : 'error'} />
            </Stack>
          )}

          {status === 'submitting' && <LinearProgress sx={{ my: 1 }} />}

          <Stack direction="row" spacing={1}>
            <Button onClick={prevStep}>Back</Button>
            <Button variant="contained" onClick={() => setConfirmOpen(true)} disabled={status === 'submitting'}>
              Submit
            </Button>
          </Stack>

          {status === 'done' && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Submission sent successfully! A manager will review it.
            </Alert>
          )}
          {status === 'error' && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Error submitting. Try again.
            </Alert>
          )}

          <Dialog
            open={confirmOpen}
            onClose={() => {
              if (status !== 'submitting') setConfirmOpen(false)
            }}
            maxWidth="xs"
            fullWidth
          >
            <DialogTitle>Confirm Submission</DialogTitle>
            <DialogContent>
              <Typography variant="body2">Are you sure you want to submit your induction?</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setConfirmOpen(false)} disabled={status === 'submitting'}>
                Cancel
              </Button>
              <AsyncButton
                variant="contained"
                onClick={async () => {
                  await submit()
                  setConfirmOpen(false)
                }}
                disabled={status === 'submitting'}
              >
                Confirm
              </AsyncButton>
            </DialogActions>
          </Dialog>
        </Paper>
      )}
    </Stack>
  )
}

// =========================================================
// SlidesStep: visor (PDF directo o PPT/PPTX via Office Online),
// temporizador 5s por slide para habilitar avance.
// =========================================================
function SlidesStep({ project, onBack, onNext }) {
  const slides = project?.config?.slides || {}
  const pptKey = slides.pptKey
  const thumbKey = slides.thumbKey

  const [thumbUrl, setThumbUrl] = useState('')
  const [totalSlides, setTotalSlides] = useState(1)
  const [slideIndex, setSlideIndex] = useState(1) // 1-based
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerUrl, setViewerUrl] = useState('')
  const [viewerExt, setViewerExt] = useState('')

  const [blocked, setBlocked] = useState(true)
  const [countdown, setCountdown] = useState(5)
  const [viewedMap, setViewedMap] = useState({}) // { [index:number]: true }
  const timerRef = useRef(null)
  const name = `${project?.name || 'Slides'}`

  useEffect(() => {
    let cancelled = false
    async function loadThumb() {
      if (!thumbKey) {
        setThumbUrl('')
        return
      }
      try {
        const { url } = await presignGet(thumbKey)
        if (!cancelled) setThumbUrl(url)
      } catch {
        if (!cancelled) setThumbUrl('')
      }
    }
    loadThumb()
    return () => {
      cancelled = true
    }
  }, [thumbKey])

  const openViewer = async () => {
    if (!pptKey) return
    try {
      const { url } = await presignGet(pptKey)
      const ext = (pptKey.split('.').pop() || 'pptx').toLowerCase()
      setViewerExt(ext)
      setViewerUrl(url)
    } catch {}

    setViewerOpen(true)
    if (!viewedMap[slideIndex]) {
      startTimer()
    } else {
      setBlocked(false)
      setCountdown(0)
    }
  }

  const closeViewer = () => {
    setViewerOpen(false)
    setViewerUrl('')
    clearTimer()
    if (!viewedMap[slideIndex]) setBlocked(true)
  }

  function clearTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
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

  // Detecta páginas si es PDF
  useEffect(() => {
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
        if (!window.pdfjsLib) {
          await new Promise((resolve, reject) => {
            const s = document.createElement('script')
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
            s.onload = resolve
            s.onerror = reject
            document.body.appendChild(s)
          })
        }
        // @ts-ignore
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
        // @ts-ignore
        const pdf = await window.pdfjsLib.getDocument(url).promise
        if (!cancelled) setTotalSlides(Math.max(1, pdf.numPages || 1))
      } catch {
        // mantener por defecto 1
      }
    }
    detectSlides()
    return () => {
      cancelled = true
    }
  }, [pptKey])

  // Al cambiar de slide, resetea bloqueo si no se ha visto
  useEffect(() => {
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

  // Limpieza timers al desmontar
  useEffect(() => () => clearTimer(), [])

  const nextSlide = () => {
    if (slideIndex < totalSlides) setSlideIndex(slideIndex + 1)
  }
  const prevSlide = () => {
    if (slideIndex > 1) setSlideIndex(slideIndex - 1)
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Slides
      </Typography>

      {pptKey ? (
        <Stack spacing={2} sx={{ mb: 1 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            {thumbUrl ? (
              <Box
                component="img"
                src={thumbUrl}
                alt="Slides preview"
                sx={{ width: 140, height: 90, borderRadius: 1, objectFit: 'cover', border: '1px solid', borderColor: 'divider', cursor: 'pointer' }}
                onClick={openViewer}
              />
            ) : (
              <Chip icon={<InsertDriveFileIcon />} label="Open Viewer" onClick={openViewer} variant="outlined" />
            )}
            <Typography variant="body2" color="text.secondary">
              Open the viewer to start the 5s review for each slide.
            </Typography>
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center">
            <Chip label={`Slide ${slideIndex} of ${totalSlides}`} />
            {!viewedMap[slideIndex] && viewerOpen && (
              <Typography variant="body2" color="warning.main">
                Please review this slide (Next available in {countdown}s)
              </Typography>
            )}
            {!viewerOpen && !viewedMap[slideIndex] && (
              <Typography variant="body2" color="text.secondary">
                Open the viewer to start the 5s review
              </Typography>
            )}
            {viewedMap[slideIndex] && (
              <Typography variant="body2" color="success.main">
                You can go next
              </Typography>
            )}
          </Stack>

          <Stack direction="row" spacing={1}>
            <Button onClick={prevSlide} disabled={slideIndex === 1}>
              Previous
            </Button>
            <Button variant="outlined" onClick={nextSlide} disabled={!viewedMap[slideIndex] || slideIndex === totalSlides}>
              Next Slide
            </Button>
          </Stack>
        </Stack>
      ) : (
        <Typography variant="body2">No slides configured.</Typography>
      )}

      <Stack direction="row" spacing={1}>
        <Button onClick={onBack}>Back</Button>
        <Button
          variant="contained"
          onClick={onNext}
          disabled={!pptKey ? false : !(slideIndex === totalSlides && viewedMap[slideIndex])}
        >
          Continue
        </Button>
      </Stack>

      {/* Modal del visor */}
      <Dialog open={viewerOpen} onClose={closeViewer} maxWidth="lg" fullWidth>
        <DialogTitle>
          {name} — Slide {slideIndex}/{totalSlides}
        </DialogTitle>
        <DialogContent dividers>
          {viewerUrl ? (
            viewerExt === 'pdf' ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', maxWidth: '90vw', overflow: 'hidden', bgcolor: '#f5f5f5' }}>
                <Box component="iframe" src={viewerUrl} title="PDF Viewer" sx={{ width: '100%', height: '80vh', border: 0, bgcolor: '#f5f5f5' }} />
              </Box>
            ) : (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', maxWidth: '90vw', overflow: 'hidden', bgcolor: '#f5f5f5' }}>
                  <Box
                    component="iframe"
                    src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(viewerUrl)}`}
                    title="Office Viewer"
                    sx={{ width: '100%', height: '80vh', border: 0, bgcolor: '#f5f5f5' }}
                  />
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Button variant="outlined" component="a" href={viewerUrl} target="_blank" rel="noopener noreferrer">
                    Open Original
                  </Button>
                </Box>
              </>
            )
          ) : (
            <Typography variant="body2">Loading...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeViewer}>Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}
