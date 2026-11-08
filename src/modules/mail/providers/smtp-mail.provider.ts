import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, SMTPSentMessageInfo, Transporter } from 'nodemailer';
import {
  IMailProvider,
  MailSendResult,
  SendMailOptions,
} from '../mail-provider.interface';
import { MailProvider } from '../mail-provider.enum';

@Injectable()
export class SmtpMailProvider implements IMailProvider {
  readonly name = MailProvider.SMTP;
  private transporter?: Transporter<SMTPSentMessageInfo>;

  constructor(private readonly config: ConfigService) {}

  async send(options: SendMailOptions): Promise<MailSendResult> {
    this.transporter ??= this.createTransporter();
    const info = await this.transporter.sendMail({
      from:
        this.config.get<string>('SMTP_FROM') ||
        this.config.get<string>('SMTP_USER'),
      to: options.to,
      subject: options.subject,
      ...(options.isHtml
        ? { html: options.content }
        : { text: options.content }),
    });
    if (!info.accepted.length) {
      throw new Error('SMTP did not accept the recipient');
    }
    return { success: true, messageId: info.messageId };
  }

  private createTransporter(): Transporter<SMTPSentMessageInfo> {
    const host = this.config.get<string>('SMTP_HOST');
    const port = Number(this.config.get<string>('SMTP_PORT', '587'));
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');
    if (
      !host ||
      !user ||
      !pass ||
      !Number.isInteger(port) ||
      port < 1 ||
      port > 65535
    ) {
      throw new ServiceUnavailableException('SMTP provider is not configured');
    }
    return createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }
}
