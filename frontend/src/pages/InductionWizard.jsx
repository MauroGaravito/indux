import React, { useEffect, useState } from 'react'
import { Stack, Typography, Button, TextField, Paper, Alert } from '@mui/material'
import SignaturePad from '../components/SignaturePad.jsx'
import { useWizardStore } from '../store/wizard.js'
import { useAuthStore } from '../store/auth.js'
import api from '../utils/api.js'

function SlidesViewer() {
  const [idx, setIdx] = useState(0)
  const slides = [
    { type: 'text', content: 'Welcome to the site induction.' },
    { type: 'text', content: 'Always wear PPE and follow instructions.' }
  ]
  const next = () => setIdx(i => Math.min(slides.length - 1, i + 1))
  const prev = () => setIdx(i => Math.max(0, i - 1))
  return (
    <Stack spacing={1}>
      <Typography>Slide {idx + 1} of {slides.length}</Typography>
      <Paper sx={{ p:2, background:'#fafafa' }}>
        <Typography variant="body1">{slides[idx].content}</Typography>
      </Paper>
      <Stack direction="row" spacing={1}>
        <Button onClick={prev} disabled={idx===0}>Previous</Button>
        <Button onClick={next} disabled={idx===slides.length-1}>Next</Button>
        <Button variant="contained" disabled={idx!==slides.length-1}>Finish</Button>
      </Stack>
    </Stack>
  )
}

export default function InductionWizard() {
  const { user } = useAuthStore()
  const [projects, setProjects] = useState([])
  const [status, setStatus] = useState('idle')
  const { personal, setPersonal, signature, setSignature, quiz, setQuiz, projectId, setProjectId } = useWizardStore()

  useEffect(() => {
    api.get('/projects').then(r => setProjects(r.data))
  }, [])

  const submit = async () => {
    try {
      setStatus('submitting')
      await api.post('/submissions', {
        projectId,
        personal,
        uploads: [],
        quiz: quiz.total ? quiz : { total: 5, correct: 5 },
        signatureDataUrl: signature || undefined
      })
      setStatus('done')
    } catch (e) {
      setStatus('error')
    }
  }

  if (!user) return <Alert severity="info">Please log in as a worker to complete induction.</Alert>
  if (user.role !== 'worker') return <Alert severity="warning">Switch to a worker account to submit an induction.</Alert>

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Induction Wizard</Typography>
      <Paper sx={{ p:2 }}>
        <Typography variant="subtitle1">1. Select Project</Typography>
        <TextField select SelectProps={{ native: true }} value={projectId || ''} onChange={(e)=> setProjectId(e.target.value)}>
          <option value="">Select a project</option>
          {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
        </TextField>
      </Paper>
      <Paper sx={{ p:2 }}>
        <Typography variant="subtitle1">2. Personal Details</Typography>
        <Stack direction="row" spacing={2}>
          <TextField label="First Name" value={personal.firstName || ''} onChange={e => setPersonal({ ...personal, firstName: e.target.value })} />
          <TextField label="Last Name" value={personal.lastName || ''} onChange={e => setPersonal({ ...personal, lastName: e.target.value })} />
        </Stack>
      </Paper>
      <Paper sx={{ p:2 }}>
        <Typography variant="subtitle1">3. Slides</Typography>
        <SlidesViewer />
      </Paper>
      <Paper sx={{ p:2 }}>
        <Typography variant="subtitle1">4. Quiz</Typography>
        <Typography variant="body2">Quiz placeholder. Pre-filling pass result for demo.</Typography>
        <Button variant="outlined" onClick={()=> setQuiz({ total: 5, correct: 5 })}>Mark Quiz Passed</Button>
      </Paper>
      <Paper sx={{ p:2 }}>
        <Typography variant="subtitle1">5. Signature</Typography>
        <SignaturePad value={signature} onChange={setSignature} height={200} />
      </Paper>
      <Button disabled={!projectId || status==='submitting'} variant="contained" onClick={submit}>Submit</Button>
      {status==='done' && <Alert severity="success">Submission sent! A manager will review it.</Alert>}
      {status==='error' && <Alert severity="error">Error submitting. Try again.</Alert>}
    </Stack>
  )
}
