import React from 'react'
import { Stack, TextField, Typography, MenuItem, IconButton, Button } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'

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

  return (
    <Stack spacing={2}>
      <Typography variant="h6">Section 2 – Personal Details (Configure Fields)</Typography>
      <Typography variant="body2">Set fields to Required/Optional. Add extra fields and choose the response type.</Typography>
      {fields.map((f, idx) => (
        <Stack key={f.key} direction="row" spacing={1} alignItems="center">
          <TextField label="Field Name" value={f.label} onChange={e=> setField(idx, { label: e.target.value })} disabled={!!f.builtin} sx={{ minWidth: 220 }} />
          <TextField label="Type" select value={f.type} onChange={e=> setField(idx, { type: e.target.value })} disabled={!!f.builtin} sx={{ width: 200 }}>
            <MenuItem value="text">Text</MenuItem>
            <MenuItem value="image">Image Upload</MenuItem>
            <MenuItem value="camera">Camera Input</MenuItem>
            {f.builtin && (
              <MenuItem value={f.type}>{String(f.type).charAt(0).toUpperCase()+String(f.type).slice(1)} (builtin)</MenuItem>
            )}
          </TextField>
          <TextField label="Requirement" select value={f.required ? 'required' : 'optional'} onChange={e=> setField(idx, { required: e.target.value === 'required' })} sx={{ width: 160 }}>
            <MenuItem value="required">Required</MenuItem>
            <MenuItem value="optional">Optional</MenuItem>
          </TextField>
          {!f.builtin && (
            <IconButton color="error" onClick={()=> removeField(idx)}><DeleteIcon /></IconButton>
          )}
        </Stack>
      ))}
      <Button variant="outlined" onClick={addField}>Add Field</Button>
    </Stack>
  )
}

