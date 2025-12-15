import React, { useEffect, useState } from 'react'
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Typography
} from '@mui/material'
import AsyncButton from './AsyncButton.jsx'

export default function WorkerModuleAssignmentDialog({
  open,
  workerName = '',
  modules = [],
  initialSelection = [],
  onClose,
  onSubmit,
  loading = false
}) {
  const [selectedIds, setSelectedIds] = useState(initialSelection)

  useEffect(() => {
    if (open) {
      setSelectedIds(initialSelection)
    }
  }, [open, initialSelection])

  const toggleModule = (moduleId, checked) => {
    setSelectedIds((prev) => {
      if (checked) {
        if (prev.includes(moduleId)) return prev
        return [...prev, moduleId]
      }
      return prev.filter((id) => id !== moduleId)
    })
  }

  const handleSave = () => {
    onSubmit?.(selectedIds)
  }

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Assign induction modules</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography variant="body2">
            Select which modules {workerName || 'this worker'} must complete. Leave everything unchecked to allow access to all modules in the project.
          </Typography>
          <Alert severity="info">Unchecked modules = worker can access every induction module.</Alert>
          {modules.length === 0 && (
            <Alert severity="warning">This project does not have induction modules yet.</Alert>
          )}
          {modules.map((mod) => {
            const modId = String(mod._id || mod.id)
            const checked = selectedIds.includes(modId)
            return (
              <FormControlLabel
                key={modId}
                control={
                  <Checkbox
                    checked={checked}
                    onChange={(e) => toggleModule(modId, e.target.checked)}
                  />
                }
                label={`${mod.name || 'Induction module'} (${mod.reviewStatus || 'draft'})`}
              />
            )
          })}
          {!modules.length && (
            <Typography variant="body2" color="text.secondary">
              You can still save to keep the worker ready once modules are created.
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <AsyncButton variant="contained" onClick={handleSave} loading={loading}>
          Save
        </AsyncButton>
      </DialogActions>
    </Dialog>
  )
}
