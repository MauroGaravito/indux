import React from 'react'
import {
  Alert,
  Box,
  Chip,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'

export function StatusChip({ status }) {
  const color = status === 'approved' ? 'success' : status === 'declined' ? 'error' : 'default'
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Pending'
  return <Chip size="small" color={color} label={label} />
}

export function InfoRow({ label, value }) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 140 }}>{label}</Typography>
      <Typography variant="body2" color="text.secondary">{value || '-'}</Typography>
    </Stack>
  )
}

export function SubmissionDetails({ submission }) {
  if (!submission) return null
  const worker = submission.userId?.name || submission.userId?.email || submission.userId || 'Unknown worker'
  const submitted = submission.createdAt ? new Date(submission.createdAt).toLocaleString() : 'Not recorded'
  const quiz = submission.quiz || {}
  const answers = Array.isArray(quiz.answers) ? quiz.answers : []
  const payloadEntries = Object.entries(submission.payload || {})

  return (
    <Stack spacing={2}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', fontWeight: 600, mb: 1 }}>Submission summary</Typography>
        <Stack spacing={1}>
          <InfoRow label="Project" value={submission.project?.name || ''} />
          <InfoRow label="Worker name" value={worker} />
          <InfoRow label="Status" value={submission.status} />
          <InfoRow label="Submitted on" value={submitted} />
        </Stack>
      </Paper>
      {!!payloadEntries.length && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', fontWeight: 600, mb: 1 }}>Personal details</Typography>
          <Stack spacing={1}>
            {payloadEntries.map(([key, value]) => (
              <InfoRow key={key} label={key} value={typeof value === 'object' ? JSON.stringify(value) : String(value)} />
            ))}
          </Stack>
        </Paper>
      )}
      {answers.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', fontWeight: 600, mb: 1 }}>Quiz results</Typography>
          <Stack spacing={1}>
            <InfoRow label="Score" value={`${quiz.score ?? 0}%`} />
            <InfoRow label="Result" value={quiz.passed ? 'Passed' : 'Failed'} />
          </Stack>
        </Paper>
      )}
    </Stack>
  )
}

export function ModuleReviewDetails({ review }) {
  if (!review) return null
  const moduleData = review.data?.module || {}
  const config = moduleData.config || {}
  const slides = Array.isArray(config.slides || moduleData.slides) ? config.slides || moduleData.slides : []
  const steps = Array.isArray(moduleData.steps || config.steps) ? (moduleData.steps || config.steps) : []
  const quiz = config.quiz || moduleData.quiz || {}
  const questions = Array.isArray(quiz.questions) ? quiz.questions : []
  const settings = moduleData.settings || config.settings || {}
  const fields = Array.isArray(review.data?.fields) ? review.data.fields : []

  return (
    <Stack spacing={2}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', fontWeight: 600, mb: 1 }}>Induction module overview</Typography>
        <Stack spacing={1}>
          <InfoRow label="Project" value={review.project?.name || ''} />
          <InfoRow label="Module name" value={moduleData.name || 'Induction'} />
          <InfoRow label="Review status" value={moduleData.reviewStatus || review.status} />
          <InfoRow label="Requested by" value={review.requestedBy} />
          <InfoRow label="Submitted on" value={review.createdAt ? new Date(review.createdAt).toLocaleString() : 'Not recorded'} />
        </Stack>
        {!!steps.length && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Wizard steps</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {steps.map((s, idx) => (
                <Chip key={idx} size="small" label={typeof s === 'string' ? s : s?.label || `Step ${idx + 1}`} sx={{ mr: 0.5, mb: 0.5 }} />
              ))}
            </Stack>
          </>
        )}
      </Paper>

      {!!slides.length && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', fontWeight: 600, mb: 1 }}>Slides ({slides.length} files)</Typography>
          <Stack spacing={1}>
            {slides.map((slide, idx) => (
              <Box key={slide.key || idx} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{slide.title || `Slide ${idx + 1}`}</Typography>
                <Typography variant="caption" color="text.secondary">{slide.fileKey}</Typography>
              </Box>
            ))}
          </Stack>
        </Paper>
      )}

      {!!questions.length && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', fontWeight: 600, mb: 1 }}>
            Quiz overview ({questions.length} questions) - pass mark {settings.passMark ?? 0}%
          </Typography>
          <Stack spacing={1}>
            {questions.map((q, idx) => (
              <Box key={q._id || idx} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Q{idx + 1}. {q.question}</Typography>
                <Typography variant="body2" color="text.secondary">Options: {(q.options || []).join(', ')}</Typography>
                {typeof q.answerIndex === 'number' && (
                  <Chip size="small" color="success" label={`Correct: ${(q.options && q.options[q.answerIndex]) || `Option ${q.answerIndex + 1}`}`} sx={{ mt: 0.5 }} />
                )}
              </Box>
            ))}
          </Stack>
        </Paper>
      )}

      {!!fields.length && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', fontWeight: 600, mb: 1 }}>Custom data fields ({fields.length})</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Label</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Required</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fields.map((field) => (
                <TableRow key={field._id}>
                  <TableCell>{field.label || field.name}</TableCell>
                  <TableCell>{field.type}</TableCell>
                  <TableCell>{field.required ? 'Yes' : 'No'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Stack>
  )
}
