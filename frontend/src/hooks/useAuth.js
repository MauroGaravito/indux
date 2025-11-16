import { useAuthStore } from '../context/authStore.js'

export function useAuth() {
  const user = useAuthStore((state) => state.user)
  const login = useAuthStore((state) => state.login)
  const logout = useAuthStore((state) => state.logout)
  const token = useAuthStore((state) => state.token)
  return { user, login, logout, token }
}
