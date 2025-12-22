import React from 'react'
import { Alert, Paper, Stack, Typography } from '@mui/material'

// Keeping Inspection Module reviews isolated from induction approvals prevents cross-pollution
// between training updates and operational checks. This placeholder will later capture review
// threads, reference photos, and the historical audit trail of each inspection execution.

export default function InspectionReviews() {
  return (
    <Stack spacing={2}>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        Inspection Module Reviews
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Track approvals for upcoming Inspection Templates without impacting induction workflows.
      </Typography>

      <Paper sx={{ p: 2 }}>
        <Alert severity="info">
          Inspection Module Reviews (coming soon). This queue will handle pass/fail resolutions, photo
          evidence, and preserved snapshots of each requested change to inspection templates.
        </Alert>
      </Paper>
    </Stack>
  )
}
