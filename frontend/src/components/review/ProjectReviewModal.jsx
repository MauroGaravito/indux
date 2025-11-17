import React from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material'

const statusChipColor = (status) => {
  if (status === 'approved') return 'success'
  if (status === 'declined') return 'error'
  if (status === 'pending') return 'warning'
  return 'default'
}

export default function ProjectReviewModal({
  open,
  review,
  loading,
  onClose,
  onApprove,
  onDecline,
  declineProcessing,
  approveProcessing
}) {
  const [reason, setReason] = React.useState('')

  React.useEffect(() => {
    if (!open) {
      setReason('')
    }
  }, [open])

  const data = review?.data || {}
  const fields = Array.isArray(data?.fields) ? data.fields : []
  const configSnapshot = data?.config || {}

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle sx={{ pb: 0 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Project Review</Typography>
            {review && (
              <>
                <Typography variant="subtitle1" color="text.secondary">
                  {review?.projectId?.name || review?.projectId || 'Project'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Requested by {review?.requestedBy?.name || review?.requestedBy || 'Unknown'} on{' '}
                  {review?.createdAt ? new Date(review.createdAt).toLocaleString() : 'N/A'}
                </Typography>
              </>
            )}
          </Box>
          {review && (
            <Chip label={review?.status || 'pending'} color={statusChipColor(review?.status)} />
          )}
        </Stack>
      </DialogTitle>
      <DialogContent dividers sx={{ mt: 2 }}>
        {loading && (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography color="text.secondary">Loading…</Typography>
          </Box>
        )}
        {!loading && !review && (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography color="text.secondary">No review data available.</Typography>
          </Box>
        )}
        {!loading && review && (
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Requester</Typography>
              <Typography variant="body2" color="text.secondary">
                {review?.requestedBy?.name || review?.requestedBy || 'Unknown'} —{' '}
                {review?.requestedBy?.email || 'No email'}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Project Fields Snapshot</Typography>
              {fields.length ? (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Label</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Required</TableCell>
                      <TableCell>Order</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fields.map((field) => (
                      <TableRow key={field._id || field.key}>
                        <TableCell>{field.label || field.key}</TableCell>
                        <TableCell>{field.type}</TableCell>
                        <TableCell>{field.required ? 'Yes' : 'No'}</TableCell>
                        <TableCell>{field.order ?? '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Alert severity="info">No field metadata provided in this snapshot.</Alert>
              )}
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Configuration Snapshot</Typography>
              {Object.keys(configSnapshot).length ? (
                <Box
                  component="pre"
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'grey.50',
                    overflow: 'auto'
                  }}
                >
                  {JSON.stringify(configSnapshot, null, 2)}
                </Box>
              ) : (
                <Alert severity="info">No additional configuration captured.</Alert>
              )}
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Decline Reason (optional)</Typography>
              <TextField
                fullWidth
                multiline
                minRows={3}
                placeholder="Provide a reason if declining this review."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </Box>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button
          color="error"
          variant="outlined"
          disabled={declineProcessing}
          onClick={() => onDecline?.(reason)}
        >
          {declineProcessing ? 'Declining…' : 'Decline'}
        </Button>
        <Button
          color="success"
          variant="contained"
          disabled={approveProcessing}
          onClick={() => onApprove?.()}
        >
          {approveProcessing ? 'Approving…' : 'Approve'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
