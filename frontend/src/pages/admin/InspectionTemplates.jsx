import React, { useEffect, useMemo, useState } from 'react'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import VisibilityIcon from '@mui/icons-material/Visibility'
import BlockIcon from '@mui/icons-material/Block'
import DeleteIcon from '@mui/icons-material/Delete'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import api from '../../utils/api.js'
import AsyncButton from '../../components/AsyncButton.jsx'

const createKey = (prefix = 'tmp') => `${prefix}-${Date.now()}-${Math.round(Math.random() * 100000)}`

const emptyTemplate = {
  _id: undefined,
  name: '',
  description: '',
  requirePOI: false,
  requireSignature: false,
  categories: [],
  items: [],
}

export default function InspectionTemplates() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState('create')
  const [dialogTemplate, setDialogTemplate] = useState(emptyTemplate)
  const [saving, setSaving] = useState(false)

  const loadTemplates = async () => {
    setLoading(true)
    setError('')
    try {
      const resp = await api.get('/inspection-templates')
      setTemplates(resp.data?.templates || [])
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'Unable to load inspection templates.')
      setTemplates([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTemplates()
  }, [])

  const openDialog = (mode, template = emptyTemplate) => {
    setDialogMode(mode)
    setDialogTemplate(template || emptyTemplate)
    setDialogOpen(true)
  }

  const closeDialog = () => {
    if (saving) return
    setDialogOpen(false)
    setDialogTemplate(emptyTemplate)
  }

  const buildPayload = (draft) => {
    const categories = Array.isArray(draft.categories)
      ? draft.categories.map((cat, idx) => ({
          key: cat.key || createKey('cat'),
          label: (cat.label || `Category ${idx + 1}`).trim(),
          order: typeof cat.order === 'number' ? cat.order : Number(cat.order) || idx + 1,
        }))
      : []

    const validCategoryKeys = new Set(categories.map((cat) => cat.key))

    const items = Array.isArray(draft.items)
      ? draft.items
          .filter((item) => validCategoryKeys.has(item.categoryKey))
          .map((item, idx) => ({
            key: item.key || createKey('item'),
            categoryKey: item.categoryKey,
            label: (item.label || `Item ${idx + 1}`).trim(),
            photoRequired: !!item.photoRequired,
            photoRequiredOnFail: !!item.photoRequiredOnFail,
            notesRequired: !!item.notesRequired,
            notesRequiredOnFail: !!item.notesRequiredOnFail,
            enableRiskLevel: !!item.enableRiskLevel,
          }))
      : []

    return {
      name: draft.name.trim(),
      description: draft.description ? draft.description.trim() : '',
      requirePOI: !!draft.requirePOI,
      requireSignature: !!draft.requireSignature,
      categories,
      items,
    }
  }

  const handleSave = async (draft) => {
    if (!draft?.name?.trim()) return
    setSaving(true)
    setError('')
    try {
      const payload = buildPayload(draft)
      if (draft._id) {
        await api.put(`/inspection-templates/${draft._id}`, payload)
      } else {
        await api.post('/inspection-templates', payload)
      }
      await loadTemplates()
      setDialogOpen(false)
      setDialogTemplate(emptyTemplate)
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'Failed to save inspection template.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Inspection Templates
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure reusable checklists for project inspections.
          </Typography>
        </Box>
        <Button startIcon={<AddIcon />} variant="contained" onClick={() => openDialog('create')}>
          Create template
        </Button>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}
      {loading && <Alert severity="info">Loading inspection templates…</Alert>}

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Require POI</TableCell>
              <TableCell>Require signature</TableCell>
              <TableCell>Created at</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {templates.map((tpl) => (
              <TableRow key={tpl._id}>
                <TableCell>
                  <Typography sx={{ fontWeight: 600 }}>{tpl.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {tpl.description || 'No description'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip size="small" label={tpl.requirePOI ? 'Yes' : 'No'} color={tpl.requirePOI ? 'primary' : 'default'} />
                </TableCell>
                <TableCell>
                  <Chip size="small" label={tpl.requireSignature ? 'Yes' : 'No'} color={tpl.requireSignature ? 'primary' : 'default'} />
                </TableCell>
                <TableCell>{tpl.createdAt ? new Date(tpl.createdAt).toLocaleString() : '—'}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Tooltip title="View template">
                      <span>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => openDialog('view', tpl)}
                        >
                          View
                        </Button>
                      </span>
                    </Tooltip>
                    <Tooltip title="Edit template">
                      <span>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => openDialog('edit', tpl)}
                        >
                          Edit
                        </Button>
                      </span>
                    </Tooltip>
                    <Tooltip title="Disable coming soon">
                      <span>
                        <Button variant="outlined" size="small" startIcon={<BlockIcon />} disabled>
                          Disable
                        </Button>
                      </span>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!loading && !templates.length && (
          <Box sx={{ p: 3 }}>
            <Alert severity="info">No inspection templates found. Create one to get started.</Alert>
          </Box>
        )}
      </TableContainer>

      <TemplateDialog
        open={dialogOpen}
        mode={dialogMode}
        template={dialogTemplate}
        saving={saving}
        onClose={closeDialog}
        onSave={handleSave}
      />
    </Stack>
  )
}

function TemplateDialog({ open, mode, template, onClose, onSave, saving }) {
  const readOnly = mode === 'view'
  const title = mode === 'edit' ? 'Edit inspection template' : mode === 'view' ? 'View inspection template' : 'Create inspection template'
  const [draft, setDraft] = useState(() => normalizeTemplate(template))

  useEffect(() => {
    setDraft(normalizeTemplate(template))
  }, [template, open])

  const sortedCategories = useMemo(
    () => [...draft.categories].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0)),
    [draft.categories]
  )

  const categoryItems = (categoryKey) =>
    draft.items.filter((item) => item.categoryKey === categoryKey)

  const updateDraft = (patch) => {
    setDraft((prev) => ({ ...prev, ...patch }))
  }

  const updateCategory = (key, patch) => {
    updateDraft({
      categories: draft.categories.map((cat) => (cat.key === key ? { ...cat, ...patch } : cat)),
    })
  }

  const updateItem = (key, patch) => {
    updateDraft({
      items: draft.items.map((item) => (item.key === key ? { ...item, ...patch } : item)),
    })
  }

  const addCategory = () => {
    const key = createKey('cat')
    const next = {
      key,
      label: `Category ${draft.categories.length + 1}`,
      order: draft.categories.length + 1,
    }
    updateDraft({ categories: [...draft.categories, next] })
  }

  const removeCategory = (key) => {
    updateDraft({
      categories: draft.categories.filter((cat) => cat.key !== key),
      items: draft.items.filter((item) => item.categoryKey !== key),
    })
  }

  const addItem = (categoryKey) => {
    const itemsInCategory = draft.items.filter((item) => item.categoryKey === categoryKey)
    const next = {
      key: createKey('item'),
      categoryKey,
      label: `Item ${itemsInCategory.length + 1}`,
      photoRequired: false,
      photoRequiredOnFail: false,
      notesRequired: false,
      notesRequiredOnFail: false,
      enableRiskLevel: false,
    }
    updateDraft({ items: [...draft.items, next] })
  }

  const removeItem = (key) => {
    updateDraft({
      items: draft.items.filter((item) => item.key !== key),
    })
  }

  const canSave = !readOnly && draft.name.trim().length > 0

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers sx={{ maxHeight: '80vh' }}>
        <Stack spacing={2}>
          <TextField
            label="Template name"
            value={draft.name}
            required
            disabled={readOnly}
            onChange={(e) => updateDraft({ name: e.target.value })}
          />
          <TextField
            label="Description"
            value={draft.description}
            onChange={(e) => updateDraft({ description: e.target.value })}
            disabled={readOnly}
            multiline
            minRows={2}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={draft.requirePOI}
                  onChange={(e) => updateDraft({ requirePOI: e.target.checked })}
                  disabled={readOnly}
                />
              }
              label="Require POI selection"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={draft.requireSignature}
                  onChange={(e) => updateDraft({ requireSignature: e.target.checked })}
                  disabled={readOnly}
                />
              }
              label="Require signature"
            />
          </Stack>

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1">Categories & items</Typography>
            {!readOnly && (
              <Button startIcon={<AddIcon />} size="small" onClick={addCategory}>
                Add category
              </Button>
            )}
          </Stack>

          {!sortedCategories.length && (
            <Alert severity="info">Add at least one category to start defining inspection items.</Alert>
          )}

          {sortedCategories.map((category) => (
            <Accordion key={category.key} defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ width: '100%' }}>
                  <Typography sx={{ flex: 1 }}>
                    {category.label || 'Untitled category'}{' '}
                    <Typography component="span" variant="caption" color="text.secondary">
                      (Order: {category.order ?? 'n/a'})
                    </Typography>
                  </Typography>
                  {!readOnly && (
                    <Tooltip title="Remove category">
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); removeCategory(category.key) }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      label="Category label"
                      value={category.label}
                      onChange={(e) => updateCategory(category.key, { label: e.target.value })}
                      disabled={readOnly}
                      fullWidth
                    />
                    <TextField
                      label="Order"
                      type="number"
                      value={category.order ?? ''}
                      onChange={(e) => updateCategory(category.key, { order: Number(e.target.value) })}
                      disabled={readOnly}
                      sx={{ width: 160 }}
                    />
                  </Stack>
                  <Stack spacing={1}>
                    {categoryItems(category.key).map((item) => (
                      <Paper key={item.key} variant="outlined" sx={{ p: 2 }}>
                        <Stack spacing={1}>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                            <TextField
                              label="Item label"
                              value={item.label}
                              onChange={(e) => updateItem(item.key, { label: e.target.value })}
                              disabled={readOnly}
                              fullWidth
                            />
                            {!readOnly && (
                              <Tooltip title="Remove item">
                                <IconButton onClick={() => removeItem(item.key)}>
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Stack>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={!!item.photoRequired}
                                  onChange={(e) => updateItem(item.key, { photoRequired: e.target.checked })}
                                  disabled={readOnly}
                                />
                              }
                              label="Photo required"
                            />
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={!!item.photoRequiredOnFail}
                                  onChange={(e) => updateItem(item.key, { photoRequiredOnFail: e.target.checked })}
                                  disabled={readOnly}
                                />
                              }
                              label="Photo required on fail"
                            />
                          </Stack>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={!!item.notesRequired}
                                  onChange={(e) => updateItem(item.key, { notesRequired: e.target.checked })}
                                  disabled={readOnly}
                                />
                              }
                              label="Notes required"
                            />
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={!!item.notesRequiredOnFail}
                                  onChange={(e) => updateItem(item.key, { notesRequiredOnFail: e.target.checked })}
                                  disabled={readOnly}
                                />
                              }
                              label="Notes required on fail"
                            />
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={!!item.enableRiskLevel}
                                  onChange={(e) => updateItem(item.key, { enableRiskLevel: e.target.checked })}
                                  disabled={readOnly}
                                />
                              }
                              label="Enable risk level"
                            />
                          </Stack>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                  {!readOnly && (
                    <Button
                      startIcon={<AddIcon />}
                      size="small"
                      variant="outlined"
                      onClick={() => addItem(category.key)}
                    >
                      Add item
                    </Button>
                  )}
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          {readOnly ? 'Close' : 'Cancel'}
        </Button>
        {!readOnly && (
          <AsyncButton onClick={() => onSave(draft)} loading={saving} disabled={!canSave}>
            Save template
          </AsyncButton>
        )}
      </DialogActions>
    </Dialog>
  )
}

function normalizeTemplate(input) {
  if (!input) return { ...emptyTemplate }
  return {
    _id: input._id,
    name: input.name || '',
    description: input.description || '',
    requirePOI: !!input.requirePOI,
    requireSignature: !!input.requireSignature,
    categories: Array.isArray(input.categories)
      ? input.categories.map((cat, idx) => ({
          key: cat.key || createKey('cat'),
          label: cat.label || `Category ${idx + 1}`,
          order:
            typeof cat.order === 'number'
              ? cat.order
              : typeof cat.order === 'string'
              ? Number(cat.order) || idx + 1
              : idx + 1,
        }))
      : [],
    items: Array.isArray(input.items)
      ? input.items.map((item, idx) => ({
          key: item.key || createKey('item'),
          categoryKey: item.categoryKey,
          label: item.label || `Item ${idx + 1}`,
          photoRequired: !!item.photoRequired,
          photoRequiredOnFail: !!item.photoRequiredOnFail,
          notesRequired: !!item.notesRequired,
          notesRequiredOnFail: !!item.notesRequiredOnFail,
          enableRiskLevel: !!item.enableRiskLevel,
        }))
      : [],
  }
}
