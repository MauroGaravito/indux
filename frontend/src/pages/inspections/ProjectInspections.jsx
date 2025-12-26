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
import { useParams } from 'react-router-dom'
import { useAuthStore } from '../../store/auth.js'
import AsyncButton from '../../components/AsyncButton.jsx'

const INSPECTION_TYPES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'adhoc', label: 'Ad-hoc' },
]

export default function ProjectInspections() {
  const { projectId } = useParams()
  const { user } = useAuthStore()
  const [inspections, setInspections] = useState([])
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [selectedType, setSelectedType] = useState('daily')
  const [saving, setSaving] = useState(false)

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

  useEffect(() => {
    loadInspections()
    loadTemplates()
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
            Activated inspection templates for this project. Execution history will be available soon.
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
          <Table component={Paper} size="small">
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
