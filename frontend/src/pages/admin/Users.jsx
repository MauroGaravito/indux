import React, { useEffect, useState } from 'react'
import { Card, CardContent, Typography, Table, TableHead, TableBody, TableRow, TableCell, Stack, TextField, MenuItem, Button, Chip, Dialog, CardHeader } from '@mui/material'
import api from '../../utils/api.js'

export default function Users() {
  const [rows, setRows] = useState([])
  const [filter, setFilter] = useState('') // '', pending, approved, disabled
  const [newUser, setNewUser] = useState({ email: '', name: '', role: 'worker', password: '' })
  const [assignOpen, setAssignOpen] = useState(false)
  const [assignUser, setAssignUser] = useState(null)
  const [projects, setProjects] = useState([])
  const [projectId, setProjectId] = useState('')
  const [roleInProject, setRoleInProject] = useState('worker')

  const load = async () => { const r = await api.get('/users', { params: { status: filter || undefined } }); setRows(r.data || []) }
  useEffect(()=> { load() }, [])
  useEffect(()=> { load() }, [filter])

  const add = async () => {
    // Allow creation without password: backend will generate a temporary one if missing
    if (!newUser.email || !newUser.name) return
    await api.post('/users', newUser)
    setNewUser({ email: '', name: '', role: 'worker', password: '' })
    await load()
  }
  const toggle = async (u) => {
    await api.put(`/users/${u._id}`, { disabled: !u.disabled })
    await load()
  }
  const setStatus = async (u, status) => {
    await api.patch(`/users/${u._id}/status`, { status })
    await load()
  }
  const removeUser = async (u) => {
    const ok = window.confirm(`Delete user ${u.email}? This action cannot be undone.`)
    if (!ok) return
    await api.delete(`/users/${u._id}`)
    await load()
  }
  const openAssign = async (u) => {
    setAssignUser(u)
    setProjectId('')
    setRoleInProject('worker')
    try { const r = await api.get('/projects'); setProjects(r.data || []) } catch { setProjects([]) }
    setAssignOpen(true)
  }
  const doAssign = async () => {
    if (!assignUser || !projectId) return
    await api.post('/assignments', { user: assignUser._id, project: projectId, role: roleInProject })
    setAssignOpen(false)
  }

  return (
    <>
      <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3 }}>
        <CardContent>
          <Stack direction={{ xs:'column', sm:'row' }} alignItems={{ xs:'flex-start', sm:'center' }} spacing={1} sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Users</Typography>
            <TextField size="small" select label="Filter" value={filter} onChange={(e)=> setFilter(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="disabled">Disabled</MenuItem>
            </TextField>
          </Stack>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r._id}>
                  <TableCell>{r.email}</TableCell>
                  <TableCell>{r.name}</TableCell>
                  <TableCell sx={{ textTransform: 'capitalize' }}>{r.role}</TableCell>
                  <TableCell>
                    {r.status === 'pending' && <Chip size="small" color="warning" label="Pending"/>}
                    {r.status === 'approved' && <Chip size="small" color="success" label="Approved"/>}
                    {r.status === 'disabled' && <Chip size="small" color="default" label="Disabled"/>}
                    {r.emailVerified === false && <Chip size="small" color="warning" label="Email Unverified" sx={{ ml: 1 }}/>}                
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      {r.status === 'pending' && <Button size="small" variant="outlined" onClick={()=> setStatus(r, 'approved')}>Approve</Button>}
                      {r.status !== 'disabled' && <Button size="small" variant="outlined" color="warning" onClick={()=> setStatus(r, 'disabled')}>Disable</Button>}
                      {r.status === 'approved' && <Button size="small" variant="outlined" onClick={()=> openAssign(r)}>Assign Projects</Button>}
                      <Button size="small" color="error" variant="outlined" onClick={()=> removeUser(r)}>Delete</Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Add User</Typography>
          <Stack direction={{ xs:'column', sm:'row' }} spacing={1}>
            <TextField size="small" label="Email" value={newUser.email} onChange={e=> setNewUser({ ...newUser, email: e.target.value })} />
            <TextField size="small" label="Name" value={newUser.name} onChange={e=> setNewUser({ ...newUser, name: e.target.value })} />
            <TextField size="small" label="Role" select value={newUser.role} onChange={e=> setNewUser({ ...newUser, role: e.target.value })}>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="manager">Manager</MenuItem>
              <MenuItem value="worker">Worker</MenuItem>
            </TextField>
            <TextField size="small" label="Password" type="password" value={newUser.password} onChange={e=> setNewUser({ ...newUser, password: e.target.value })} />
            <Button variant="contained" onClick={add}>Create</Button>
          </Stack>
        </CardContent>
      </Card>

      <Dialog open={assignOpen} onClose={()=> setAssignOpen(false)} maxWidth="sm" fullWidth>
        <CardHeader title={<Typography variant="subtitle1">Assign Projects</Typography>} />
        <CardContent>
          <Stack spacing={2}>
            <TextField select label="Project" value={projectId} onChange={(e)=> setProjectId(e.target.value)}>
              {projects.map(p => (
                <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>
              ))}
            </TextField>
            <TextField select label="Role in project" value={roleInProject} onChange={(e)=> setRoleInProject(e.target.value)}>
              <MenuItem value="worker">Worker</MenuItem>
              <MenuItem value="manager">Manager</MenuItem>
            </TextField>
          </Stack>
        </CardContent>
        <Stack direction="row" spacing={1} sx={{ px: 2, pb: 2, justifyContent: 'flex-end' }}>
          <Button onClick={()=> setAssignOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={!projectId} onClick={doAssign}>Assign</Button>
        </Stack>
      </Dialog>
    </>
  )
}

