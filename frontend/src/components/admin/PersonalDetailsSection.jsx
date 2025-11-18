import React from 'react'
import {
  Card,
  CardHeader,
  CardContent,
  Stack,
  TextField,
  Checkbox,
  FormControlLabel,
  IconButton,
  Button,
  Typography,
  Paper,
  Grid
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import PersonIcon from '@mui/icons-material/Person'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import DeleteIcon from '@mui/icons-material/Delete'

// Helper to generate a camelCase key from a label
const toCamelKey = (label) => {
  if (!label) return ''
  const clean = label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9 ]/g, ' ')
    .trim()
  if (!clean) return ''
  const parts = clean.split(/\s+/)
  const [first, ...rest] = parts
  return [first.toLowerCase(), ...rest.map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())].join('')
}

const makeUniqueKey = (base, existingKeys) => {
  if (!base) return ''
  if (!existingKeys.includes(base)) return base
  let counter = 2
  let candidate = `${base}${counter}`
  while (existingKeys.includes(candidate)) {
    counter += 1
    candidate = `${base}${counter}`
  }
  return candidate
}

export default function PersonalDetailsSection({ fields, onChange }) {
  const list = Array.isArray(fields) ? fields : []
  const theme = useTheme()
  const accent = theme.palette.primary.main

  const existingKeys = (excludeIdx) =>
    list
      .filter((_, i) => i !== excludeIdx)
      .map((f) => f.key)
      .filter(Boolean)

  const setField = (idx, patch) => {
    onChange(list.map((f, i) => (i === idx ? { ...f, ...patch } : f)))
  }

  const addField = () => {
    onChange([
      ...list,
      { key: '', label: '', type: 'text', required: false, order: list.length + 1, step: 'personal' }
    ])
  }

  const removeField = (idx) => onChange(list.filter((_, i) => i !== idx))

  return (
    <Card elevation={1} sx={{ borderRadius: 2, bgcolor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <CardHeader
        avatar={<PersonIcon sx={{ color: accent }} />}
        title={<Typography variant="h6" sx={{ fontWeight: 600 }}>Fields (Induction Module)</Typography>}
        subheader={<Typography variant="body2" color="text.secondary">Key is auto-generated; user edits label/type/step.</Typography>}
        sx={{ pb: 0 }}
      />
      <CardContent>
        <Stack spacing={2}>
          <Button startIcon={<AddCircleOutlineIcon />} variant="outlined" onClick={addField} sx={{ textTransform: 'none', alignSelf: 'flex-start' }}>
            Add Field
          </Button>

          {list.map((f, idx) => (
            <Paper key={f.key || idx} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Label"
                    value={f.label || ''}
                    onChange={(e) => {
                      const nextLabel = e.target.value
                      if (!f.key) {
                        const base = toCamelKey(nextLabel)
                        const unique = makeUniqueKey(base, existingKeys(idx))
                        setField(idx, { label: nextLabel, key: unique })
                      } else {
                        setField(idx, { label: nextLabel })
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    select
                    label="Type"
                    value={f.type || 'text'}
                    onChange={(e) => setField(idx, { type: e.target.value })}
                    SelectProps={{ native: true }}
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="select">Select</option>
                    <option value="file">File</option>
                    <option value="textarea">Textarea</option>
                    <option value="boolean">Boolean</option>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    label="Step"
                    value={f.step || 'personal'}
                    onChange={(e) => setField(idx, { step: e.target.value })}
                    helperText="Grouping/step key"
                  />
                </Grid>

                <Grid item xs={12} md={1}>
                  <TextField
                    type="number"
                    fullWidth
                    label="Order"
                    value={f.order ?? idx + 1}
                    onChange={(e) => setField(idx, { order: Number(e.target.value) })}
                  />
                </Grid>

                <Grid item xs={12} md={1}>
                  <FormControlLabel
                    control={<Checkbox checked={!!f.required} onChange={(e) => setField(idx, { required: e.target.checked })} />}
                    label="Required"
                  />
                </Grid>

                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    label="Options (comma separated)"
                    value={(f.options || []).join(', ')}
                    onChange={(e) => setField(idx, { options: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                    disabled={f.type !== 'select'}
                  />
                </Grid>

                <Grid item xs={12} md={1}>
                  <IconButton color="error" onClick={() => removeField(idx)}>
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </Paper>
          ))}
        </Stack>
      </CardContent>
    </Card>
  )
}
