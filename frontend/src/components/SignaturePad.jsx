import React, { useRef, useEffect } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { Button, Stack, Box } from '@mui/material'

export default function SignaturePad({ value, onChange, height = 150 }) {
  const sigRef = useRef(null)
  const boxRef = useRef(null)

  const resizeCanvas = () => {
    const sig = sigRef.current
    const box = boxRef.current
    if (!sig || !box) return
    const canvas = sig.getCanvas()
    if (!canvas) return
    const ratio = Math.max(window.devicePixelRatio || 1, 1)
    const cssWidth = box.clientWidth || 600
    const cssHeight = height
    canvas.style.width = cssWidth + 'px'
    canvas.style.height = cssHeight + 'px'
    canvas.width = Math.floor(cssWidth * ratio)
    canvas.height = Math.floor(cssHeight * ratio)
    const ctx = canvas.getContext('2d')
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    try { sig.clear() } catch {}
  }

  useEffect(() => {
    resizeCanvas()
    const onResize = () => resizeCanvas()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (value && sigRef.current) {
      // Keeping behavior: do not preload existing dataURL
    }
  }, [value])

  return (
    <Stack spacing={1}>
      <Box ref={boxRef} sx={{ width: '100%' }}>
        <SignatureCanvas
          ref={sigRef}
          canvasProps={{ style: { width: '100%', height: `${height}px`, border: '1px solid #ccc', display: 'block' } }}
        />
      </Box>
      <Stack direction="row" spacing={1}>
        <Button onClick={() => { if (sigRef.current) sigRef.current.clear() }}>Clear</Button>
        <Button variant="outlined" onClick={() => { if (sigRef.current) onChange(sigRef.current.getTrimmedCanvas().toDataURL()) }}>Save Signature</Button>
      </Stack>
    </Stack>
  )
}
