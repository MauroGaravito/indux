import React from 'react'

export default function DUSButton({ children, ...props }) {
  return <button {...props}>{children}</button>
}