import React, { useEffect, useState } from 'react'
import { Card, CardContent, Typography, Table, TableHead, TableBody, TableRow, TableCell, Stack, TextField, MenuItem, Button, Chip } from '@mui/material'
import api from '../../utils/api.js'

export default function Users() {
  const [rows, setRows] = useState([])
  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    role: 'worker',
    password: '',
    position: '',
    phone: '',
    companyName: '',
    avatarUrl: '',
  })
  const load = async () => { const r = await api.get('/users'); setRows(r.data || []) }
  useEffect(()=> { load() }, [])

  const add = async () => {
    // Permitir creación sin password: el backend generará una temporal si falta
    if (!newUser.email || !newUser.name) return
    await api.post('/users', newUser)
    setNewUser({
      email: '',
      name: '',
      role: 'worker',
      password: '',
      position: '',
      phone: '',
      companyName: '',
      avatarUrl: '',
    })
    await load()
  }
  const toggle = async (u) => {
    await api.put(`/users/${u._id}`, { disabled: !u.disabled })
    await load()
  }
  const removeUser = async (u) => {
    const ok = window.confirm(`Delete user ${u.email}? This action cannot be undone.`)
    if (!ok) return
    await api.delete(`/users/${u._id}`)
    await load()
  }

  return (
    <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Users</Typography>
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
                <TableCell>{r.disabled ? <Chip size="small" color="warning" label="Disabled"/> : <Chip size="small" color="success" label="Active"/>}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button size="small" variant="outlined" onClick={()=> toggle(r)}>{r.disabled ? 'Enable' : 'Disable'}</Button>
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
          <TextField size="small" label="Position" value={newUser.position} onChange={e=> setNewUser({ ...newUser, position: e.target.value })} />
          <TextField size="small" label="Phone" value={newUser.phone} onChange={e=> setNewUser({ ...newUser, phone: e.target.value })} />
          <TextField size="small" label="Company Name" value={newUser.companyName} onChange={e=> setNewUser({ ...newUser, companyName: e.target.value })} />
          <TextField size="small" label="Avatar URL" value={newUser.avatarUrl} onChange={e=> setNewUser({ ...newUser, avatarUrl: e.target.value })} />
          <Button variant="contained" onClick={add}>Create</Button>
        </Stack>
      </CardContent>
    </Card>
  )
}
