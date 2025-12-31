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
    const issueDate = new Date().toLocaleDateString();
    const accent = '#8e24aa';
    const darkText = '#1b1e23';

    // Decorative border
    const borderPadding = 20;
    doc
      .lineWidth(2)
      .strokeColor(accent)
      .roundedRect(
        borderPadding,
        borderPadding,
        doc.page.width - borderPadding * 2,
        doc.page.height - borderPadding * 2,
        12
      )
      .stroke();

    // Title
    doc.fillColor(darkText).fontSize(32).text('Certificate of Completion', {
      align: 'center',
      lineGap: 6
    });
    doc
      .fontSize(14)
      .fillColor('#4b5563')
      .text('Presented to the worker named below in recognition of the successful completion of the required induction.', {
        align: 'center'
      });

    doc.moveDown(2);

    // Details block
    const infoStart = doc.y;
    const infoHeight = 220;
    doc
      .lineWidth(1)
      .strokeColor('#d0d2d6')
      .roundedRect(60, infoStart, doc.page.width - 120, infoHeight, 8)
      .stroke();
    doc.x = 80;
    doc.y = infoStart + 20;
    doc
      .fontSize(16)
      .fillColor(darkText)
      .text('Worker', { continued: true, width: 140 })
      .font('Helvetica-Bold')
      .text(`: ${data.workerName}`);
    doc
      .font('Helvetica')
      .text('Project', { continued: true, width: 140 })
      .font('Helvetica-Bold')
      .text(`: ${data.projectName}`);
    doc
      .font('Helvetica')
      .text('Module', { continued: true, width: 140 })
      .font('Helvetica-Bold')
      .text(`: ${moduleLabel}`);
    doc
      .font('Helvetica')
      .text('Date issued', { continued: true, width: 140 })
      .font('Helvetica-Bold')
      .text(`: ${issueDate}`);

    doc.moveDown(2);
    doc
      .fillColor(darkText)
      .font('Helvetica')
      .fontSize(14)
      .text(
        `This certificate confirms that ${data.workerName} has met all induction requirements for the project "${data.projectName}".`,
        {
          align: 'left',
          lineGap: 6
        }
      );

    // Signature area
    doc.moveDown(4);
    const sigWidth = 200;
    const sigX = doc.page.width / 2 - sigWidth / 2;
    doc
      .moveTo(sigX, doc.y)
      .lineTo(sigX + sigWidth, doc.y)
      .strokeColor('#9aa0a6')
      .stroke();
    doc
      .fontSize(12)
      .fillColor('#6b7280')
      .text('Authorised signature', sigX, doc.y + 2, { width: sigWidth, align: 'center' });
    doc
      .fontSize(10)
      .fillColor('#9aa0a6')
      .text('Indux WHS Compliance Platform', sigX, doc.y + 14, { width: sigWidth, align: 'center' });

    doc.end();
  });
}
