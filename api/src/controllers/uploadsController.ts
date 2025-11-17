import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { minio, bucket, ensureBucket } from '../services/minio.js'
import { HttpError } from '../middleware/errorHandler.js'

const MetaQuery = z.object({
  key: z.string().min(1)
})

function extractFilename(disposition?: string, key?: string) {
  if (disposition) {
    const match = disposition.match(/filename\*?="?([^\";]+)"?/i)
    if (match?.[1]) {
      return decodeURIComponent(match[1])
    }
  }
  return key?.split('/').pop() || key || ''
}

export async function getMeta(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = MetaQuery.safeParse(req.query)
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
    const { key } = parsed.data

    await ensureBucket()
    const stat = await minio.statObject(bucket, key).catch((err: any) => {
      const code = err?.code || err?.statusCode
      if (code === 'NotFound' || code === 'NoSuchKey' || code === 404) {
        throw new HttpError(404, 'Object not found')
      }
      throw new HttpError(400, 'Could not fetch object metadata')
    })

    const meta = (stat as any)?.metaData || {}
    const contentType = meta['content-type']
      || meta['Content-Type']
      || meta['contentType']
      || meta['content_type']
    const disposition = meta['content-disposition'] || meta['Content-Disposition'] || meta['content_disposition']
    const filename = extractFilename(disposition, key)

    res.json({
      ok: true,
      key,
      contentType,
      size: stat?.size,
      filename,
      lastModified: stat?.lastModified
    })
  } catch (err) {
    next(err)
  }
}
