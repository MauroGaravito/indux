// Global notification store using Zustand (no TypeScript to avoid type friction)
import { create } from 'zustand'

// Levels: 'success' | 'error' | 'info' | 'warning'
export const useNotificationStore = create((set) => ({
  open: false,
  message: '',
  level: 'info',
  autoHideDuration: 3000,
  show: (message, level = 'info', autoHideDuration = 3000) =>
    set({ open: true, message, level, autoHideDuration }),
  hide: () => set({ open: false }),
}))

// Convenience functions for callers that don't want to import the hook
export const notify = (message, level = 'info', autoHideDuration = 3000) => {
  useNotificationStore.getState().show(message, level, autoHideDuration)
}

export const notifySuccess = (message, autoHideDuration = 2500) =>
  notify(message, 'success', autoHideDuration)

export const notifyError = (message, autoHideDuration = 4000) =>
  notify(message, 'error', autoHideDuration)

export const notifyInfo = (message, autoHideDuration = 3000) =>
  notify(message, 'info', autoHideDuration)

