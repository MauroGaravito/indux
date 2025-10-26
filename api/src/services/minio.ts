import { Client } from 'minio';

const endpoint = process.env.S3_ENDPOINT?.replace('http://', '').replace('https://', '') || 'minio:9000';
const useSSL = (process.env.S3_USE_SSL || 'false').toLowerCase() === 'true';
const accessKey = process.env.S3_ACCESS_KEY || 'minioadmin';
const secretKey = process.env.S3_SECRET_KEY || 'minioadmin';
const region = process.env.S3_REGION || 'us-east-1';
export const bucket = process.env.S3_BUCKET || 'indux';

export const minio = new Client({
  endPoint: endpoint.split(':')[0],
  port: Number(endpoint.split(':')[1] || (useSSL ? 443 : 9000)),
  useSSL,
  accessKey,
  secretKey,
  region
});

export async function ensureBucket() {
  const exists = await minio.bucketExists(bucket).catch(() => false);
  if (!exists) {
    await minio.makeBucket(bucket, region);
    console.log(`Created bucket ${bucket}`);
  }
}

export async function presignPutUrl(key: string) {
  return minio.presignedPutObject(bucket, key, 60 * 10);
}
