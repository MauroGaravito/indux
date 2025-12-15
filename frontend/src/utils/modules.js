import api from './api.js'

export async function fetchProjectModules(projectId) {
  if (!projectId) return []
  const response = await api.get(`/projects/${projectId}/modules/induction`)
  const modules = response?.data?.modules
  return Array.isArray(modules) ? modules : []
}

export async function fetchModuleDetail(moduleId) {
  if (!moduleId) {
    return { module: null, fields: [] }
  }
  const response = await api.get(`/modules/${moduleId}`)
  return {
    module: response?.data?.module || null,
    fields: Array.isArray(response?.data?.fields) ? response.data.fields : []
  }
}
