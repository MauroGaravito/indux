import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material'
import SignaturePad from '../../components/SignaturePad.jsx'
import AsyncButton from '../../components/AsyncButton.jsx'
import { useAuthStore } from '../../store/auth.js'
import api from '../../utils/api.js'
import { uploadFile } from '../../utils/upload.js'
import { setInspectionExecutionRecord, appendInspectionHistory } from '../../utils/inspectionStorage.js'

const stepsLabels = ['Context', 'Checklist', 'Summary', 'Signature', 'Submit']
const STATUS_OPTIONS = [
  { value: 'pass', label: 'Pass' },
  { value: 'fail', label: 'Fail' },
  { value: 'na', label: 'N/A' },
]

const createEmptyResult = (item) => ({
  itemKey: item.key,
  status: '',
  notes: '',
  correctiveAction: '',
  riskLevel: '',
  photos: [],
})

export default function InspectionWizard() {
  const [searchParams] = useSearchParams()
  const { user } = useAuthStore()

  const projectInspectionId = searchParams.get('projectInspectionId') || ''
  const existingExecutionId = searchParams.get('executionId') || ''

  const [executionId, setExecutionId] = useState(existingExecutionId)
  const [execution, setExecution] = useState(null)
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(0)
  const [poiRef, setPoiRef] = useState('')
  const [results, setResults] = useState([])
  const [signature, setSignature] = useState('')
  const [uploading, setUploading] = useState({})
  const [submitStatus, setSubmitStatus] = useState('idle')
  const [confirmOpen, setConfirmOpen] = useState(false)

  const template = execution?.templateSnapshot || {}
  const categories = Array.isArray(template.categories) ? template.categories : []
  const items = Array.isArray(template.items) ? template.items : []
  const requirePOI = !!template.requirePOI
  const requireSignature = !!template.requireSignature
  const locked = execution?.status === 'submitted' || submitStatus === 'success'

  useEffect(() => {
    if (!execution || !user?.id) return
    const projectInspectionId =
      (execution.projectInspectionId && execution.projectInspectionId.toString) ?
        execution.projectInspectionId.toString() :
        execution.projectInspectionId || ''
    if (!projectInspectionId) return
    setInspectionExecutionRecord(user.id, projectInspectionId, {
      executionId: execution._id,
      status: execution.status || 'draft',
      projectId: execution.projectId || '',
      projectName: project?.name || '',
      templateName: template?.name || execution.templateSnapshot?.name || '',
      submittedAt: execution.submittedAt || null,
    })
  }, [execution, project, template, user])

  useEffect(() => {
    if (!execution || !user?.id) return
    const projectInspectionId = execution.projectInspectionId || execution.projectInspectionId?._id
    if (!projectInspectionId || !execution._id) return
    setInspectionExecutionRecord(user.id, String(projectInspectionId), {
      executionId: execution._id,
      status: execution.status || 'draft',
    })
  }, [execution, user])

  useEffect(() => {
    if (!user) return
    initialize()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const initialize = async () => {
    if (!user) {
      setError('Sign in to run inspections.')
      return
    }
    if (!existingExecutionId && !projectInspectionId) {
      setError('Missing inspection context. Provide a projectInspectionId or executionId.')
      return
    }
    try {
      setLoading(true)
      setError('')
      let execId = existingExecutionId
      if (!execId) {
        const { data } = await api.post(`/project-inspections/${projectInspectionId}/executions`)
        execId = data?._id
        setExecutionId(execId || '')
      }
      if (!execId) {
        setError('Unable to create inspection execution.')
        return
      }
      const execData = await fetchExecution(execId)
      if (execData?.projectId) {
        await fetchProject(execData.projectId)
      }
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Failed to load inspection.')
    } finally {
      setLoading(false)
    }
  }

  const fetchExecution = async (id) => {
    const { data } = await api.get(`/inspection-executions/${id}`)
    setExecution(data)
    setPoiRef(data?.poiRef || '')
    setSignature(data?.signatureDataUrl || '')
    const snapshotItems = Array.isArray(data?.templateSnapshot?.items) ? data.templateSnapshot.items : []
    const existing = Array.isArray(data?.results) ? data.results : []
    const mapped = snapshotItems.map((item) => {
      const found = existing.find((res) => res.itemKey === item.key)
      if (!found) return createEmptyResult(item)
      return {
        itemKey: found.itemKey,
        status: found.status || '',
        notes: found.notes || '',
        correctiveAction: found.correctiveAction || '',
        riskLevel: found.riskLevel || '',
        photos: Array.isArray(found.photos) ? found.photos : [],
      }
    })
    setResults(mapped)
    return data
  }

  const fetchProject = async (projectId) => {
    try {
      const resp = await api.get('/projects', { params: { includeArchived: true } })
      const list = resp.data || []
      const found = list.find((p) => String(p._id) === String(projectId))
      setProject(found || null)
    } catch {
      setProject(null)
    }
  }

  const projectPOIs = useMemo(
    () => (Array.isArray(project?.pointsOfInterest) ? project.pointsOfInterest : []),
    [project]
  )

  const updateResult = (itemKey, patch) => {
    setResults((prev) =>
      prev.map((entry) => (entry.itemKey === itemKey ? { ...entry, ...patch } : entry))
    )
  }

  const handlePhotoUpload = async (itemKey, file) => {
    if (!file) return
    setUploading((prev) => ({ ...prev, [itemKey]: true }))
    try {
      const { key } = await uploadFile('inspection-uploads/', file)
      updateResult(itemKey, {
        photos: [...(results.find((r) => r.itemKey === itemKey)?.photos || []), { key }],
      })
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to upload photo.')
    } finally {
      setUploading((prev) => ({ ...prev, [itemKey]: false }))
    }
  }

  const removePhoto = (itemKey, photoKey) => {
    updateResult(itemKey, {
      photos: (results.find((r) => r.itemKey === itemKey)?.photos || []).filter(
        (photo) => photo.key !== photoKey
      ),
    })
  }

  const validateStepContext = () => {
    if (!execution || !project) return false
    if (requirePOI) {
      return !!poiRef
    }
    return true
  }

  const validateChecklist = () => {
    if (!results.length) return false
    for (const item of items) {
      const result = results.find((res) => res.itemKey === item.key)
      if (!result || !result.status) return false
      const photos = Array.isArray(result.photos) ? result.photos : []
      if (item.photoRequired && photos.length === 0) return false
      if (item.notesRequired && !result.notes?.trim()) return false
      if (result.status === 'fail') {
        if (item.photoRequiredOnFail && photos.length === 0) return false
        if (item.notesRequiredOnFail && !result.notes?.trim()) return false
        if (!result.correctiveAction?.trim()) return false
        if (item.enableRiskLevel && !result.riskLevel?.trim()) return false
      }
    }
    return true
  }

  const summaryCounts = useMemo(() => {
    const counts = { pass: 0, fail: 0, na: 0 }
    results.forEach((res) => {
      if (res.status === 'pass') counts.pass += 1
      else if (res.status === 'fail') counts.fail += 1
      else if (res.status === 'na') counts.na += 1
    })
    return counts
  }, [results])

  const failedItems = useMemo(() => {
    return items
      .map((item) => ({
        item,
        result: results.find((res) => res.itemKey === item.key),
      }))
      .filter((entry) => entry.result?.status === 'fail')
  }, [items, results])

  const categoryKeySet = useMemo(() => new Set(categories.map((cat) => cat.key)), [categories])

  const ungroupedItems = useMemo(() => {
    return items.filter((item) => !categoryKeySet.has(item.categoryKey))
  }, [items, categoryKeySet])

  const renderChecklistItem = (item) => {
    const result = results.find((entry) => entry.itemKey === item.key) || createEmptyResult(item)
    const disabled = locked
    const showNotes = item.notesRequired || item.notesRequiredOnFail || result.status === 'fail'
    const showCorrective = result.status === 'fail'
    const showRisk = item.enableRiskLevel && result.status === 'fail'
    const showPhoto = item.photoRequired || item.photoRequiredOnFail || result.status === 'fail'

    return (
      <Paper key={item.key} variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={1}>
          <Typography sx={{ fontWeight: 600 }}>{item.label || 'Checklist item'}</Typography>
          <TextField
            select
            label="Status"
            value={result.status}
            onChange={(e) => updateResult(item.key, { status: e.target.value })}
            disabled={disabled}
          >
            <MenuItem value="">Select status</MenuItem>
            {STATUS_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
          {showNotes && (
            <TextField
              label="Notes"
              value={result.notes}
              onChange={(e) => updateResult(item.key, { notes: e.target.value })}
              disabled={disabled}
              multiline
              minRows={2}
            />
          )}
          {showCorrective && (
            <TextField
              label="Corrective action"
              value={result.correctiveAction}
              onChange={(e) => updateResult(item.key, { correctiveAction: e.target.value })}
              disabled={disabled}
              multiline
              minRows={2}
            />
          )}
          {showRisk && (
            <TextField
              label="Risk level"
              value={result.riskLevel}
              onChange={(e) => updateResult(item.key, { riskLevel: e.target.value })}
              disabled={disabled}
            />
          )}
          {showPhoto && (
            <Box>
              <Button variant="outlined" component="label" disabled={disabled || uploading[item.key]}>
                Upload photo
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={(e) => handlePhotoUpload(item.key, e.target.files?.[0])}
                />
              </Button>
              {uploading[item.key] && <LinearProgress sx={{ mt: 1 }} />}
              <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
                {(result.photos || []).map((photo) => (
                  <Chip
                    key={photo.key}
                    label={photo.key}
                    onDelete={disabled ? undefined : () => removePhoto(item.key, photo.key)}
                    sx={{ maxWidth: 280 }}
                  />
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      </Paper>
    )
  }

  const validateSignature = () => {
    if (!requireSignature) return true
    return !!signature
  }

  const nextStep = () => setStep((prev) => Math.min(stepsLabels.length - 1, prev + 1))
  const prevStep = () => setStep((prev) => Math.max(0, prev - 1))

  const handleSubmit = async () => {
    if (!executionId) return
    try {
      setSubmitStatus('submitting')
      const payload = {
        results: results.map((res) => ({
          ...res,
          photos: (res.photos || []).map((photo) =>
            typeof photo === 'string' ? { key: photo } : photo
          ),
        })),
        poiRef: poiRef || undefined,
        signatureDataUrl: signature || undefined,
      }
      const { data } = await api.post(`/inspection-executions/${executionId}/submit`, payload)
      const updatedExecution = data || { ...execution, status: 'submitted' }
      setExecution(updatedExecution)
      setSubmitStatus('success')
      setConfirmOpen(false)
      const projectInspectionId = updatedExecution?.projectInspectionId || execution?.projectInspectionId
      const submittedAt = new Date().toISOString()
      const templateName =
        template?.name ||
        execution?.templateSnapshot?.name ||
        updatedExecution?.templateSnapshot?.name ||
        'Inspection template'
      const projectName = project?.name || ''
      if (user?.id && projectInspectionId && executionId) {
        setInspectionExecutionRecord(user.id, String(projectInspectionId), {
          executionId,
          status: 'submitted',
          projectId: updatedExecution?.projectId || execution?.projectId || '',
          projectName,
          templateName,
          submittedAt,
        })
      }
      appendInspectionHistory({
        projectId: updatedExecution?.projectId || execution?.projectId || '',
        projectInspectionId: projectInspectionId ? String(projectInspectionId) : '',
        projectName,
        templateName,
        executedByName: user?.name || user?.email || 'User',
        submittedAt,
        executionId,
      })
    } catch (err) {
      setSubmitStatus('error')
      setError(err?.response?.data?.error || 'Failed to submit inspection.')
    }
  }

  if (!user) {
    return <Alert severity="info">Please sign in to run inspections.</Alert>
  }

  const canView = user.role === 'worker' || user.role === 'manager' || user.role === 'admin'
  if (!canView) {
    return <Alert severity="warning">Your role cannot access the inspection wizard.</Alert>
  }

  if (loading) {
    return (
      <Stack spacing={2}>
        <Typography variant="h5">Inspection wizard</Typography>
        <LinearProgress />
      </Stack>
    )
  }

  if (error) {
    return (
      <Stack spacing={2}>
        <Typography variant="h5">Inspection wizard</Typography>
        <Alert severity="error">{error}</Alert>
      </Stack>
    )
  }

  if (!execution || !project) {
    return (
      <Stack spacing={2}>
        <Typography variant="h5">Inspection wizard</Typography>
        <Alert severity="info">Select an inspection to begin.</Alert>
      </Stack>
    )
  }

  const templateName = template?.name || 'Inspection template'

  return (
    <Stack spacing={3}>
      <Typography variant="h5">{`Inspection wizard - ${templateName}`}</Typography>
      <Stepper activeStep={step} alternativeLabel>
        {stepsLabels.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {step === 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1">Inspection context</Typography>
          <Stack spacing={1} sx={{ mt: 1 }}>
            <Typography variant="body2">Project: {project?.name}</Typography>
            <Typography variant="body2">Inspection: {templateName}</Typography>
            <Typography variant="body2" color="text.secondary">
              {template?.description}
            </Typography>
          </Stack>
          {requirePOI && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Point of interest</Typography>
              <TextField
                select
                fullWidth
                value={poiRef}
                onChange={(e) => setPoiRef(e.target.value)}
                helperText={
                  projectPOIs.length ? 'Select where this inspection is taking place' : 'No points of interest configured.'
                }
                sx={{ mt: 1 }}
                disabled={locked}
              >
                <MenuItem value="">Select POI</MenuItem>
                {projectPOIs.map((poi, idx) => (
                  <MenuItem key={poi._id || poi.label || idx} value={poi._id || poi.id || poi.label || `poi-${idx}`}>
                    {poi.label || `POI ${idx + 1}`}
                  </MenuItem>
                ))}
              </TextField>
              {!projectPOIs.length && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  Project has no POIs. Add one before requiring POI selection.
                </Alert>
              )}
            </Box>
          )}
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button variant="contained" onClick={nextStep} disabled={!validateStepContext() || locked}>
              Next step
            </Button>
          </Stack>
        </Paper>
      )}

      {step === 1 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1">Checklist</Typography>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {categories.map((category) => {
              const catItems = items.filter((item) => item.categoryKey === category.key)
              if (!catItems.length) return null
              return (
                <Card key={category.key} variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2">{category.label || 'Category'}</Typography>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                      {catItems.map((item) => renderChecklistItem(item))}
                    </Stack>
                  </CardContent>
                </Card>
              )
            })}
            {ungroupedItems.length > 0 && (
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2">Additional items</Typography>
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    {ungroupedItems.map((item) => renderChecklistItem(item))}
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Stack>
          {!items.length && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              This template has no categories or items configured.
            </Alert>
          )}
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button onClick={prevStep} disabled={locked}>
              Back
            </Button>
            <Button variant="contained" onClick={nextStep} disabled={!validateChecklist() || locked}>
              Continue
            </Button>
          </Stack>
        </Paper>
      )}

      {step === 2 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1">Summary</Typography>
          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
            <Chip label={`Pass: ${summaryCounts.pass}`} color="success" />
            <Chip label={`Fail: ${summaryCounts.fail}`} color="error" />
            <Chip label={`N/A: ${summaryCounts.na}`} />
          </Stack>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Failed items</Typography>
            {failedItems.length ? (
              <Stack spacing={1} sx={{ mt: 1 }}>
                {failedItems.map(({ item, result }) => (
                  <Card key={item.key} variant="outlined">
                    <CardContent>
                      <Typography sx={{ fontWeight: 600 }}>{item.label}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Corrective action: {result?.correctiveAction || '—'}
                      </Typography>
                      {result?.notes && (
                        <Typography variant="body2" color="text.secondary">
                          Notes: {result.notes}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            ) : (
              <Alert severity="info" sx={{ mt: 1 }}>
                No failed items in this inspection.
              </Alert>
            )}
          </Box>
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button onClick={prevStep} disabled={locked}>
              Back
            </Button>
            <Button variant="contained" onClick={nextStep} disabled={locked}>
              Continue
            </Button>
          </Stack>
        </Paper>
      )}

      {step === 3 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1">Signature</Typography>
          {requireSignature ? (
            <SignaturePad value={signature} onChange={setSignature} disabled={locked} />
          ) : (
            <Alert severity="info" sx={{ mt: 1 }}>
              Signature not required for this inspection.
            </Alert>
          )}
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button onClick={prevStep} disabled={locked}>
              Back
            </Button>
            <Button variant="contained" onClick={nextStep} disabled={!validateSignature() || locked}>
              Continue
            </Button>
          </Stack>
        </Paper>
      )}

      {step === 4 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1">Review & Submit</Typography>
          <Stack spacing={1} sx={{ mt: 1 }}>
            <Typography variant="body2">Project: {project?.name}</Typography>
            <Typography variant="body2">Inspection: {templateName}</Typography>
            <Typography variant="body2">Status: {execution?.status || 'draft'}</Typography>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button onClick={prevStep} disabled={locked}>
              Back
            </Button>
            <AsyncButton
              variant="contained"
              color="success"
              onClick={() => setConfirmOpen(true)}
              disabled={locked || submitStatus === 'submitting'}
            >
              Submit inspection
            </AsyncButton>
          </Stack>
        </Paper>
      )}

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Submit inspection</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Confirm submission for {project?.name}? You will not be able to edit once submitted.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <AsyncButton variant="contained" onClick={handleSubmit} loading={submitStatus === 'submitting'}>
            Submit
          </AsyncButton>
        </DialogActions>
      </Dialog>

      {submitStatus === 'success' && <Alert severity="success">Inspection submitted successfully.</Alert>}
      {submitStatus === 'error' && <Alert severity="error">Submission failed. Please try again.</Alert>}
    </Stack>
  )
}
