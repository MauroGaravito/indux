import axios from 'axios'

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080'
})

// In-memory token for requests
let accessToken = null

// Storage helpers (avoid importing the store to prevent cycles)
const STORAGE_KEY = 'indux_auth'
function readAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (_) { return null }
}
function writeAuth(patch) {
  try {
    const current = readAuth() || {}
    const next = { ...current, ...patch }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch (_) {}
}

// Hydrate once on module load
try {
  const saved = readAuth()
  if (saved?.accessToken) accessToken = saved.accessToken
} catch (_) {}

instance.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

// Auto-refresh access token on 401 using refreshToken from localStorage
let refreshing = null
const redirectToLogin = () => {
  accessToken = null
  try { localStorage.removeItem(STORAGE_KEY) } catch (_) {}
  if (window.location.pathname === '/login') {
    window.alert('Session expired. Please log in again.')
  } else {
    window.location.href = '/login'
  }
}

instance.interceptors.response.use(
  (resp) => resp,
  async (error) => {
    const { response, config } = error || {}
    if (response?.status === 403) {
      window.alert('You are not allowed to access this resource.')
      return Promise.reject(error)
    }
    if (!response || response.status !== 401 || config?._retry) {
      return Promise.reject(error)
    }
    const saved = readAuth()
    const refreshToken = saved?.refreshToken
    if (!refreshToken) {
      redirectToLogin()
      return Promise.reject(error)
    }

    try {
      config._retry = true
      // de-duplicate concurrent refreshes
      if (!refreshing) {
        refreshing = instance.post('/auth/refresh', { refreshToken })
          .then(r => r?.data?.accessToken)
          .finally(() => { refreshing = null })
      }
      const newAccess = await refreshing
      if (!newAccess) {
        redirectToLogin()
        return Promise.reject(error)
      }
      // update in-memory and storage, then retry
      accessToken = newAccess
      writeAuth({ accessToken: newAccess })
      config.headers.Authorization = `Bearer ${newAccess}`
      return instance(config)
    } catch (e) {
      redirectToLogin()
      return Promise.reject(error)
    }
  }
)

export default Object.assign(instance, {
  setToken: (token) => { accessToken = token },
  // Hydrate token from storage at app start if present
  hydrateFromStorage: () => {
    const saved = readAuth()
    if (saved?.accessToken) accessToken = saved.accessToken
  }
})
