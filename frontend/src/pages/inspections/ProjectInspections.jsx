import React from 'react'
import { Alert, Chip, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'

// Project-facing inspection views will always read dedicated inspection execution history
// so training records remain untouched. This placeholder mimics how we will later track photos,
// pass/fail outcomes, and immutable snapshots for every Inspection Execution.

const mockProject = {
  name: 'Harbor Logistics Hub',
  code: 'PRJ-204',
}

const mockInspections = [
  { id: 'insp-1', name: 'Daily Excavation Checklist', cadence: 'Daily', status: 'Pass', lastRun: '2025-12-20' },
  { id: 'insp-2', name: 'Formwork Pre-Pour', cadence: 'Per Activity', status: 'Fail', lastRun: '2025-12-19' },
]

export default function ProjectInspections() {
  return (
    <Stack spacing={2}>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        {mockProject.name} - Inspection Executions (coming soon)
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Preview of Inspection Modules activated for this project. Actual execution history will be
        stored separately from induction reviews to preserve accurate site records.
      </Typography>

      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Activated Inspection Modules
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Inspection Template</TableCell>
              <TableCell>Cadence</TableCell>
              <TableCell>Most Recent Outcome</TableCell>
              <TableCell>Last Executed</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockInspections.map((inspection) => (
              <TableRow key={inspection.id}>
                <TableCell>{inspection.name}</TableCell>
                <TableCell>{inspection.cadence}</TableCell>
                <TableCell>
                  <Chip
                    label={inspection.status}
                    color={inspection.status === 'Pass' ? 'success' : inspection.status === 'Fail' ? 'error' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{inspection.lastRun}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!mockInspections.length && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Inspection Execution (coming soon). Once inspections are activated per project, each run will
            show up here with attached notes and photo evidence.
          </Alert>
        )}
      </Paper>
    </Stack>
  )
}
