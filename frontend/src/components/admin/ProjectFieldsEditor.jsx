import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Tooltip,
  Typography
} from '@mui/material'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import EditIcon from '@mui/icons-material/Edit'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import TextFieldsIcon from '@mui/icons-material/TextFields'
import NumbersIcon from '@mui/icons-material/Numbers'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import ListAltIcon from '@mui/icons-material/ListAlt'
import ToggleOnIcon from '@mui/icons-material/ToggleOn'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import DescriptionIcon from '@mui/icons-material/Description'
import api from '../../utils/api.js'
import AsyncButton from '../common/AsyncButton.jsx'
import { notifyError, notifySuccess } from '../../context/notificationStore.js'

const TYPE_OPTIONS = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Select' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'file', label: 'File / Document' }
]

const cardStyles = {
  borderRadius: 3,
  p: 3,
  backgroundColor: '#fff',
  border: '1px solid',
  borderColor: 'divider',
  boxShadow: '0 20px 45px rgba(15, 23, 42, 0.04)'
}

const iconForType = (type) => {
  switch (type) {
    case 'text': return <TextFieldsIcon color="primary" />
    case 'number': return <NumbersIcon color="secondary" />
    case 'date': return <CalendarMonthIcon color="action" />
    case 'select': return <ListAltIcon color="info" />
    case 'boolean': return <ToggleOnIcon color="success" />
    case 'file': return <AttachFileIcon color="warning" />
    default: return <DescriptionIcon color="disabled" />
  }
}

const slugify = (val) => (
  String(val || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
)

const defaultForm = {
  id: null,
  label: '',
  key: '',
  type: 'text',
  required: false,
  order: 0,
  helpText: '',
  optionsText: '',
  autoKey: true
}

function normalizeOptions(text) {
  return text
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
}

export default function ProjectFieldsEditor({ projectId }) {
  const [fields, setFields] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const orderedFields = useMemo(() => {
    return [...fields].sort((a, b) => {
      if (a.order === b.order) return new Date(a.createdAt) - new Date(b.createdAt)
      return a.order - b.order
    })
  }, [fields])

  const loadFields = useCallback(async () => {
    if (!projectId) {
      setFields([])
      return
    }
    setLoading(true)
    try {
      const { data } = await api.get(`/projects/${projectId}/fields`)
      setFields(Array.isArray(data) ? data : [])
    } catch (e) {
      notifyError(e?.response?.data?.error || 'Failed to load custom fields')
      setFields([])
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => { loadFields() }, [loadFields])

  const openCreateModal = () => {
    const nextOrder = orderedFields.length ? Math.max(...orderedFields.map(f => f.order || 0)) + 1 : 1
    setForm({ ...defaultForm, order: nextOrder })
    setModalMode('create')
    setModalOpen(true)
  }

  const openEditModal = (field) => {
    setForm({
      id: field._id,
      label: field.label || '',
      key: field.key || '',
      type: field.type || 'text',
      required: !!field.required,
      order: Number(field.order ?? 0),
      helpText: field.helpText || '',
      optionsText: Array.isArray(field.options) ? field.options.join('\n') : '',
      autoKey: false
    })
    setModalMode('edit')
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setForm(defaultForm)
  }

  const handleFieldChange = (key, value) => {
    setForm(prev => {
      if (key === 'label') {
        const next = { ...prev, label: value }
        if (prev.autoKey) next.key = slugify(value)
        return next
      }
      if (key === 'key') {
        return { ...prev, key: slugify(value), autoKey: false }
      }
      if (key === 'type') {
        return { ...prev, type: value }
      }
      if (key === 'order') {
        return { ...prev, order: Number(value) || 0 }
      }
      if (key === 'required') {
        return { ...prev, required: value }
      }
      if (key === 'optionsText') {
        return { ...prev, optionsText: value }
      }
      return { ...prev, [key]: value }
    })
  }

  const keyConflict = useMemo(() => {
    if (!form.key) return false
    return orderedFields.some((f) => f.key === form.key && f._id !== form.id)
  }, [form.key, form.id, orderedFields])

  const handleSubmit = async () => {
    if (!projectId || !form.label || !form.key || keyConflict) return
    setSaving(true)
    try {
      const payload = {
        projectId,
        label: form.label.trim(),
        key: form.key.trim(),
        type: form.type,
        required: !!form.required,
        order: Number.isFinite(form.order) ? form.order : 0,
        helpText: form.helpText?.trim() || undefined,
        options: form.type === 'select' ? normalizeOptions(form.optionsText || '') : undefined,
        step: 'personal'
      }
      if (modalMode === 'create') {
        await api.post(`/projects/${projectId}/fields`, payload)
        notifySuccess('Field created')
      } else {
        await api.put(`/fields/${form.id}`, payload)
        notifySuccess('Field updated')
      }
      closeModal()
      await loadFields()
    } catch (e) {
      const msg = e?.response?.data?.error || e?.response?.data?.message || 'Failed to save field'
      notifyError(msg)
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = (field) => setDeleteTarget(field)
  const closeDelete = () => setDeleteTarget(null)

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.delete(`/fields/${deleteTarget._id}`)
      notifySuccess('Field deleted')
      closeDelete()
      await loadFields()
    } catch (e) {
      notifyError(e?.response?.data?.error || 'Failed to delete field')
    } finally {
      setDeleting(false)
    }
  }

  const moveField = async (field, direction) => {
    const idx = orderedFields.findIndex(f => f._id === field._id)
    if (idx < 0) return
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= orderedFields.length) return
    const swapField = orderedFields[swapIdx]
    try {
      await Promise.all([
        api.put(`/fields/${field._id}`, { projectId, order: swapField.order }),
        api.put(`/fields/${swapField._id}`, { projectId, order: field.order })
      ])
      await loadFields()
    } catch (e) {
      notifyError(e?.response?.data?.error || 'Failed to reorder fields')
    }
  }

  const renderOptionsHelper = () => (
    <Typography variant="caption" color="text.secondary">
      Enter one option per line. Order will be preserved.
    </Typography>
  )

  return (
    <Card elevation={0} sx={cardStyles}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }} justifyContent="space-between">
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Personal Details / Custom Fields</Typography>
          <Typography variant="body2" color="text.secondary">
            Define enterprise-grade fields for the worker induction form.
          </Typography>
        </Box>
        <Button
          startIcon={<AddCircleOutlineIcon />}
          variant="contained"
          sx={{ textTransform: 'none' }}
          onClick={openCreateModal}
          disabled={!projectId}
        >
          Add Field
        </Button>
      </Stack>

      {!projectId && (
        <Alert severity="info" sx={{ mt: 3 }}>
          Select a project to manage its personal details fields.
        </Alert>
      )}

      {projectId && (
        <Box sx={{ mt: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Field</TableCell>
                <TableCell>Key</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Required</TableCell>
                <TableCell>Order</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orderedFields.map((field, idx) => (
                <TableRow key={field._id} hover>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {iconForType(field.type)}
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{field.label}</Typography>
                        {field.helpText && (
                          <Typography variant="caption" color="text.secondary">{field.helpText}</Typography>
                        )}
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip label={field.key} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip label={field.type} size="small" color="default" />
                  </TableCell>
                  <TableCell>
                    {field.required ? <Chip label="Required" size="small" color="error" /> : <Chip label="Optional" size="small" />}
                  </TableCell>
                  <TableCell>{field.order ?? '-'}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="Move up">
                        <span>
                          <IconButton size="small" disabled={idx === 0} onClick={()=> moveField(field, 'up')}>
                            <ArrowUpwardIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Move down">
                        <span>
                          <IconButton size="small" disabled={idx === orderedFields.length - 1} onClick={()=> moveField(field, 'down')}>
                            <ArrowDownwardIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Edit field">
                        <IconButton size="small" onClick={()=> openEditModal(field)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete field">
                        <IconButton size="small" color="error" onClick={()=> confirmDelete(field)}>
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!orderedFields.length && !loading && (
            <Alert severity="info" sx={{ mt: 2 }}>
              No custom fields yet. Click &quot;Add Field&quot; to create one.
            </Alert>
          )}
        </Box>
      )}

      <Dialog open={modalOpen} onClose={closeModal} maxWidth="sm" fullWidth>
        <DialogTitle>{modalMode === 'create' ? 'Add Field' : 'Edit Field'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Label"
              value={form.label}
              onChange={(e)=> handleFieldChange('label', e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Key"
              value={form.key}
              onChange={(e)=> handleFieldChange('key', e.target.value)}
              fullWidth
              required
              helperText={keyConflict ? 'Key already exists in this project' : 'Use lowercase snake_case naming'}
              error={keyConflict}
            />
            <TextField
              select
              label="Type"
              value={form.type}
              onChange={(e)=> handleFieldChange('type', e.target.value)}
              fullWidth
            >
              {TYPE_OPTIONS.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </TextField>
            <FormControlLabel
              control={<Switch checked={form.required} onChange={(e)=> handleFieldChange('required', e.target.checked)} />}
              label="Required"
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Order"
                  type="number"
                  fullWidth
                  value={form.order}
                  onChange={(e)=> handleFieldChange('order', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Help Text"
                  fullWidth
                  value={form.helpText}
                  onChange={(e)=> handleFieldChange('helpText', e.target.value)}
                />
              </Grid>
            </Grid>
            {form.type === 'select' && (
              <Box>
                <TextField
                  label="Options"
                  fullWidth
                  multiline
                  minRows={3}
                  value={form.optionsText}
                  onChange={(e)=> handleFieldChange('optionsText', e.target.value)}
                />
                {renderOptionsHelper()}
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal}>Cancel</Button>
          <AsyncButton variant="contained" onClick={handleSubmit} disabled={!form.label || !form.key || keyConflict || saving}>
            {modalMode === 'create' ? 'Create Field' : 'Save Changes'}
          </AsyncButton>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteTarget} onClose={closeDelete} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Field</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to delete &quot;{deleteTarget?.label}&quot;? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDelete}>Cancel</Button>
          <AsyncButton color="error" variant="contained" onClick={handleDelete} disabled={deleting}>
            Delete
          </AsyncButton>
        </DialogActions>
      </Dialog>
    </Card>
  )
}
