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
  Paper,
  Checkbox,
  FormControlLabel
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import PersonIcon from '@mui/icons-material/Person'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'

// =========================================================
// PersonalDetailsSection (Admin)
// Fully customizable personal details for a project.
// Persists to project.config.personalDetails.fields via onChange.
//
// Field model:
//   { label: string, type: 'text'|'number'|'date'|'select'|'textarea', required: boolean }
// =========================================================

const DEFAULT_FIELDS = [
  { label: 'Full Name', type: 'text', required: true },
  { label: 'Date of Birth', type: 'date', required: true },
  { label: 'Phone', type: 'text', required: false }
]

export default function PersonalDetailsSection({ value, onChange }) {
  const v = value || {}
  const fields = Array.isArray(v.fields) ? v.fields : []

  const setFields = (next) => onChange({ ...v, fields: next })
  const setField = (idx, patch) => setFields(fields.map((f,i)=> i===idx ? { ...f, ...patch } : f))
  const removeField = (idx) => setFields(fields.filter((_,i)=> i!==idx))
  const addField = () => setFields([ ...fields, { label: 'New Field', type: 'text', required: false } ])

  // Seed defaults only on first mount if there are no fields
  const seededRef = React.useRef(false)
  React.useEffect(() => {
    if (seededRef.current) return
    if (!Array.isArray(v.fields) || v.fields.length === 0) {
      onChange({ ...v, fields: DEFAULT_FIELDS })
    }
    seededRef.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const accent = '#1976d2'

  return (
    <Card elevation={1} sx={{ borderRadius: 2, bgcolor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <CardHeader
        avatar={
          <Box sx={{ bgcolor: 'rgba(25,118,210,0.1)', color: accent, width: 36, height: 36, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PersonIcon fontSize="small" />
          </Box>
        }
        title={<Typography variant="h6" sx={{ fontWeight: 600 }}>Section 2 - Personal Details</Typography>}
        subheader={<Typography variant="body2" color="text.secondary">Customize fields and requirements</Typography>}
        sx={{ pb: 0 }}
      />
      <CardContent>
        <Stack spacing={2}>
          {fields.map((f, idx) => (
            <Paper key={idx} variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: 'divider', '&:hover': { borderColor: accent } }}>
              <Grid container spacing={2} alignItems="center">
                {/* Label */}
                <Grid item xs={12} md={5}>
                  <TextField fullWidth label="Label" value={f.label || ''} onChange={e=> setField(idx, { label: e.target.value })} />
                </Grid>

                {/* Type */}
                <Grid item xs={12} md={3}>
                  <TextField fullWidth label="Type" select value={f.type || 'text'} onChange={e=> setField(idx, { type: e.target.value })}>
                    <MenuItem value="text">Text</MenuItem>
                    <MenuItem value="number">Number</MenuItem>
                    <MenuItem value="date">Date</MenuItem>
                    <MenuItem value="select">Select</MenuItem>
                    <MenuItem value="textarea">Textarea</MenuItem>
                  </TextField>
                </Grid>

                {/* Required */}
                <Grid item xs={12} md={3}>
                  <FormControlLabel
                    control={<Checkbox checked={!!f.required} onChange={(e)=> setField(idx, { required: e.target.checked })} />}
                    label="Required"
                  />
                </Grid>

                {/* Remove */}
                <Grid item xs={12} md={1}>
                  <IconButton color="error" onClick={()=> removeField(idx)} aria-label="Remove field">
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </Paper>
          ))}

          {/* Add Field */}
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

