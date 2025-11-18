import PDFDocument from 'pdfkit';
import { minio, bucket } from './minio.js';

export async function generateCertificate(
  key: string,
  data: { workerName: string; projectName: string; moduleType?: string }
) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const chunks: Buffer[] = [];
  return new Promise<string>((resolve, reject) => {
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', async () => {
      const pdfBuffer = Buffer.concat(chunks);
      await minio.putObject(bucket, key, pdfBuffer, pdfBuffer.length, { 'Content-Type': 'application/pdf' });
      resolve(key);
    });
    doc.on('error', reject);

    const moduleLabel = data?.moduleType ? `${data.moduleType} module` : 'induction module';

    doc.fontSize(24).text('Completion Certificate', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text(`Worker: ${data.workerName}`);
    doc.text(`Project: ${data.projectName}`);
    doc.text(`Module: ${moduleLabel}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.moveDown();
    doc.text('This certifies the worker has successfully completed the required module.', { align: 'left' });

    doc.end();
  });
}
