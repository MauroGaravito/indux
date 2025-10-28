import api from './api.js'
import { notifyError, notifyInfo, notifySuccess } from '../notifications/store'

export async function presign(prefix='uploads/') {
  // Normalize: no leading '/', ensure trailing '/'
  const clean = (prefix || 'uploads/').replace(/^\/+/, '').replace(/([^/])$/, '$1/')
  const { data } = await api.post('/uploads/presign', { prefix: clean })
  return data // { key, url }
}

export async function uploadToPresigned(url, file, { onProgress } = {}) {
  // Important: do NOT set Content-Type headers manually; the browser will set them correctly.
  // Use XHR to get upload progress events for better UX.
  // eslint-disable-next-line no-console
  console.log('Uploading to presigned URL:', url)

  await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', url, true)
    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable && typeof onProgress === 'function') {
        const pct = Math.round((evt.loaded / evt.total) * 100)
        onProgress(pct)
      }
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve()
      else reject(new Error(`Upload failed with status ${xhr.status}`))
    }
    xhr.onerror = () => reject(new Error('Network error during upload'))
    xhr.send(file)
  })
}

// High-level helper: presign + upload + toasts
export async function uploadFile(prefix, file, { onProgress } = {}) {
  try {
    notifyInfo('Uploading file...')
    const { key, url } = await presign(prefix)
    await uploadToPresigned(url, file, { onProgress })
    notifySuccess('File uploaded successfully')
    return { key }
  } catch (e) {
    notifyError('Could not upload the file')
    throw e
  }
}

export async function presignGet(key) {
  const { data } = await api.post('/uploads/presign-get', { key })
  return data // { url }
}
