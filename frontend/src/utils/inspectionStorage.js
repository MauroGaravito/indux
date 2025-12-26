const STORAGE_KEY = 'inspectionExecutions'

function readStore() {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeStore(store) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    // ignore storage errors
  }
}

export function getInspectionExecutionRecord(userId, projectInspectionId) {
  if (!userId || !projectInspectionId) return null
  const store = readStore()
  const userStore = store[userId] || {}
  return userStore[projectInspectionId] || null
}

export function setInspectionExecutionRecord(userId, projectInspectionId, record) {
  if (!userId || !projectInspectionId || !record) return
  const store = readStore()
  if (!store[userId]) {
    store[userId] = {}
  }
  store[userId][projectInspectionId] = {
    executionId: record.executionId || null,
    status: record.status || 'draft',
  }
  writeStore(store)
}

export function clearInspectionExecutionRecord(userId, projectInspectionId) {
  if (!userId || !projectInspectionId) return
  const store = readStore()
  if (!store[userId]) return
  delete store[userId][projectInspectionId]
  writeStore(store)
}
