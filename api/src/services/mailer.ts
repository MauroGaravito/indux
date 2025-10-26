import nodemailer from 'nodemailer';

const host = process.env.SMTP_HOST || 'localhost';
const port = Number(process.env.SMTP_PORT || 1025);
const user = process.env.SMTP_USER || '';
const pass = process.env.SMTP_PASS || '';

export const transporter = nodemailer.createTransport({
  host, port, secure: false,
  auth: user ? { user, pass } : undefined
});

export async function sendMail(options: { to: string; subject: string; text?: string; html?: string; attachments?: any[] }) {
  const from = process.env.MAIL_FROM || 'Indux <no-reply@indux.local>';
  return transporter.sendMail({ from, ...options });
}

