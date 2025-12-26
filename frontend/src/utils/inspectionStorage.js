const STORAGE_KEY = 'inspectionExecutions'

function ensureStructure(data) {
  if (!data || typeof data !== 'object') {
    return { users: {}, history: [] }
  }
  const store = { ...data }
  if (!store.users || typeof store.users !== 'object') {
    // legacy format stored users at root
    const legacyUsers = { ...store }
    delete legacyUsers.history
    store.users = legacyUsers.users ? legacyUsers.users : legacyUsers
  }
  if (!Array.isArray(store.history)) {
    store.history = []
  }
  return { users: store.users || {}, history: store.history }
}

function readStore() {
  if (typeof window === 'undefined') return { users: {}, history: [] }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return ensureStructure(parsed)
  } catch {
    return { users: {}, history: [] }
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

function ensureUserRecord(store, userId) {
  if (!store.users[userId]) {
    store.users[userId] = { records: {} }
  } else if (!store.users[userId].records) {
    store.users[userId].records = {}
  }
  return store.users[userId].records
}

export function getInspectionExecutionRecord(userId, projectInspectionId) {
  if (!userId || !projectInspectionId) return null
  const store = readStore()
  const userStore = store.users[userId]
  return userStore?.records?.[projectInspectionId] || null
}

export function setInspectionExecutionRecord(userId, projectInspectionId, record) {
  if (!userId || !projectInspectionId || !record) return
  const store = readStore()
  const records = ensureUserRecord(store, userId)
  records[projectInspectionId] = {
    executionId: record.executionId || null,
    status: record.status || 'draft',
    projectId: record.projectId || null,
    projectName: record.projectName || '',
    templateName: record.templateName || '',
    submittedAt: record.submittedAt || null,
  }
  writeStore(store)
}

export function clearInspectionExecutionRecord(userId, projectInspectionId) {
  if (!userId || !projectInspectionId) return
  const store = readStore()
  const records = store.users[userId]?.records
  if (!records) return
  delete records[projectInspectionId]
  writeStore(store)
}

export function appendInspectionHistory(entry) {
  if (!entry || !entry.projectId) return
  const store = readStore()
  store.history.unshift({
    ...entry,
    submittedAt: entry.submittedAt || new Date().toISOString(),
  })
  if (store.history.length > 100) {
    store.history = store.history.slice(0, 100)
  }
  writeStore(store)
}

export function getInspectionHistoryByProject(projectId) {
  if (!projectId) return []
  const store = readStore()
  return (store.history || []).filter(
    (entry) => String(entry.projectId) === String(projectId)
  )
}
