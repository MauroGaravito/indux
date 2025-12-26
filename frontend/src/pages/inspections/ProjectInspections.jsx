import React, { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Chip,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import HistoryIcon from '@mui/icons-material/History'
import api from '../../utils/api.js'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/auth.js'
import AsyncButton from '../../components/AsyncButton.jsx'
import { fetchProjectInspectionRecords } from '../../utils/inspections.js'

const INSPECTION_TYPES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'adhoc', label: 'Ad-hoc' },
]

const formatDateTime = (value) => {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString()
  } catch {
    return value
  }
}

export default function ProjectInspections() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [inspections, setInspections] = useState([])
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [selectedType, setSelectedType] = useState('daily')
  const [saving, setSaving] = useState(false)
  const [historyRecords, setHistoryRecords] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState('')

  const canActivate = useMemo(() => {
    if (!projectId) return false
    if (user?.role === 'admin') return true
    return user?.role === 'manager'
  }, [user, projectId])

  const loadInspections = async () => {
    if (!projectId) return
    setLoading(true)
    setError('')
    try {
      const resp = await api.get(`/projects/${projectId}/inspections`)
      setInspections(resp.data?.inspections || [])
    } catch (e) {
      setError(e?.response?.data?.error || 'Unable to load inspections for this project.')
      setInspections([])
    } finally {
      setLoading(false)
    }
  }

  const loadTemplates = async () => {
    try {
      const resp = await api.get('/inspection-templates')
      setTemplates(resp.data?.templates || [])
    } catch {
      setTemplates([])
    }
  }

  const loadHistory = async () => {
    if (!projectId) return
    setHistoryLoading(true)
    setHistoryError('')
    try {
      const records = await fetchProjectInspectionRecords(projectId)
      setHistoryRecords(records)
    } catch (e) {
      setHistoryRecords([])
      setHistoryError(e?.response?.data?.error || 'Unable to load inspection history for this project.')
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    loadInspections()
    loadTemplates()
    loadHistory()
  }, [projectId])

  const openDialog = () => {
    setSelectedTemplateId('')
    setSelectedType('daily')
    setDialogOpen(true)
  }

  const closeDialog = () => {
    if (saving) return
    setDialogOpen(false)
  }

  const handleActivate = async () => {
    if (!selectedTemplateId || !projectId) return
    setSaving(true)
    try {
      await api.post(`/projects/${projectId}/inspections`, {
        templateId: selectedTemplateId,
        type: selectedType,
      })
      setDialogOpen(false)
      await loadInspections()
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to activate inspection.')
    } finally {
      setSaving(false)
    }
  }

  const inspectionRows = inspections.map((insp) => {
    const template = templates.find((tpl) => String(tpl._id) === String(insp.templateId)) || {}
    const typeMeta = INSPECTION_TYPES.find((tpl) => tpl.value === insp.type)
    return {
      ...insp,
      templateName: template.name || 'Inspection template',
      templateDescription: template.description || '',
      typeLabel: typeMeta?.label || insp.type,
    }
  })

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Project inspections
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Activated inspection templates for this project plus the submitted inspection history.
          </Typography>
        </Box>
        {canActivate && (
          <Button startIcon={<AddIcon />} variant="contained" onClick={openDialog}>
            Activate template
          </Button>
        )}
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}
      {loading && <Alert severity="info">Loading inspections…</Alert>}

      <Card elevation={1}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Active inspections
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Template</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inspectionRows.map((insp) => (
                <TableRow key={insp._id}>
                  <TableCell>
                    <Typography sx={{ fontWeight: 600 }}>{insp.templateName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {insp.templateDescription}
                    </Typography>
                  </TableCell>
                  <TableCell>{insp.typeLabel}</TableCell>
                  <TableCell>Active</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button variant="outlined" size="small" disabled>
                        New inspection
                      </Button>
                      <Button variant="outlined" size="small" startIcon={<HistoryIcon />} disabled>
                        View history
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!inspectionRows.length && !loading && (
            <Alert severity="info" sx={{ mt: 2 }}>
              No inspections have been activated yet. Activate a template to get started.
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card elevation={1}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Inspection history</Typography>
              <Typography variant="body2" color="text.secondary">
                Submitted inspections for this project. Records are read-only.
              </Typography>
            </Box>
          </Stack>
          {historyError && <Alert severity="error" sx={{ mt: 2 }}>{historyError}</Alert>}
          {historyLoading && <Alert severity="info" sx={{ mt: 2 }}>Loading inspection history…</Alert>}
          <Table size="small" sx={{ mt: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Template</TableCell>
                <TableCell>Executed by</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {historyRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{formatDateTime(record.submittedAt)}</TableCell>
                  <TableCell>{record.template?.name || 'Inspection template'}</TableCell>
                  <TableCell>
                    <Typography variant="body2">{record.executedBy?.name || 'User'}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {record.executedBy?.role || ''}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={record.status || 'submitted'} color="success" size="small" variant="outlined" />
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => navigate(`/inspection-records/${record.id}`)}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!historyRecords.length && !historyLoading && (
            <Alert severity="info" sx={{ mt: 2 }}>
              No submitted inspections yet for this project.
            </Alert>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Activate inspection template</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              select
              label="Template"
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              fullWidth
            >
              <MenuItem value="">Select a template</MenuItem>
              {templates.map((tpl) => (
                <MenuItem key={tpl._id} value={tpl._id}>
                  {tpl.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Inspection type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {INSPECTION_TYPES.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} disabled={saving}>
            Cancel
          </Button>
          <AsyncButton onClick={handleActivate} loading={saving} disabled={!selectedTemplateId}>
            Activate inspection
          </AsyncButton>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
