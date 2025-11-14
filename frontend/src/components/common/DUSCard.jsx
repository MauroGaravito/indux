import React from 'react'

export default function DUSCard({ children, ...props }) {
  return <div {...props}>{children}</div>
}