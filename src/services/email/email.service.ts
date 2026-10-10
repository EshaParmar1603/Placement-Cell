import { IEmailService, SendEmailOptions, EmailDeliveryResult } from './email.interface.js';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { v4 as uuidv4 } from 'uuid';

export class EmailService implements IEmailService {
  async sendEmail(options: SendEmailOptions): Promise<EmailDeliveryResult> {
    if (env.EMAIL_PROVIDER === 'mock') {
      logger.info(`[Email Mock Delivery] To: ${options.to} | Subject: ${options.subject}`);
      return {
        success: true,
        messageId: `mock-${uuidv4()}`,
      };
    }

    // SMTP provider placeholder
    try {
      logger.info(`[Email SMTP Delivery Attempt] To: ${options.to} | Host: ${env.SMTP_HOST}:${env.SMTP_PORT}`);
      // In production, nodemailer would be configured with env.SMTP_* credentials
      return {
        success: true,
        messageId: `smtp-${uuidv4()}`,
      };
    } catch (err: any) {
      logger.error('Email delivery failed:', err);
      return {
        success: false,
        error: err?.message || 'SMTP delivery failed',
      };
    }
  }
}

export const emailService = new EmailService();
