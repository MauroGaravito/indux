import React from 'react'

export default function MainLayout({ children }) {
  return (
    <div>
      <header>Main Layout Header</header>
      <main>{children}</main>
    </div>
  )
}
