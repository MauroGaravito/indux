import React from 'react'
import {
  Card,
  CardHeader,
  CardContent,
  Stack,
  Button,
  Typography,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import PersonIcon from '@mui/icons-material/Person'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import FieldItem from './FieldItem.jsx'

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

const STEP_SUGGESTIONS = ['personal', 'emergency', 'company', 'documents', 'other']

export default function PersonalDetailsSection({ fields, onChange }) {
  const list = Array.isArray(fields) ? fields : []
  const theme = useTheme()
  const accent = theme.palette.primary.main

  const existingKeys = (excludeIdx) =>
    list
      .filter((_, i) => i !== excludeIdx)
      .map((f) => f.key)
      .filter(Boolean)

  const normalizeOrder = (arr) => arr.map((f, idx) => ({ ...f, order: idx + 1 }))

  const updateList = (updater) => {
    const next = updater(list)
    onChange(normalizeOrder(next))
  }

  const setField = (idx, patch) => {
    updateList((prev) => prev.map((f, i) => (i === idx ? { ...f, ...patch } : f)))
  }

  const addField = () => {
    updateList((prev) => [
      ...prev,
      { key: '', label: '', type: 'text', required: false, order: prev.length + 1, step: 'personal' },
    ])
  }

  const removeField = (idx) => updateList((prev) => prev.filter((_, i) => i !== idx))

  const moveField = (from, to) => {
    if (to < 0 || to >= list.length) return
    updateList((prev) => {
      const next = [...prev]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      return next
    })
  }

  const handleLabelChange = (idx, nextLabel) => {
    const target = list[idx]
    if (target && !target.key) {
      const base = toCamelKey(nextLabel)
      const unique = makeUniqueKey(base, existingKeys(idx))
      setField(idx, { label: nextLabel, key: unique })
    } else {
      setField(idx, { label: nextLabel })
    }
  }

  const handleOptionsChange = (idx, value) => {
    const parts = (value || '').split(',').map((s) => s.trim()).filter(Boolean)
    setField(idx, { options: parts })
  }

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
            <FieldItem
              key={f.key || idx}
              field={f}
              index={idx}
              onLabelChange={(val) => handleLabelChange(idx, val)}
              onTypeChange={(val) => setField(idx, { type: val })}
              onStepChange={(val) => setField(idx, { step: val || 'personal' })}
              onRequiredChange={(val) => setField(idx, { required: val })}
              onOptionsChange={(val) => handleOptionsChange(idx, val)}
              onRemove={() => removeField(idx)}
              onMoveUp={() => moveField(idx, idx - 1)}
              onMoveDown={() => moveField(idx, idx + 1)}
              disableMoveUp={idx === 0}
              disableMoveDown={idx === list.length - 1}
              suggestedSteps={STEP_SUGGESTIONS}
            />
          ))}
        </Stack>
      </CardContent>
    </Card>
  )
}
