import React, { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  TextField,
  Typography,
  Autocomplete,
  Chip
} from '@mui/material'
import api from '../../utils/api.js'
import { useParams } from 'react-router-dom'
import { useAuthStore } from '../../store/auth.js'
import AsyncButton from '../../components/AsyncButton.jsx'
import { fetchProjectModules } from '../../utils/modules.js'
import WorkerModuleAssignmentDialog from '../../components/WorkerModuleAssignmentDialog.jsx'

export default function ManagerTeam() {
  const { projectId } = useParams()
  const { user } = useAuthStore()
  const [assignments, setAssignments] = useState([])
  const [workersPool, setWorkersPool] = useState([])
  const [selectedWorker, setSelectedWorker] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [modules, setModules] = useState([])
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false)
  const [moduleDialogTarget, setModuleDialogTarget] = useState(null)
  const [moduleDialogInitial, setModuleDialogInitial] = useState([])
  const [moduleDialogSaving, setModuleDialogSaving] = useState(false)

  const loadAssignments = async () => {
    setError('')
    try {
      const r = await api.get(`/assignments/project/${projectId}`)
      setAssignments(r.data || [])
    } catch (e) {
      setError(e?.response?.data?.error || 'Unable to load assigned workers.')
      setAssignments([])
    }
  }

  const loadWorkersPool = async () => {
    if (!user?.id) return
    try {
      const r = await api.get(`/assignments/manager/${user.id}/team`)
      const list = r.data || []
      setWorkersPool(list)
    } catch {
      setWorkersPool([])
    }
  }

  const loadModules = async () => {
    if (!projectId) {
      setModules([])
      return
    }
    try {
      const list = await fetchProjectModules(projectId)
      setModules(list)
    } catch {
      setModules([])
    }
  }

  useEffect(() => {
    loadAssignments()
    loadWorkersPool()
    loadModules()
  }, [projectId, user])

  const workers = useMemo(() => assignments.filter((a) => a.role === 'worker'), [assignments])

  const availableWorkers = useMemo(() => {
    const alreadyIds = new Set(workers.map((w) => String(w.user?._id || w.user)))
    return workersPool.filter((w) => !alreadyIds.has(String(w.userId)))
  }, [workers, workersPool])

  const moduleNameMap = useMemo(() => {
    const map = new Map()
    modules.forEach((m) => map.set(String(m._id), m.name || 'Induction module'))
    return map
  }, [modules])

  const addWorker = async () => {
    if (!selectedWorker) return
    setLoading(true)
    try {
      await api.post('/assignments', { user: selectedWorker.userId, project: projectId, role: 'worker' })
      setSelectedWorker(null)
      await loadAssignments()
    } catch (e) {
      setError(e?.response?.data?.error || 'Unable to add worker to this project.')
    } finally {
      setLoading(false)
    }
  }

  const removeWorker = async (assignmentId) => {
    await api.delete(`/assignments/${assignmentId}`)
    await loadAssignments()
  }

  const openModuleDialog = (assignment) => {
    setModuleDialogTarget(assignment)
    setModuleDialogInitial((assignment?.modules || []).map((id) => String(id)))
    setModuleDialogOpen(true)
  }

  const closeModuleDialog = () => {
    if (moduleDialogSaving) return
    setModuleDialogOpen(false)
    setModuleDialogTarget(null)
    setModuleDialogInitial([])
  }

  const saveModuleAssignments = async (moduleIds) => {
    if (!moduleDialogTarget) return
    setModuleDialogSaving(true)
    try {
      await api.put(`/assignments/${moduleDialogTarget._id}/modules`, { modules: moduleIds })
      closeModuleDialog()
      await loadAssignments()
    } catch (e) {
      setError(e?.response?.data?.error || 'Unable to update module assignments.')
    } finally {
      setModuleDialogSaving(false)
    }
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>Assigned workers</Typography>
      {error && <Alert severity="error">{error}</Alert>}

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="subtitle1">Assigned workers</Typography>
            <Grid container spacing={2}>
              {workers.map((w) => {
                const userData = w.user || {}
                const assignedModules = (w.modules || []).map((id) => String(id))
                const assignedLabel = assignedModules.length
                  ? (() => {
                      const names = assignedModules.map((id) => moduleNameMap.get(id) || 'Induction module')
                      const preview = names.slice(0, 3).join(', ')
                      return names.length > 3 ? `${preview} (+${names.length - 3} more)` : preview
                    })()
                  : 'All modules'
                return (
                  <Grid item xs={12} md={6} key={w._id}>
                    <Box
                      sx={{
                        p: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 3,
                        bgcolor: 'background.paper',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      <Box>
                        <Avatar src={userData.avatarUrl} sx={{ width: 56, height: 56, fontSize: 24 }}>
                          {(userData.name || '').charAt(0) || 'W'}
                        </Avatar>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{userData.name || 'Worker'}</Typography>
                        <Typography variant="body2" color="text.secondary">{userData.email || 'No email'}</Typography>
                        {userData.position && (
                          <Chip label={userData.position} size="small" sx={{ mt: 0.5 }} />
                        )}
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          Assigned modules: {assignedLabel}
                        </Typography>
                      </Box>
                      <Stack spacing={1} alignItems="flex-end">
                        <Button variant="outlined" size="small" onClick={() => openModuleDialog(w)}>
                          Assign modules
                        </Button>
                        <Button color="error" size="small" onClick={() => removeWorker(w._id)}>Remove worker</Button>
                      </Stack>
                    </Box>
                  </Grid>
                )
              })}
            </Grid>
            {!workers.length && <Alert severity="info">No workers assigned to this project yet.</Alert>}
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="subtitle1">Add worker to project</Typography>
            <Autocomplete
              options={availableWorkers}
              getOptionLabel={(option) => `${option.name} (${option.email})`}
              value={selectedWorker}
              onChange={(_, value) => setSelectedWorker(value)}
              noOptionsText="No available workers"
              renderInput={(params) => <TextField {...params} label="Select worker" helperText="Workers available across your teams" />}
              disableClearable
            />
            <AsyncButton variant="contained" onClick={addWorker} disabled={!selectedWorker} loading={loading}>Add to project</AsyncButton>
          </Stack>
        </CardContent>
      </Card>
      <WorkerModuleAssignmentDialog
        open={moduleDialogOpen}
        workerName={moduleDialogTarget?.user?.name || ''}
        modules={modules}
        initialSelection={moduleDialogInitial}
        onClose={closeModuleDialog}
        onSubmit={saveModuleAssignments}
        loading={moduleDialogSaving}
      />
    </Stack>
  )
}
