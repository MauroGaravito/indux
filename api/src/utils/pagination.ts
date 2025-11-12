import { z } from 'zod'

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(200).optional(),
})

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>

export function computeSkipLimit(q: PaginationQuery) {
  const page = q.page ?? null
  const pageSize = q.pageSize ?? null
  const skip = page && pageSize ? (page - 1) * pageSize : 0
  const limit = page && pageSize ? pageSize : undefined
  return { page, pageSize, skip, limit }
}

export function wrapPaginated<T>(items: T[], total: number, page: number, pageSize: number) {
  return { items, total, page, pageSize }
}

