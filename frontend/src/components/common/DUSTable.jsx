import React from 'react'

export default function DUSTable({ children, ...props }) {
  return (
    <table {...props}>
      <tbody>{children}</tbody>
    </table>
  )
}