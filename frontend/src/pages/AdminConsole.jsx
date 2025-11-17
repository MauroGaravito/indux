import React from 'react'
import { Navigate } from 'react-router-dom'

export default function AdminConsole() {
  return <Navigate to="/admin/projects" replace />
}
