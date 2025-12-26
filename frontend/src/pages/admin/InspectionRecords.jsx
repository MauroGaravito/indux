import React, { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import api from '../../utils/api.js'
import { fetchInspectionRecords } from '../../utils/inspections.js'

const initialFilters = {
  projectId: '',
  templateId: '',
  userId: '',
  dateFrom: '',
  dateTo: '',
}

const formatDateTime = (value) => {
  if (!value) return '-'
  try {
    return new Date(value).toLocaleString()
  } catch {
    return value
  }
}

const roleLabel = (role) => {
  if (role === 'manager') return 'Manager'
  if (role === 'worker') return 'Worker'
  if (role === 'admin') return 'Admin'
  return role || 'User'
}

export default function InspectionRecords() {
  const navigate = useNavigate()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState(initialFilters)
  const [projects, setProjects] = useState([])
  const [templates, setTemplates] = useState([])
  const [users, setUsers] = useState([])
  const [contextLoading, setContextLoading] = useState(false)

  const appliedParams = useMemo(() => {
    const params = {}
    if (filters.projectId) params.projectId = filters.projectId
    if (filters.templateId) params.templateId = filters.templateId
    if (filters.userId) params.userId = filters.userId
    if (filters.dateFrom) params.dateFrom = filters.dateFrom
    if (filters.dateTo) params.dateTo = filters.dateTo
    return params
  }, [filters])

  useEffect(() => {
    const loadContext = async () => {
      setContextLoading(true)
      try {
        const [projResp, templateResp, usersResp] = await Promise.all([
          api.get('/projects', { params: { includeArchived: true } }),
          api.get('/inspection-templates'),
          api.get('/users'),
        ])
        setProjects(projResp.data || [])
        setTemplates(templateResp.data?.templates || templateResp.data || [])
        setUsers(usersResp.data || [])
      } catch {
        setProjects([])
        setTemplates([])
        setUsers([])
      } finally {
        setContextLoading(false)
      }
    }
    loadContext()
  }, [])

  useEffect(() => {
    const loadRecords = async () => {
      setLoading(true)
      setError('')
      try {
        const list = await fetchInspectionRecords(appliedParams)
        setRecords(list)
      } catch (e) {
        setError(e?.response?.data?.error || e?.message || 'Unable to load inspection records.')
        setRecords([])
      } finally {
        setLoading(false)
      }
    }
    loadRecords()
  }, [appliedParams])

  const handleFilterChange = (field) => (event) => {
    setFilters((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const clearFilters = () => setFilters(initialFilters)

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Inspection records
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Search submitted inspections across every project. Filters apply instantly and the results are read-only.
        </Typography>
      </Box>

      <Paper sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              select
              label="Project"
              fullWidth
              value={filters.projectId}
              onChange={handleFilterChange('projectId')}
            >
              <MenuItem value="">All projects</MenuItem>
              {projects.map((project) => (
                <MenuItem key={project._id} value={project._id}>
                  {project.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select
              label="Template"
              fullWidth
              value={filters.templateId}
              onChange={handleFilterChange('templateId')}
            >
              <MenuItem value="">All templates</MenuItem>
              {templates.map((tpl) => (
                <MenuItem key={tpl._id} value={tpl._id}>
                  {tpl.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select
              label="Executed by"
              fullWidth
              value={filters.userId}
              onChange={handleFilterChange('userId')}
            >
              <MenuItem value="">All users</MenuItem>
              {users.map((usr) => (
                <MenuItem key={usr._id} value={usr._id}>
                  {usr.name || usr.email}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <Stack direction="row" spacing={1} alignItems="center" height="100%">
              <Button variant="outlined" onClick={clearFilters} fullWidth>
                Clear filters
              </Button>
            </Stack>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="Date from"
              type="date"
              fullWidth
              value={filters.dateFrom}
              onChange={handleFilterChange('dateFrom')}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="Date to"
              type="date"
              fullWidth
              value={filters.dateTo}
              onChange={handleFilterChange('dateTo')}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
        {contextLoading && <LinearProgress sx={{ mt: 2 }} />}
      </Paper>

      {error && (
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Submitted inspections
          </Typography>
          {loading && <Typography variant="body2">Refreshingƒ??</Typography>}
        </Stack>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Project</TableCell>
              <TableCell>Template</TableCell>
              <TableCell>Executed by</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.map((record) => {
              const executedBy = record.executedBy || {}
              return (
                <TableRow key={record.id}>
                  <TableCell>{formatDateTime(record.submittedAt)}</TableCell>
                  <TableCell>{record.project?.name || 'Project'}</TableCell>
                  <TableCell>{record.template?.name || 'Inspection template'}</TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography variant="body2">{executedBy.name || 'User'}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {roleLabel(executedBy.role)}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip label={record.status || 'submitted'} color="success" variant="outlined" size="small" />
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => navigate(`/inspection-records/${record.id}`)}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        {!records.length && !loading && (
          <Alert severity="info" sx={{ mt: 2 }}>
            No inspection records match the selected filters.
          </Alert>
        )}
      </Paper>
    </Stack>
  )
}
