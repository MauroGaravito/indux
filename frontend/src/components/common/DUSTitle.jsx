import React from 'react'

export default function DUSTitle({ children, level = 1, ...props }) {
  const Tag = `h${level}`
  return <Tag {...props}>{children}</Tag>
}