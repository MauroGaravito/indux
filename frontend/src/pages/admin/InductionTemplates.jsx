import React, { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import VisibilityIcon from '@mui/icons-material/Visibility'
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

  useEffect(() => {
    loadTemplates()
  }, [])

  const openTemplate = (id) => {
    navigate(`/admin/templates/${id}`)
  }

  const handleCreate = async () => {
    if (!newTemplate.name.trim()) return
    setCreating(true)
    try {
      const resp = await api.post('/induction-templates', {
        name: newTemplate.name.trim(),
        description: newTemplate.description || undefined,
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

  const formatDate = (value) => {
    if (!value) return '—'
    try {
      return new Date(value).toLocaleString()
    } catch {
      return value
    }
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Induction templates
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Maintain reusable induction modules that can be cloned straight into projects.
          </Typography>
        </Box>
        <Button startIcon={<AddIcon />} variant="contained" onClick={() => setCreateOpen(true)}>
          New template
        </Button>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}
      {loading && <Alert severity="info">Loading templates...</Alert>}

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Updated</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {templates.map((tpl) => (
              <TableRow key={tpl._id}>
                <TableCell>
                  <Typography sx={{ fontWeight: 600 }}>{tpl.name}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {tpl.description || 'No description provided.'}
                  </Typography>
                </TableCell>
                <TableCell>{formatDate(tpl.updatedAt || tpl.createdAt)}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<VisibilityIcon />}
                      onClick={() => openTemplate(tpl._id)}
                    >
                      Open
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => deleteTemplate(tpl._id)}
                    >
                      Delete
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!loading && !templates.length && (
          <Box sx={{ p: 3 }}>
            <Alert severity="info">No templates have been created yet.</Alert>
          </Box>
        )}
      </TableContainer>

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
          <Button onClick={() => setCreateOpen(false)} disabled={creating}>
            Cancel
          </Button>
          <AsyncButton onClick={handleCreate} loading={creating} disabled={!newTemplate.name.trim()}>
            Create
          </AsyncButton>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
