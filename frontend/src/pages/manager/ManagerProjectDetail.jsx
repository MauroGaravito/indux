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
  Typography
} from '@mui/material'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import LockIcon from '@mui/icons-material/Lock'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../utils/api.js'

export default function ManagerProjectDetail() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [moduleId, setModuleId] = useState('')
  const [error, setError] = useState('')
  const [managerAssignments, setManagerAssignments] = useState([])

  const loadProject = async () => {
    try {
      const response = await api.get('/projects')
      const found = (response.data || []).find((p) => p._id === projectId)
      setProject(found || null)
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to load project')
      setProject(null)
    }
  }

  const loadModule = async () => {
    try {
      const res = await api.get(`/projects/${projectId}/modules/induction`)
      const mod = res.data?.module
      if (mod) {
        setModuleId(mod._id)
        setProject((prev) => (prev ? { ...prev, moduleStatus: mod.reviewStatus } : prev))
      }
    } catch {
      setModuleId('')
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
        setError('Not authorized to view managers for this project.')
      }
    }
  }

  useEffect(() => {
    loadProject()
    loadModule()
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

  const openModule = () => {
    if (moduleId) navigate(`/manager/projects/${projectId}/module/${moduleId}`)
  }

  if (error) return <Alert severity="error">{error}</Alert>
  if (!project) return <Alert severity="info">Loading project...</Alert>

  const moduleStatus = moduleStatusChip(project.moduleStatus)
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
            <Typography variant="subtitle2">Managers</Typography>
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
                <Typography variant="body2" color="text.secondary">Managers not listed for this project.</Typography>
                )}
          </Stack>
          <Divider />
          <Card elevation={0} sx={{ borderRadius: 2, bgcolor: moduleStatus.color === 'error' ? 'rgba(244, 67, 54, 0.08)' : moduleStatus.color === 'warning' ? 'rgba(255, 152, 0, 0.08)' : moduleStatus.color === 'success' ? 'rgba(76, 175, 80, 0.08)' : 'rgba(0,0,0,0.04)' }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <LockIcon fontSize="small" color={moduleStatus.color === 'default' ? 'disabled' : moduleStatus.color} />
              <Typography variant="body2">Module status: {moduleStatus.label}</Typography>
            </Stack>
          </Card>
          <Stack direction="row" spacing={1}>
            <Button variant="contained" color={buttonColor} onClick={openModule} disabled={!moduleId}>Open Module</Button>
            <Button variant="outlined" onClick={() => navigate(`/manager/projects/${projectId}/team`)}>Manage Team</Button>
            <Chip label={moduleStatus.label} color={moduleStatus.color} />
          </Stack>
          {!moduleId && <Alert severity="info">No module created for this project yet.</Alert>}
        </Stack>
      </CardContent>
    </Card>
  )
}
