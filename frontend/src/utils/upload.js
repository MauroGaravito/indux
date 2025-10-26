import api from './api.js'

export async function presign(prefix='uploads/') {
  const { data } = await api.post('/uploads/presign', { prefix })
  return data // { key, url }
}

export async function uploadToPresigned(url, file) {
  await fetch(url, { method: 'PUT', body: file })
}

