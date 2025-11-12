import type { Request, Response, NextFunction } from 'express'

// Generic app error type to carry status codes
export class HttpError extends Error {
  status: number
  details?: any
  constructor(status: number, message: string, details?: any) {
    super(message)
    this.status = status
    this.details = details
  }
}

// Express error-handling middleware (must be last)
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const status = Number((err && (err.status || err.statusCode)) || 500)
  const message = (err && (err.message || err.error)) || 'Internal Server Error'
  const payload: any = { error: message }
  if (process.env.NODE_ENV === 'development' && err?.stack) {
    payload.stack = err.stack
  }
  if (err?.details) payload.details = err.details
  res.status(Number.isFinite(status) && status >= 100 && status < 600 ? status : 500).json(payload)
}

