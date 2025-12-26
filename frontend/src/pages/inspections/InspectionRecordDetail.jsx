import React from 'react'
import { Alert } from '@mui/material'
import { useParams } from 'react-router-dom'
import InspectionWizard from './InspectionWizard.jsx'

export default function InspectionRecordDetail() {
  const { recordId } = useParams()
  if (!recordId) {
    return <Alert severity="warning">Missing inspection record reference.</Alert>
  }
  return <InspectionWizard mode="readOnly" recordId={recordId} />
}
