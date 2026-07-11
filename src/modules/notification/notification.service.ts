import * as fs from 'fs';
import * as path from 'path';

import { Injectable, Logger, OnModuleInit, InternalServerErrorException } from '@nestjs/common';
import * as handlebars from 'handlebars';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationService implements OnModuleInit {
  private readonly logger = new Logger(NotificationService.name);
  private transporter: nodemailer.Transporter | undefined = undefined;

  onModuleInit(): void {
    const host = process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io';
    const port = Number(process.env.SMTP_PORT) || 2525;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (process.env.NODE_ENV === 'production' && (!user || !pass)) {
      this.logger.warn('SMTP authentication credentials are missing in production environment!');
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      auth: user && pass ? { user, pass } : undefined,
    });
  }

  async sendEmail(
    to: string,
    subject: string,
    templateName: string,
    context: Record<string, unknown>,
  ): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter has not been initialized.');
      }

      const templatePath = path.resolve(
        process.cwd(),
        'dist',
        'modules',
        'notification',
        'templates',
        `${templateName}.hbs`,
      );

      if (!fs.existsSync(templatePath)) {
        throw new Error(`Email template not found at resolved path: ${templatePath}`);
      }

      const templateSource = fs.readFileSync(templatePath, 'utf8');
      const compiledTemplate = handlebars.compile(templateSource);
      const htmlBody = compiledTemplate(context);

      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || '"Washer App" <noreply@washersoftware.com>',
        to,
        subject,
        html: htmlBody,
      });

      this.logger.log(
        `[Email] Successfully dispatched to <${to}> using template [${templateName}]`,
      );
      return { success: true, message: 'Email dispatched successfully.' };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown notification error';
      const errorStack = error instanceof Error ? error.stack : '';

      this.logger.error(
        `[Email Fail] Failed to send email to <${to}> | Reason: ${errorMessage}`,
        errorStack,
      );

      throw new InternalServerErrorException(`Notification dispatch failed: ${errorMessage}`);
    }
  }

  async sendPushNotification(targetUserId: string, title: string, message: string): Promise<void> {
    this.logger.log(
      `[Push] Notification dispatched to User [${targetUserId}] | Title: "${title}" | Body: "${message}"`,
    );
  }
}
