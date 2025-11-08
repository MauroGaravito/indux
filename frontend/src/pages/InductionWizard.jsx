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
  DialogActions
} from '@mui/material'
import SignaturePad from '../components/SignaturePad.jsx'
import { useAuthStore } from '../store/auth.js'
import api from '../utils/api.js'
import { uploadFile, presignGet } from '../utils/upload.js'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import AsyncButton from '../components/AsyncButton.jsx'

// ---------- Dynamic Personal Fields ----------
function DynamicField({ field, value, onChange }) {
  const [progress, setProgress] = React.useState(null)

  if (field.key === 'medicalIssues') {
    return <MedicalField label={field.label || 'Medical Condition'} value={value} onChange={onChange} />
  }

  if (field.type === 'textarea') {
    return (
      <TextField
        fullWidth
        multiline
        minRows={3}
        label={field.label}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      />
    )
  }

  if (field.type === 'date') {
    return (
      <TextField
        fullWidth
        type="date"
        label={field.label}
        InputLabelProps={{ shrink: true }}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      />
    )
  }

  if (field.type === 'select' && Array.isArray(field.options)) {
    return (
      <TextField
        fullWidth
        select
        label={field.label}
        value={value || ''}
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

  if (field.type === 'image') {
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

  if (field.type === 'camera') {
    return <CameraCapture label={field.label} value={value} onChange={onChange} />
  }

  return <TextField fullWidth label={field.label} value={value || ''} onChange={(e) => onChange(e.target.value)} />
}

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

// ---------- Camera capture field ----------
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
          s && s.getTracks && s.getTracks().forEach((t) => t.stop())
          v.srcObject = null
        }
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop())
          streamRef.current = null
        }
      } catch {}
    }
  }, [])

  // Attach stream when ready
  useEffect(() => {
    if (!streaming) return
    const v = videoRef.current
    const s = streamRef.current
    if (v && s) {
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
      const current = v?.srcObject
      if (current && current.getTracks) current.getTracks().forEach((t) => t.stop())
      if (v) v.srcObject = null
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
      {!streaming && <Button variant="outlined" onClick={start}>Open Camera</Button>}
      {streaming && !previewUrl && (
        <Stack spacing={1}>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', maxWidth: 480, borderRadius: 8, background: '#000' }} />
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
            <Button variant="contained" onClick={accept} disabled={progress != null}>Accept</Button>
          </Stack>
          {progress != null && <LinearProgress variant="determinate" value={progress} />}        
        </Stack>
      )}
      {value && <Chip label={`Captured: ${value}`} size="small" />}
    </Stack>
  )
}

// ---------- Main Wizard ----------
export default function InductionWizard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [projects, setProjects] = useState([])

  useEffect(() => {
    api.get('/projects').then((r) => setProjects(r.data || []))
  }, [])

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Induction Wizard (Placeholder)</Typography>
      <Typography variant="body2">This base structure now compiles cleanly. Add steps here.</Typography>
    </Paper>
  )
}
