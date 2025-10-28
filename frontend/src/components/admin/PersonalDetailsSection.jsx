import React from 'react'
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Stack,
  TextField,
  Typography,
  MenuItem,
  IconButton,
  Button,
  Grid,
  Chip,
  Paper
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import PersonIcon from '@mui/icons-material/Person'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'

// Built-in fields are present by default and cannot be removed or retargeted.
const DEFAULT_FIELDS = [
  { key: 'name', label: 'Name', type: 'text', builtin: true },
  { key: 'dob', label: 'Date of Birth', type: 'date', builtin: true },
  { key: 'address', label: 'Address', type: 'text', builtin: true },
  { key: 'phone', label: 'Phone', type: 'text', builtin: true },
  { key: 'medicalIssues', label: 'Medical Issues', type: 'textarea', builtin: true },
  { key: 'nextOfKin', label: 'Next of Kin', type: 'text', builtin: true },
  { key: 'nextOfKinPhone', label: 'Next of Kin Phone', type: 'text', builtin: true },
  { key: 'isIndigenous', label: 'Is Indigenous', type: 'select', options: ['Yes','No','Prefer not to say'], builtin: true },
  { key: 'isApprentice', label: 'Is Apprentice', type: 'select', options: ['Yes','No'], builtin: true }
]

export default function PersonalDetailsSection({ value, onChange }) {
  const v = value || {}
  const fields = Array.isArray(v.fields) ? [...v.fields] : []

  // Ensure default fields exist (non-destructive)
  for (const def of DEFAULT_FIELDS) {
    if (!fields.find(f => f.key === def.key)) {
      fields.push({ ...def, required: false })
    }
  }

  const setFields = (next) => onChange({ ...v, fields: next })
  const setField = (idx, patch) => {
    const next = fields.map((f,i)=> i===idx ? { ...f, ...patch } : f)
    setFields(next)
  }
  const removeField = (idx) => {
    const f = fields[idx]
    if (f.builtin) return
    setFields(fields.filter((_,i)=> i!==idx))
  }
  const addField = () => {
    const key = `custom-${Date.now()}`
    setFields([ ...fields, { key, label: 'New Field', type: 'text', required: false, builtin: false } ])
  }

  const accent = '#1976d2'

  return (
    <Card
      elevation={1}
      sx={{
        borderRadius: 2,
        bgcolor: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }}
    >
      <CardHeader
        avatar={
          <Box sx={{ bgcolor: 'rgba(25,118,210,0.1)', color: accent, width: 36, height: 36, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PersonIcon fontSize="small" />
          </Box>
        }
        title={<Typography variant="h6" sx={{ fontWeight: 600 }}>Section 2 — Personal Details</Typography>}
        subheader={<Typography variant="body2" color="text.secondary">Configure required fields and response types</Typography>}
        sx={{ pb: 0 }}
      />
      <CardContent>
        <Stack spacing={2}>
          {fields.map((f, idx) => (
            <Paper
              key={f.key}
              variant="outlined"
              sx={{ p: 2, borderRadius: 2, borderColor: 'divider', '&:hover': { borderColor: accent } }}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Field Name"
                    value={f.label}
                    onChange={e=> setField(idx, { label: e.target.value })}
                    disabled={!!f.builtin}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Type"
                    select
                    value={f.type}
                    onChange={e=> setField(idx, { type: e.target.value })}
                    disabled={!!f.builtin}
                  >
                    <MenuItem value="text">Text</MenuItem>
                    <MenuItem value="image">Image Upload</MenuItem>
                    <MenuItem value="camera">Camera Input</MenuItem>
                    {f.builtin && (
                      <MenuItem value={f.type}>{String(f.type).charAt(0).toUpperCase()+String(f.type).slice(1)} (builtin)</MenuItem>
                    )}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Requirement"
                    select
                    value={f.required ? 'required' : 'optional'}
                    onChange={e=> setField(idx, { required: e.target.value === 'required' })}
                  >
                    <MenuItem value="required">Required</MenuItem>
                    <MenuItem value="optional">Optional</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {f.builtin && <Chip size="small" label="Builtin" variant="outlined" />}
                    {!f.builtin && (
                      <IconButton color="error" onClick={()=> removeField(idx)} aria-label="Remove field">
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          ))}
          <Box>
            <Button startIcon={<AddCircleOutlineIcon />} variant="outlined" onClick={addField} sx={{ textTransform: 'none' }}>
              Add Field
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}

