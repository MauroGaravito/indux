import React from 'react'
import { Outlet } from 'react-router-dom'

export default function ManagerLayout() {
  return (
    <div>
      <header>Manager Area</header>
      <aside>Manager Sidebar</aside>
      <section>
        <Outlet />
      </section>
    </div>
  )
}
