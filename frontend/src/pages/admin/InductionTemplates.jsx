import React, { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import api from '../../utils/api.js'
import AsyncButton from '../../components/AsyncButton.jsx'
import { useNavigate } from 'react-router-dom'

export default function InductionTemplates() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [newTemplate, setNewTemplate] = useState({ name: '', description: '' })
  const [creating, setCreating] = useState(false)
  const navigate = useNavigate()

  const loadTemplates = async () => {
    setLoading(true)
    setError('')
    try {
      const resp = await api.get('/induction-templates')
      setTemplates(resp.data?.templates || [])
    } catch (e) {
      setError(e?.response?.data?.error || 'Unable to load templates')
      setTemplates([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadTemplates() }, [])

  const openTemplate = (id) => {
    navigate(`/admin/templates/${id}`)
  }

  const handleCreate = async () => {
    if (!newTemplate.name.trim()) return
    setCreating(true)
    try {
      const resp = await api.post('/induction-templates', {
        name: newTemplate.name.trim(),
        description: newTemplate.description || undefined
      })
      setCreateOpen(false)
      setNewTemplate({ name: '', description: '' })
      await loadTemplates()
      if (resp.data?._id) {
        navigate(`/admin/templates/${resp.data._id}`)
      }
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'Failed to create template')
    } finally {
      setCreating(false)
    }
  }

  const deleteTemplate = async (id) => {
    const confirmed = window.confirm('Delete this template? This cannot be undone.')
    if (!confirmed) return
    try {
      await api.delete(`/induction-templates/${id}`)
      await loadTemplates()
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to delete template')
    }
  }

  return (
    <Stack spacing={2}>
      <Card elevation={1}>
        <CardHeader
          title="Induction templates"
          action={<Button startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>New template</Button>}
        />
        <CardContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {loading && <Alert severity="info">Loading templates...</Alert>}
          {!loading && !templates.length && <Alert severity="info">No templates have been created yet.</Alert>}
          <List>
            {templates.map((tpl) => (
              <ListItemButton key={tpl._id} onClick={() => openTemplate(tpl._id)}>
                <ListItemText
                  primary={<Typography sx={{ fontWeight: 600 }}>{tpl.name}</Typography>}
                  secondary={tpl.description || 'No description'}
                />
                <IconButton edge="end" onClick={(e) => { e.stopPropagation(); deleteTemplate(tpl._id) }}>
                  <DeleteIcon />
                </IconButton>
              </ListItemButton>
            ))}
          </List>
        </CardContent>
      </Card>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create template</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              label="Template name"
              value={newTemplate.name}
              onChange={(e) => setNewTemplate((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
            <TextField
              label="Description"
              value={newTemplate.description}
              onChange={(e) => setNewTemplate((prev) => ({ ...prev, description: e.target.value }))}
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)} disabled={creating}>Cancel</Button>
          <AsyncButton onClick={handleCreate} loading={creating} disabled={!newTemplate.name.trim()}>
            Create
          </AsyncButton>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
