import React from 'react'
import { Alert, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'

// Inspection Modules intentionally live outside the induction module stack so day-to-day safety checks
// can evolve without touching training content. This scaffolding will later expand to support photos,
// pass/fail scoring, and preserved historical execution records for every inspection run.

const mockTemplates = []

export default function InspectionTemplates() {
  return (
    <Stack spacing={2}>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        Inspection Templates
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Define the reusable checklists that power every Inspection Module.
      </Typography>

      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Inspection Templates
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Discipline</TableCell>
              <TableCell>Last Updated</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockTemplates.map((template) => (
              <TableRow key={template.id}>
                <TableCell>{template.name}</TableCell>
                <TableCell>{template.discipline}</TableCell>
                <TableCell>{template.updatedAt}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!mockTemplates.length && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Inspection templates will define repeatable site checks.
          </Alert>
        )}
      </Paper>
    </Stack>
  )
}
