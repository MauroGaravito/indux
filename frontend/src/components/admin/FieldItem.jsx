import React, { useMemo } from 'react'
import {
  Paper,
  Grid,
  TextField,
  Checkbox,
  FormControlLabel,
  IconButton,
  Stack,
  Typography,
  Autocomplete,
  Box
} from '@mui/material'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import DeleteIcon from '@mui/icons-material/Delete'

const typeOptions = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Select' },
  { value: 'file', label: 'File' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'boolean', label: 'Boolean' },
]

export default function FieldItem({
  field,
  index,
  onLabelChange,
  onTypeChange,
  onStepChange,
  onRequiredChange,
  onOptionsChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  disableMoveUp,
  disableMoveDown,
  suggestedSteps = [],
  readOnly = false,
}) {
  const isSelectType = field.type === 'select'
  const optionsText = useMemo(() => (field.options || []).join(', '), [field.options])

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: 'divider', bgcolor: 'background.paper' }}>
      <Stack spacing={1.5}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="subtitle2" sx={{ flex: 1 }}>
            {field.label || 'Untitled field'}
          </Typography>
          <Box>
            <IconButton size="small" onClick={onMoveUp} disabled={disableMoveUp || readOnly}>
              <ArrowUpwardIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={onMoveDown} disabled={disableMoveDown || readOnly}>
              <ArrowDownwardIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" color="error" onClick={onRemove} disabled={readOnly}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Stack>

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Label"
              value={field.label || ''}
              onChange={(e) => onLabelChange(e.target.value)}
              disabled={readOnly}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              select
              label="Type"
              SelectProps={{ native: true }}
              value={field.type || 'text'}
              onChange={(e) => onTypeChange(e.target.value)}
              disabled={readOnly}
            >
              {typeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={3}>
            <Autocomplete
              freeSolo
              options={suggestedSteps}
              value={field.step || 'personal'}
              onChange={(_, val) => onStepChange(val || '')}
              onInputChange={(_, val) => onStepChange(val || '')}
              disabled={readOnly}
              disableClearable={false}
              renderInput={(params) => (
                <TextField {...params} label="Step" helperText="Grouping / step" disabled={readOnly} />
              )}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControlLabel
              control={<Checkbox checked={!!field.required} onChange={(e) => onRequiredChange(e.target.checked)} disabled={readOnly} />}
              label="Required"
            />
          </Grid>

          {isSelectType && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Options (comma separated)"
                value={optionsText}
                onChange={(e) => onOptionsChange(e.target.value)}
                multiline
                minRows={2}
                disabled={readOnly}
              />
            </Grid>
          )}
        </Grid>
      </Stack>
    </Paper>
  )
}
