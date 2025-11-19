import React, { useEffect, useMemo, useState } from 'react'
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
  RadioGroup,
  FormControlLabel,
  Radio,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import SignaturePad from '../components/SignaturePad.jsx'
import { useAuthStore } from '../store/auth.js'
import api from '../utils/api.js'
import { uploadFile, presignGet } from '../utils/upload.js'
import AsyncButton from '../components/AsyncButton.jsx'

const stepsLabels = ['Project', 'Personal', 'Slides', 'Test', 'Sign', 'Submit']

function DynamicField({ field, value, onChange }) {
  const [progress, setProgress] = useState(null)

  if (field?.type === 'textarea') {
    return (
      <TextField fullWidth multiline minRows={3} label={field.label} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
    )
  }

  if (field?.type === 'date') {
    return (
      <TextField fullWidth type="date" label={field.label} InputLabelProps={{ shrink: true }} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
    )
  }

  if (field?.type === 'select' && Array.isArray(field.options)) {
    return (
      <TextField fullWidth select label={field.label} value={value ?? ''} onChange={(e) => onChange(e.target.value)} SelectProps={{ native: true }}>
        <option value="">Select</option>
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
      <TextField
        fullWidth
        select
        label={field.label}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === 'true')}
        SelectProps={{ native: true }}
      >
        <option value="">Select</option>
        <option value="true">Yes</option>
        <option value="false">No</option>
      </TextField>
    )
  }

  if (field?.type === 'file') {
    return (
      <Stack spacing={1}>
        <Typography variant="body2">{field.label}</Typography>
        <Button variant="outlined" component="label">
          Upload
          <input
            hidden
            type="file"
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

  return (
    <TextField fullWidth label={field?.label || 'Field'} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
  )
}

export default function InductionWizard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [projects, setProjects] = useState([])
  const [project, setProject] = useState(null)
  const [module, setModule] = useState(null)
  const [fields, setFields] = useState([])
  const [moduleConfig, setModuleConfig] = useState({ slides: [], quiz: { questions: [] }, settings: { passMark: 80, randomizeQuestions: false, allowRetry: true } })
  const [step, setStep] = useState(0)
  const [personalValues, setPersonalValues] = useState({})
  const [answers, setAnswers] = useState([])
  const [score, setScore] = useState(null)
  const [passed, setPassed] = useState(null)
  const [signature, setSignature] = useState(null)
  const [status, setStatus] = useState('idle')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [projectBlocked, setProjectBlocked] = useState(false)
  const [projectBlockedMessage, setProjectBlockedMessage] = useState('')
  const moduleApproved = module?.reviewStatus === 'approved'

  useEffect(() => {
    if (!user) return
    api.get('/projects').then((r) => setProjects(r.data || [])).catch(() => setProjects([]))
  }, [user])

  const personalFields = useMemo(() => {
    return Array.isArray(fields) ? [...fields].sort((a, b) => (a.order || 0) - (b.order || 0)) : []
  }, [fields])

  const quizQuestions = useMemo(() => moduleConfig?.quiz?.questions || [], [moduleConfig])
  const canFinishQuiz = useMemo(
    () => quizQuestions.length > 0 && quizQuestions.every((_, idx) => answers[idx] !== undefined && answers[idx] !== null),
    [quizQuestions, answers]
  )

  const selectProject = async (id) => {
    const p = projects.find((x) => x._id === id)
    setProject(p || null)
    setProjectBlocked(false)
    setProjectBlockedMessage('')
    setStep(0)
    setModule(null)
    setFields([])
    setModuleConfig({ slides: [], quiz: { questions: [] }, settings: { passMark: 80, randomizeQuestions: false, allowRetry: true } })
    setPersonalValues({})
    setAnswers([])
    setScore(null)
    setPassed(null)
    setSignature(null)
    setStatus('idle')
    if (!id) return
    if (p?.status === 'archived') {
      setProjectBlocked(true)
      setProjectBlockedMessage('This project is archived and cannot accept submissions.')
      return
    }
    try {
      const r = await api.get(`/projects/${id}/modules/induction`)
      setModule(r.data.module)
      setFields(r.data.fields || [])
      setModuleConfig(r.data.module?.config || { slides: [], quiz: { questions: [] }, settings: { passMark: 80, randomizeQuestions: false, allowRetry: true } })
    } catch {
      setModule(null)
    }
  }

  const passMarkThreshold = useMemo(() => {
    const pm = moduleConfig?.settings?.passMark
    return typeof pm === 'number' ? pm : 80
  }, [moduleConfig])

  const nextStep = () => setStep((s) => s + 1)
  const prevStep = () => setStep((s) => Math.max(0, s - 1))

  const validatePersonal = () =>
    personalFields.every((f) => {
      if (!f.required) return true
      const val = personalValues[f.key]
      return val != null && val !== ''
    })

  const finishQuiz = () => {
    const correct = answers.reduce((acc, a, i) => acc + (a === quizQuestions[i]?.answerIndex ? 1 : 0), 0)
    const pct = quizQuestions.length ? Math.round((correct / quizQuestions.length) * 100) : 0
    setScore(pct)
    setPassed(pct >= passMarkThreshold)
    nextStep()
  }

  const submit = async () => {
    try {
      setStatus('submitting')

      const uploads = personalFields
        .filter((f) => f.type === 'file')
        .map((f) => ({ type: f.type, key: personalValues[f.key] }))
        .filter((u) => u.key)

      const body = {
        payload: personalValues,
        uploads,
        quiz: { answers, score: score ?? 0, passed: !!passed },
        signatureDataUrl: signature || undefined
      }

      await api.post(`/modules/${module._id}/submissions`, body)
      setStatus('done')
      setConfirmOpen(false)
      navigate(0)
    } catch (e) {
      setStatus('error')
    }
  }

  const openViewer = async () => {
    const firstSlide = moduleConfig?.slides?.[0]
    if (!firstSlide?.fileKey) return
    const { url } = await presignGet(firstSlide.fileKey)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (!user) return <Alert severity="info">Please log in as a worker to complete induction.</Alert>
  if (user.role !== 'worker') return <Alert severity="warning">Switch to a worker account to submit an induction.</Alert>

  return (
    <Stack spacing={3}>
      <Typography variant="h5">Induction Wizard</Typography>
      <Stepper activeStep={step} alternativeLabel>
        {stepsLabels.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

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
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button variant="contained" onClick={nextStep} disabled={!project || !module || !moduleApproved || projectBlocked}>
              Continue
            </Button>
          </Stack>
          {projectBlocked && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              {projectBlockedMessage || 'This project is archived and cannot accept submissions.'}
            </Alert>
          )}
          {module && !moduleApproved && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              This module is not approved yet. Please wait for approval before starting the induction.
            </Alert>
          )}
        </Paper>
      )}

      {step === 1 && project && module && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Personal Details
          </Typography>
          <Grid container spacing={2}>
            {personalFields.map((f) => (
              <Grid item xs={12} sm={f.type === 'textarea' ? 12 : 6} key={f.key}>
                <DynamicField
                  field={f}
                  value={personalValues[f.key]}
                  onChange={(val) => setPersonalValues({ ...personalValues, [f.key]: val })}
                />
              </Grid>
            ))}
          </Grid>
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button onClick={prevStep}>Back</Button>
            <Button variant="contained" onClick={() => (validatePersonal() ? nextStep() : null)} disabled={!validatePersonal()}>
              Continue
            </Button>
          </Stack>
        </Paper>
      )}

      {step === 2 && module && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Slides
          </Typography>
          {moduleConfig?.slides?.length ? (
            <Stack spacing={1}>
              <Typography variant="body2">Open the slide deck to review the induction material.</Typography>
              <Button variant="outlined" onClick={openViewer}>Open Slides</Button>
            </Stack>
          ) : (
            <Alert severity="info">No slides configured for this module.</Alert>
          )}
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button onClick={prevStep}>Back</Button>
            <Button variant="contained" onClick={nextStep}>Continue</Button>
          </Stack>
        </Paper>
      )}

      {step === 3 && module && (
        <Paper sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1">Quiz</Typography>
            <Chip label={`${passMarkThreshold}% pass mark`} />
          </Stack>
          <Stack spacing={2} sx={{ mt: 2 }}>
            {quizQuestions.map((q, idx) => (
              <Card key={idx} variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2">{q.question}</Typography>
                  <RadioGroup
                    value={answers[idx] != null ? answers[idx] : ''}
                    onChange={(e) => {
                      const next = [...answers]
                      next[idx] = Number(e.target.value)
                      setAnswers(next)
                    }}
                  >
                    {q.options.map((opt, oidx) => (
                      <FormControlLabel key={oidx} value={oidx} control={<Radio />} label={opt} />
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            ))}
          </Stack>
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button onClick={prevStep}>Back</Button>
            <Button variant="contained" onClick={finishQuiz} disabled={!canFinishQuiz}>
              Finish Quiz
            </Button>
          </Stack>
        </Paper>
      )}

      {step === 4 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Signature</Typography>
          <SignaturePad value={signature} onChange={setSignature} />
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button onClick={prevStep}>Back</Button>
            <Button variant="contained" onClick={nextStep} disabled={!signature}>Continue</Button>
          </Stack>
        </Paper>
      )}

      {step === 5 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1">Review & Submit</Typography>
          <Stack spacing={1} sx={{ mt: 1 }}>
            <Typography variant="body2">Project: {project?.name}</Typography>
            <Typography variant="body2">Quiz Score: {score ?? '-'}% ({passed ? 'Passed' : 'Pending'})</Typography>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button onClick={prevStep}>Back</Button>
            <AsyncButton variant="contained" color="success" onClick={() => setConfirmOpen(true)} disabled={status === 'submitting'}>
              Submit
            </AsyncButton>
          </Stack>
        </Paper>
      )}

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Submit Induction</DialogTitle>
        <DialogContent>
          <Typography variant="body2">Confirm submission for {project?.name}?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <AsyncButton variant="contained" onClick={submit} loading={status === 'submitting'}>Submit</AsyncButton>
        </DialogActions>
      </Dialog>

      {status === 'error' && <Alert severity="error">Submission failed. Please try again.</Alert>}
      {status === 'done' && <Alert severity="success">Submission sent!</Alert>}
    </Stack>
  )
}
