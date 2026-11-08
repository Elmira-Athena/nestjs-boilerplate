export interface SendMailOptions {
  to: string;
  subject: string;
  content: string;
  isHtml?: boolean;
}

export interface MailSendResult {
  success: boolean;
  messageId?: string;
}

export interface IMailProvider {
  readonly name: string;
  send(options: SendMailOptions): Promise<MailSendResult>;
}
