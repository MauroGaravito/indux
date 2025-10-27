import api from './api.js'

export async function presign(prefix='uploads/') {
  // Normalize: no leading '/', ensure trailing '/'
  const clean = (prefix || 'uploads/').replace(/^\/+/, '').replace(/([^/])$/, '$1/')
  const { data } = await api.post('/uploads/presign', { prefix: clean })
  return data // { key, url }
}

export async function uploadToPresigned(url, file) {
  // Important: do NOT set Content-Type headers manually; the browser will set them correctly.
  // Log the exact URL to ensure query params remain intact (helps diagnose 403/Signature errors).
  // eslint-disable-next-line no-console
  console.log('Uploading to presigned URL:', url)
  await fetch(url, { method: 'PUT', body: file })
}
