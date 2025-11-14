import React from 'react'

export default function ManagerLayout({ children }) {
  return (
    <div>
      <header>Manager Area</header>
      <aside>Manager Sidebar</aside>
      <section>{children}</section>
    </div>
  )
}
