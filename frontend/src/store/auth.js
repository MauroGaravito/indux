import { create } from 'zustand'
import api from '../utils/api.js'

const STORAGE_KEY = 'indux_auth'

function saveAuthToStorage(user, accessToken, refreshToken) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, accessToken, refreshToken })) } catch (_) {}
}
function clearAuthStorage() {
  try { localStorage.removeItem(STORAGE_KEY) } catch (_) {}
}
function loadAuthFromStorage() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null } catch (_) { return null }
}

export const useAuthStore = create((set, get) => {
  // Hydrate initial state from storage
  const saved = typeof window !== 'undefined' ? loadAuthFromStorage() : null
  if (saved?.accessToken) {
    api.setToken(saved.accessToken)
    // best effort to hydrate axios instance too
    if (api.hydrateFromStorage) api.hydrateFromStorage()
  }

  return {
    user: saved?.user || null,
    accessToken: saved?.accessToken || null,
    refreshToken: saved?.refreshToken || null,
    async login(email, password) {
      try {
        const r = await api.post('/auth/login', { email, password })
        const user = r.data.user
        const accessToken = r.data.accessToken
        const refreshToken = r.data.refreshToken
        set({ user, accessToken, refreshToken })
        api.setToken(accessToken)
        saveAuthToStorage(user, accessToken, refreshToken)
        return true
      } catch (e) {
        return false
      }
    },
    logout() {
      set({ user: null, accessToken: null, refreshToken: null })
      api.setToken(null)
      clearAuthStorage()
    }
  }
})
