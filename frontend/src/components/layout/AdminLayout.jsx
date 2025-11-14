import React from 'react'

export default function AdminLayout({ children }) {
  return (
    <div>
      <header>Admin Area</header>
      <aside>Admin Sidebar</aside>
      <section>{children}</section>
    </div>
  )
}
