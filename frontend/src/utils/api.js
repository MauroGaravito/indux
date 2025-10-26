import axios from 'axios'

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080'
})

let accessToken = null

instance.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

export default Object.assign(instance, {
  setToken: (token) => { accessToken = token }
})

