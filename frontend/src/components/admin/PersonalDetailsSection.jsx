import React from 'react'
import { Stack, TextField, Typography, MenuItem } from '@mui/material'

export default function PersonalDetailsSection({ value, onChange }) {
  const v = value || {}
  const set = (k, val) => onChange({ ...v, [k]: val })

  return (
    <Stack spacing={2}>
      <Typography variant="h6">Section 2 – Personal Details</Typography>
      <TextField label="Name" value={v.name||''} onChange={e=> set('name', e.target.value)} />
      <TextField label="Date of Birth" type="date" InputLabelProps={{ shrink: true }} value={v.dob||''} onChange={e=> set('dob', e.target.value)} />
      <TextField label="Address" value={v.address||''} onChange={e=> set('address', e.target.value)} />
      <TextField label="Phone" value={v.phone||''} onChange={e=> set('phone', e.target.value)} />
      <TextField label="Medical Issues" multiline minRows={3} value={v.medicalIssues||''} onChange={e=> set('medicalIssues', e.target.value)} />
      <TextField label="Next of Kin" value={v.nextOfKin||''} onChange={e=> set('nextOfKin', e.target.value)} />
      <TextField label="Next of Kin Phone" value={v.nextOfKinPhone||''} onChange={e=> set('nextOfKinPhone', e.target.value)} />
      <TextField label="Is Indigenous" select value={v.isIndigenous||''} onChange={e=> set('isIndigenous', e.target.value)}>
        <MenuItem value="Yes">Yes</MenuItem>
        <MenuItem value="No">No</MenuItem>
        <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
      </TextField>
      <TextField label="Is Apprentice" select value={v.isApprentice||''} onChange={e=> set('isApprentice', e.target.value)}>
        <MenuItem value="Yes">Yes</MenuItem>
        <MenuItem value="No">No</MenuItem>
      </TextField>
    </Stack>
  )
}

