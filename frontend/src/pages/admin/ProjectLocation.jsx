import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SaveIcon from '@mui/icons-material/Save'
import api from '../../utils/api.js'
import ProjectMapEditor from '../../components/admin/ProjectMapEditor.jsx'
import { DEFAULT_MAP_ZOOM, DEFAULT_PROJECT_LOCATION } from '../../constants/location.js'

export default function ProjectLocation() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [projectName, setProjectName] = useState('')
  const [location, setLocation] = useState({ ...DEFAULT_PROJECT_LOCATION })
  const [mapZoom, setMapZoom] = useState(DEFAULT_MAP_ZOOM)
  const [pointsOfInterest, setPointsOfInterest] = useState([])

  useEffect(() => {
    loadProject()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  const loadProject = async () => {
    if (!projectId) {
      setError('Missing project id.')
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    setSuccessMsg('')
    try {
      const res = await api.get('/projects', { params: { includeArchived: true } })
      const list = res.data || []
      const project = list.find((p) => p._id === projectId)
      if (!project) {
        setError('Project not found or you do not have access.')
        setProjectName('')
      } else {
        setProjectName(project.name || 'Project')
        setLocation(
          project.location && typeof project.location.lat === 'number' && typeof project.location.lng === 'number'
            ? project.location
            : { ...DEFAULT_PROJECT_LOCATION }
        )
        setMapZoom(typeof project.mapZoom === 'number' ? project.mapZoom : DEFAULT_MAP_ZOOM)
        setPointsOfInterest(Array.isArray(project.pointsOfInterest) ? project.pointsOfInterest : [])
      }
    } catch (e) {
      setError(e?.response?.data?.error || 'Unable to load project location.')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!projectId) return
    setSaving(true)
    setError('')
    setSuccessMsg('')
    try {
      await api.put(`/projects/${projectId}`, {
        location,
        mapZoom,
        pointsOfInterest,
      })
      setSuccessMsg('Project location updated.')
    } catch (e) {
      setError(e?.response?.data?.error || 'Unable to save project location.')
    } finally {
      setSaving(false)
    }
  }

  const handleBack = () => {
    if (projectId) {
      navigate(`/admin/projects/${projectId}`)
    } else {
      navigate('/admin/projects')
    }
  }

  return (
    <Box sx={{ minHeight: 'calc(100vh - 80px)', overflowY: 'auto', px: { xs: 1, sm: 2 }, py: 2 }}>
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, flex: 1 }}>
            {projectName ? `${projectName} — Full map view` : 'Project location'}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button startIcon={<ArrowBackIcon />} variant="outlined" onClick={handleBack}>
              Back to project
            </Button>
            <Button
              startIcon={<SaveIcon />}
              variant="contained"
              onClick={handleSave}
              disabled={saving || loading}
            >
              {saving ? 'Saving...' : 'Save changes'}
            </Button>
          </Stack>
        </Stack>

        {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
        {successMsg && <Alert severity="success" onClose={() => setSuccessMsg('')}>{successMsg}</Alert>}

        <Box
          sx={{
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            minHeight: { xs: 360, sm: 520, md: 640 },
            width: '100%',
          }}
        >
          {loading ? (
            <Stack alignItems="center" justifyContent="center" sx={{ height: '100%' }}>
              <CircularProgress />
            </Stack>
          ) : (
            <ProjectMapEditor
              canEdit
              location={location}
              mapZoom={mapZoom}
              pointsOfInterest={pointsOfInterest}
              onLocationChange={setLocation}
              onZoomChange={setMapZoom}
              onPointsChange={setPointsOfInterest}
            />
          )}
        </Box>
      </Stack>
    </Box>
  )
}
