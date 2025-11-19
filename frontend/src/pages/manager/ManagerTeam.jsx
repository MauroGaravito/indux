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

export default function ManagerTeam() {
  const { projectId } = useParams()
  const { user } = useAuthStore()
  const [assignments, setAssignments] = useState([])
  const [workersPool, setWorkersPool] = useState([])
  const [selectedWorker, setSelectedWorker] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadAssignments = async () => {
    setError('')
    try {
      const r = await api.get(`/assignments/project/${projectId}`)
      setAssignments(r.data || [])
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to load team')
      setAssignments([])
    }
  }

  const loadWorkersPool = async () => {
    if (!user?.sub) return
    try {
      const r = await api.get(`/assignments/manager/${user.sub}/team`)
      const list = r.data || []
      setWorkersPool(list)
    } catch {
      setWorkersPool([])
    }
  }

  useEffect(() => {
    loadAssignments()
    loadWorkersPool()
  }, [projectId, user])

  const workers = useMemo(() => assignments.filter((a) => a.role === 'worker'), [assignments])

  const availableWorkers = useMemo(() => {
    const alreadyIds = new Set(workers.map((w) => String(w.user?._id || w.user)))
    return workersPool.filter((w) => !alreadyIds.has(String(w.userId)))
  }, [workers, workersPool])

  const addWorker = async () => {
    if (!selectedWorker) return
    setLoading(true)
    try {
      await api.post('/assignments', { user: selectedWorker.userId, project: projectId, role: 'worker' })
      setSelectedWorker(null)
      await loadAssignments()
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to add worker')
    } finally {
      setLoading(false)
    }
  }

  const removeWorker = async (assignmentId) => {
    await api.delete(`/assignments/${assignmentId}`)
    await loadAssignments()
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>Team</Typography>
      {error && <Alert severity="error">{error}</Alert>}

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="subtitle1">Current Workers</Typography>
            <Grid container spacing={2}>
              {workers.map((w) => {
                const userData = w.user || {}
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
                      </Box>
                      <Button color="error" onClick={() => removeWorker(w._id)}>Remove</Button>
                    </Box>
                  </Grid>
                )
              })}
            </Grid>
            {!workers.length && <Alert severity="info">No workers assigned yet.</Alert>}
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="subtitle1">Add Worker</Typography>
            <Autocomplete
              options={availableWorkers}
              getOptionLabel={(option) => `${option.name} (${option.email})`}
              value={selectedWorker}
              onChange={(_, value) => setSelectedWorker(value)}
              noOptionsText="No available workers"
              renderInput={(params) => <TextField {...params} label="Select Worker" helperText="Workers available across your teams" />}
              disableClearable
            />
            <AsyncButton variant="contained" onClick={addWorker} disabled={!selectedWorker} loading={loading}>Add to Project</AsyncButton>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
