import React, { useState } from 'react'
import { Stack, Typography, Button, LinearProgress } from '@mui/material'
import { uploadFile } from '../../utils/upload.js'

export default function SlidesSection({ value, onChange }) {
  const v = value || {}
  const set = (k, val) => onChange({ ...v, [k]: val })
  const [localName, setLocalName] = useState('')

  const [progress, setProgress] = useState(null)

  const uploadPPT = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const { key } = await uploadFile('slides/', file, { onProgress: setProgress })
    set('pptKey', key)
    setLocalName(file.name)
    setProgress(null)
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h6">Section 3 – Induction Slides</Typography>
      <Typography variant="body2">Upload a PowerPoint file (.ppt or .pptx). The worker will see slides sequential controls (Next/Prev/Finish). Rendering PPT is stubbed; PDF/images recommended for production.</Typography>
      <Button variant="outlined" component="label">Upload PPT<input hidden type="file" accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation" onChange={uploadPPT} /></Button>
      {progress!=null && <LinearProgress variant="determinate" value={progress} />}
      {(v.pptKey || localName) && <Typography variant="body2">Uploaded: {localName || v.pptKey}</Typography>}
    </Stack>
  )
}
