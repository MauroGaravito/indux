import React from 'react'
import { Card, CardContent, Typography } from '@mui/material'
import ReviewQueue from '../ReviewQueue.jsx'

export default function Reviews() {
  return (
    <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Reviews</Typography>
        <ReviewQueue />
      </CardContent>
    </Card>
  )
}

