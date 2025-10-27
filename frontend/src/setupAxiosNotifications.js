// Global Axios interceptors to surface success/errors via notifications
import React from 'react'
import { createRoot } from 'react-dom/client'
import { notifyError, notifySuccess } from './notifications/store'
import NotificationCenter from './components/NotificationCenter'
import api from './utils/api'

// Simple heuristic: surface success toast for mutating methods if response ok
const successMethods = new Set(['post', 'put', 'patch', 'delete'])

let attached = false

export function attachAxiosNotifications() {
  if (attached) return
  attached = true

  // Mount a NotificationCenter outside the main app, once
  try {
    const existing = document.getElementById('notification-root')
    if (!existing) {
      const el = document.createElement('div')
      el.id = 'notification-root'
      document.body.appendChild(el)
      const root = createRoot(el)
      root.render(React.createElement(NotificationCenter))
    }
  } catch (_) {
    // non-fatal if DOM not ready; will still work when imported later
    if (typeof window !== 'undefined') {
      window.addEventListener('DOMContentLoaded', () => {
        try {
          const existing = document.getElementById('notification-root')
          if (!existing) {
            const el = document.createElement('div')
            el.id = 'notification-root'
            document.body.appendChild(el)
            const root = createRoot(el)
            root.render(React.createElement(NotificationCenter))
          }
        } catch (_) {}
      })
    }
  }

  const attachTo = (client) => client.interceptors.response.use(
    (response) => {
      try {
        const method = response?.config?.method?.toLowerCase?.()
        if (successMethods.has(method)) {
          // Generic messages; pages can still show their own detailed ones
          const url = response?.config?.url || ''
          if (/login|auth\/refresh/i.test(url)) {
            // avoid noisy auth messages
          } else if (/approve|decline/i.test(url)) {
            notifySuccess('Action completed successfully')
          } else if (/upload|presign|files|slides|map/i.test(url)) {
            notifySuccess('File processed successfully')
          } else if (/project|submission|config/i.test(url)) {
            notifySuccess('Saved successfully')
          } else {
            notifySuccess('Operation successful')
          }
        }
      } catch (_) {}
      return response
    },
    (error) => {
      // Try to extract a meaningful message
      const resp = error?.response
      const msg =
        resp?.data?.message ||
        resp?.data?.error ||
        error?.message ||
        'An error occurred'

      notifyError(msg)
      return Promise.reject(error)
    }
  )

  // Attach to our axios instance used by the app
  attachTo(api)
}

// Auto-attach if imported (defensive; tree-shaken if unused)
attachAxiosNotifications()
