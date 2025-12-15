import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  FormControlLabel,
  RadioGroup,
  Radio,
  MenuItem,
  Alert,
  Button,
  Typography
} from '@mui/material'
import api from '../../utils/api.js'
import AsyncButton from '../AsyncButton.jsx'

export default function CreateModuleDialog({ projectId, open, onClose, onCreated }) {
  const [mode, setMode] = useState('blank')
  const [templates, setTemplates] = useState([])
  const [templateId, setTemplateId] = useState('')
  const [loadingTemplates, setLoadingTemplates] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (!open) return
    setError('')
    setMode('blank')
    setTemplateId('')
    setName('')
    setDescription('')
    loadTemplates()
  }, [open])

  const loadTemplates = async () => {
    setLoadingTemplates(true)
    try {
      const resp = await api.get('/induction-templates/summaries')
      setTemplates(resp.data?.templates || [])
    } catch (e) {
      setTemplates([])
      setError(e?.response?.data?.error || 'Unable to load templates')
    } finally {
      setLoadingTemplates(false)
    }
  }

  const handleSubmit = async () => {
    if (!projectId) return
    setCreating(true)
    setError('')
    try {
      const payload = {}
      if (name.trim()) payload.name = name.trim()
      if (description.trim()) payload.description = description.trim()
      if (mode === 'template' && templateId) {
        payload.templateId = templateId
      }
      const resp = await api.post(`/projects/${projectId}/modules/induction`, payload)
      onCreated?.(resp.data)
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'Failed to create module')
    } finally {
      setCreating(false)
    }
  }

  const templateDisabled = !templates.length || loadingTemplates

  return (
    <Dialog open={open} onClose={creating ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create induction module</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Module name"
            placeholder="Optional name (e.g., General induction)"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Description"
            placeholder="Short description"
            fullWidth
            multiline
            minRows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <RadioGroup
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <FormControlLabel value="blank" control={<Radio />} label="Start from blank module" />
            <FormControlLabel
              value="template"
              control={<Radio disabled={templateDisabled} />}
              label="Clone from template"
              disabled={templateDisabled}
            />
          </RadioGroup>
          {mode === 'template' && (
            <TextField
              select
              label="Select template"
              fullWidth
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              disabled={templateDisabled}
              helperText={templateDisabled ? 'No templates available yet' : 'Choose a template to clone'}
            >
              {templates.map((tpl) => (
                <MenuItem key={tpl._id} value={tpl._id}>
                  <Stack>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{tpl.name}</Typography>
                    {tpl.description && <Typography variant="caption">{tpl.description}</Typography>}
                  </Stack>
                </MenuItem>
              ))}
            </TextField>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={creating}>Cancel</Button>
        <AsyncButton variant="contained" onClick={handleSubmit} loading={creating} disabled={mode === 'template' && !templateId && !templateDisabled}>
          Create
        </AsyncButton>
      </DialogActions>
    </Dialog>
  )
}
