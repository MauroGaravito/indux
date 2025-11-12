export function ok(data: any, message?: string) {
  return { success: true, data, ...(message ? { message } : {}) }
}

