import { create } from 'zustand'
import api from '../utils/api.js'

export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  async login(email, password) {
    try {
      const r = await api.post('/auth/login', { email, password })
      set({ user: r.data.user, accessToken: r.data.accessToken, refreshToken: r.data.refreshToken })
      api.setToken(r.data.accessToken)
      return true
    } catch (e) {
      return false
    }
  },
  logout() {
    set({ user: null, accessToken: null, refreshToken: null })
    api.setToken(null)
  }
}))

