// @ts-nocheck
import nodemailer from 'nodemailer';
import pug from 'pug';
import { htmlToText } from 'html-to-text';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

export class Email {
  constructor(user: { email: string; name: string }, url: string) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Vitor Natours <${process.env.EMAIL_FROM}>`;
  }

  createTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Exemplo com SendGrid (se quiser implementar depois)
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_API_KEY,
        },
      });
    } else {
      // Use Mailtrap (modo de desenvolvimento)
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    }
  }

  async send(template: string, subject: string) {
    // 1) Render HTML based on a template
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    // Use pug to render the email template
    // @ts-ignore
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
    });
    if (!html) {
      throw new Error('Failed to render email template');
    }

    // 2) Define the email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html), // ✅ corrigido
    };
    const transporter = await this.createTransport();

    // 3) Send the email
    return transporter.sendMail(mailOptions);
  }

  async sendWelcome() {
    return await this.send('welcome', 'Welcome to the Natours Family!');
  }
  async sendPasswordReset() {
    return await this.send(
      'passwordReset',
      'Your password reset token (valid for 10 min)'
    );
  }
}
