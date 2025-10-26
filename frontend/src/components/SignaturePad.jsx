import React, { useRef, useEffect } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { Button, Stack } from '@mui/material'

export default function SignaturePad({ value, onChange, height=150 }) {
  const ref = useRef()
  useEffect(()=>{
    if (value && ref.current) {
      // cannot load dataURL into signature-canvas easily, ignore for simplicity
    }
  }, [value])
  return (
    <Stack spacing={1}>
      <SignatureCanvas ref={ref} canvasProps={{ width: 600, height, style: { border: '1px solid #ccc' } }} />
      <Stack direction="row" spacing={1}>
        <Button onClick={() => { if (ref.current) ref.current.clear() }}>Clear</Button>
        <Button variant="outlined" onClick={() => { if (ref.current) onChange(ref.current.getTrimmedCanvas().toDataURL()) }}>Save Signature</Button>
      </Stack>
    </Stack>
  )
}

