import React from 'react'
import { Stack, TextField, Typography, Button } from '@mui/material'
import { presign, uploadToPresigned } from '../../utils/upload.js'

export default function ProjectInfoSection({ value, onChange }) {
  const v = value || {}
  const set = (k, val) => onChange({ ...v, [k]: val })

  const uploadMap = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const { key, url } = await presign('maps/')
    await uploadToPresigned(url, file)
    set('projectMapKey', key)
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h6">Section 1 – Project Information</Typography>
      <TextField label="Project Name" required value={v.projectName||''} onChange={e=> set('projectName', e.target.value)} />
      <TextField label="Project Address" required value={v.projectAddress||''} onChange={e=> set('projectAddress', e.target.value)} />
      <TextField label="Project Value" required type="number" value={v.projectValue||''} onChange={e=> set('projectValue', Number(e.target.value))} />
      <Stack direction="row" spacing={2}>
        <Button variant="outlined" component="label">Upload Project Map<input hidden type="file" accept="image/*" onChange={uploadMap} /></Button>
        {v.projectMapKey && <Typography variant="body2">Uploaded: {v.projectMapKey}</Typography>}
      </Stack>
    </Stack>
  )
}

