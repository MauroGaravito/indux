import React from 'react'

export default function WorkerLayout({ children }) {
  return (
    <div>
      <header>Worker Area</header>
      <aside>Worker Sidebar</aside>
      <section>{children}</section>
    </div>
  )
}
