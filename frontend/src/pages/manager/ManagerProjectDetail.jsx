import React, { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import LockIcon from '@mui/icons-material/Lock'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../utils/api.js'
import CreateModuleDialog from '../../components/admin/CreateModuleDialog.jsx'
import { fetchProjectModules } from '../../utils/modules.js'

export default function ManagerProjectDetail() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [modules, setModules] = useState([])
  const [modulesLoading, setModulesLoading] = useState(false)
  const [selectedModuleId, setSelectedModuleId] = useState('')
  const [error, setError] = useState('')
  const [managerAssignments, setManagerAssignments] = useState([])
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const loadProject = async () => {
    try {
      const response = await api.get('/projects')
      const found = (response.data || []).find((p) => p._id === projectId)
      setProject(found || null)
    } catch (e) {
      setError(e?.response?.data?.error || 'Unable to load project details.')
      setProject(null)
    }
  }

  const loadModules = async () => {
    if (!projectId) {
      setModules([])
      setSelectedModuleId('')
      return
    }
    setModulesLoading(true)
    try {
      const list = await fetchProjectModules(projectId)
      setModules(list)
      if (list.length) {
        setSelectedModuleId((prev) => (prev && list.some((m) => String(m._id) === String(prev)) ? prev : list[0]._id))
      } else {
        setSelectedModuleId('')
      }
    } catch (e) {
      setModules([])
      setSelectedModuleId('')
      if (e?.response?.status === 403) {
        setError('Not authorised to view modules for this project.')
      }
    } finally {
      setModulesLoading(false)
    }
  }

  const loadManagers = async () => {
    try {
      const res = await api.get(`/assignments/project/${projectId}`)
      const managers = (res.data || [])
        .filter((entry) => entry.role === 'manager' && entry.user)
        .map((entry) => ({
          id: entry._id,
          userId: entry.user?._id || entry.user,
          name: entry.user?.name || 'Manager',
          email: entry.user?.email || '',
        }))
      setManagerAssignments(managers)
    } catch (e) {
      setManagerAssignments([])
      if (e?.response?.status === 403) {
        setError('Not authorised to view managers for this project.')
      }
    }
  }

  useEffect(() => {
    loadProject()
    loadModules()
    loadManagers()
  }, [projectId])

  const managers = useMemo(() => {
    if (!managerAssignments.length) return []
    return managerAssignments.map((entry) => {
      const initials = entry.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase() || '')
        .join('') || 'MG'
      return {
        key: entry.id || entry.userId,
        label: entry.name,
        avatar: initials,
        email: entry.email,
      }
    })
  }, [managerAssignments])

  const moduleStatusChip = (status) => {
    const palette = {
      draft: { label: 'Draft', color: 'default' },
      pending: { label: 'Pending review', color: 'warning' },
      approved: { label: 'Approved', color: 'success' },
      declined: { label: 'Declined', color: 'error' },
    }
    return palette[status] || { label: status || 'Draft', color: 'default' }
  }

  const openModule = (targetModuleId) => {
    const idToOpen = targetModuleId || selectedModuleId
    if (idToOpen) navigate(`/manager/projects/${projectId}/module/${idToOpen}`)
  }

  const createModule = () => {
    setCreateDialogOpen(true)
  }

  const handleModuleCreated = (mod) => {
    setCreateDialogOpen(false)
    if (mod?._id) {
      navigate(`/manager/projects/${projectId}/module/${mod._id}`)
    } else {
      loadModules()
    }
  }

  if (error) return <Alert severity="error">{error}</Alert>
  if (!project) return <Alert severity="info">Loading project overview...</Alert>

  const selectedModule = useMemo(
    () => modules.find((m) => String(m._id) === String(selectedModuleId)),
    [modules, selectedModuleId]
  )
  const moduleStatus = moduleStatusChip(selectedModule?.reviewStatus)
  const buttonColor = moduleStatus.color === 'default' ? 'primary' : moduleStatus.color

  return (
    <Card elevation={2} sx={{ borderRadius: 3 }}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{project.name}</Typography>
            <Chip label={project.status} color={project.status === 'active' ? 'success' : project.status === 'archived' ? 'warning' : 'default'} />
          </Stack>
          <Typography variant="body1" color="text.primary">{project.description || 'No description provided yet.'}</Typography>
          {project.address && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <LocationOnIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">{project.address}</Typography>
            </Stack>
          )}
          <Divider />
          <Stack spacing={1}>
            <Typography variant="subtitle2">Assigned managers</Typography>
            {managers.length
              ? (
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {managers.map((mgr) => (
                    <Chip
                      key={mgr.key}
                      avatar={<Avatar sx={{ bgcolor: 'primary.main', width: 24, height: 24 }}>{mgr.avatar}</Avatar>}
                      label={mgr.label}
                      title={mgr.email}
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Stack>
                )
              : (
                <Typography variant="body2" color="text.secondary">No managers have been listed for this project.</Typography>
                )}
          </Stack>
          <Divider />
          <Stack spacing={1}>
            <Typography variant="subtitle2">Induction modules</Typography>
            {modulesLoading && <Alert severity="info">Loading induction modules...</Alert>}
            {!modulesLoading && modules.length === 0 && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center">
                <Typography variant="body2" color="text.secondary">No induction modules configured for this project.</Typography>
                <Button variant="contained" onClick={createModule}>
                  Create induction module
                </Button>
              </Stack>
            )}
            {!modulesLoading && modules.length > 0 && (
              <Stack spacing={1}>
                <TextField
                  select
                  label="Select module"
                  value={selectedModuleId}
                  onChange={(e) => setSelectedModuleId(e.target.value)}
                  helperText="Choose which module to edit or review"
                  SelectProps={{ native: true }}
                >
                  {modules.map((mod) => (
                    <option key={mod._id} value={mod._id}>
                      {mod.name || 'Induction module'} ({moduleStatusChip(mod.reviewStatus).label})
                    </option>
                  ))}
                </TextField>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {modules.map((mod) => {
                    const info = moduleStatusChip(mod.reviewStatus)
                    return <Chip key={mod._id} size="small" label={`${mod.name || 'Module'} - ${info.label}`} color={info.color === 'default' ? 'default' : info.color} />
                  })}
                </Stack>
              </Stack>
            )}
          </Stack>
          <Card elevation={0} sx={{ borderRadius: 2, bgcolor: moduleStatus.color === 'error' ? 'rgba(244, 67, 54, 0.08)' : moduleStatus.color === 'warning' ? 'rgba(255, 152, 0, 0.08)' : moduleStatus.color === 'success' ? 'rgba(76, 175, 80, 0.08)' : 'rgba(0,0,0,0.04)' }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <LockIcon fontSize="small" color={moduleStatus.color === 'default' ? 'disabled' : moduleStatus.color} />
              <Typography variant="body2">
                {selectedModule ? `Selected module status: ${moduleStatus.label}` : 'No induction modules available yet.'}
              </Typography>
            </Stack>
          </Card>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button variant="contained" color={buttonColor} onClick={() => openModule(selectedModuleId)} disabled={!selectedModuleId}>
              Edit selected module
            </Button>
            <Button variant="outlined" onClick={createModule}>
              Create new module
            </Button>
            <Button variant="outlined" onClick={() => navigate(`/manager/projects/${projectId}/team`)}>
              Manage assigned workers
            </Button>
            {selectedModule && <Chip label={moduleStatus.label} color={moduleStatus.color} />}
          </Stack>
          {!selectedModuleId && !modulesLoading && <Alert severity="info">No induction module selected.</Alert>}
        </Stack>
      </CardContent>
      <CreateModuleDialog
        projectId={projectId}
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreated={handleModuleCreated}
      />
    </Card>
  )
}
