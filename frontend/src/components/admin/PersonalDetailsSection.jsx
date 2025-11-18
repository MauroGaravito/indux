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
import PersonIcon from '@mui/icons-material/Person'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import DeleteIcon from '@mui/icons-material/Delete'

export default function PersonalDetailsSection({ fields, onChange }) {
  const list = Array.isArray(fields) ? fields : []
  const accent = '#1976d2'

  const setField = (idx, patch) => {
    onChange(list.map((f, i) => (i === idx ? { ...f, ...patch } : f)))
  }

  const addField = () => {
    const nextKey = `field_${list.length + 1}`
    onChange([
      ...list,
      { key: nextKey, label: 'New Field', type: 'text', required: false, order: list.length + 1, step: 'personal' }
    ])
  }

  const removeField = (idx) => onChange(list.filter((_, i) => i !== idx))

  return (
    <Card elevation={1} sx={{ borderRadius: 2, bgcolor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <CardHeader
        avatar={<PersonIcon sx={{ color: accent }} />}
        title={<Typography variant="h6" sx={{ fontWeight: 600 }}>Fields (Induction Module)</Typography>}
        subheader={<Typography variant="body2" color="text.secondary">Key/label/type stored in InductionModuleField.</Typography>}
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
                <Grid item xs={12} md={3}>
                  <TextField fullWidth label="Key" value={f.key || ''} onChange={(e) => setField(idx, { key: e.target.value })} />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField fullWidth label="Label" value={f.label || ''} onChange={(e) => setField(idx, { label: e.target.value })} />
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
                <Grid item xs={12}>
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
