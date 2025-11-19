import React, { useEffect, useState } from 'react'
import {
  Card, CardContent, Typography, Table, TableHead, TableBody, TableRow, TableCell,
  Stack, TextField, MenuItem, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material'
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
  const [editUser, setEditUser] = useState(null)

  const load = async () => { const r = await api.get('/users'); setRows(r.data || []) }
  useEffect(()=> { load() }, [])

  const add = async () => {
    if (!newUser.email || !newUser.name) return
    await api.post('/users', newUser)
    setNewUser({ email: '', name: '', role: 'worker', password: '', position: '', phone: '', companyName: '', avatarUrl: '' })
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

  const openEdit = (u) => setEditUser({ ...u, password: '' })
  const closeEdit = () => setEditUser(null)
  const saveEdit = async () => {
    if (!editUser?._id) return
    const payload = { ...editUser }
    if (!payload.password) delete payload.password
    delete payload._id
    await api.put(`/users/${editUser._id}`, payload)
    setEditUser(null)
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
                    <Button size="small" variant="outlined" onClick={()=> openEdit(r)}>Edit</Button>
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

      <Dialog open={!!editUser} onClose={closeEdit} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent dividers>
          {editUser && (
            <Stack spacing={1} sx={{ mt: 1 }}>
              <TextField label="Email" value={editUser.email} onChange={e=> setEditUser({ ...editUser, email: e.target.value })} />
              <TextField label="Name" value={editUser.name} onChange={e=> setEditUser({ ...editUser, name: e.target.value })} />
              <TextField label="Role" select value={editUser.role} onChange={e=> setEditUser({ ...editUser, role: e.target.value })}>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="worker">Worker</MenuItem>
              </TextField>
              <TextField label="Password (leave blank to keep)" type="password" value={editUser.password} onChange={e=> setEditUser({ ...editUser, password: e.target.value })} />
              <TextField label="Position" value={editUser.position || ''} onChange={e=> setEditUser({ ...editUser, position: e.target.value })} />
              <TextField label="Phone" value={editUser.phone || ''} onChange={e=> setEditUser({ ...editUser, phone: e.target.value })} />
              <TextField label="Company Name" value={editUser.companyName || ''} onChange={e=> setEditUser({ ...editUser, companyName: e.target.value })} />
              <TextField label="Avatar URL" value={editUser.avatarUrl || ''} onChange={e=> setEditUser({ ...editUser, avatarUrl: e.target.value })} />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEdit}>Cancel</Button>
          <Button variant="contained" onClick={saveEdit}>Save</Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}
