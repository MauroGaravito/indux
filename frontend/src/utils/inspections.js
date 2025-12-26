import api from './api.js'

export async function fetchProjectInspections(projectId) {
  if (!projectId) return []
  const resp = await api.get(`/projects/${projectId}/inspections`)
  return resp.data?.inspections || []
}

export async function listInspectionTemplates() {
  try {
    const resp = await api.get('/inspection-templates')
    return resp.data?.templates || resp.data || []
  } catch (err) {
    if (err?.response?.status === 403) {
      return []
    }
    throw err
  }
}

export async function startInspectionExecution(projectInspectionId) {
  if (!projectInspectionId) return null
  const resp = await api.post(`/project-inspections/${projectInspectionId}/executions`)
  return resp.data
}
