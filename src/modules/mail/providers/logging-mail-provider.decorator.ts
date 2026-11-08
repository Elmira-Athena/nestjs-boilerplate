import { Logger } from '@nestjs/common';
import {
  IMailProvider,
  MailSendResult,
  SendMailOptions,
} from '../mail-provider.interface';

export class LoggingMailProviderDecorator implements IMailProvider {
  private readonly logger = new Logger(LoggingMailProviderDecorator.name);

  constructor(private readonly inner: IMailProvider) {}

  get name(): string {
    return this.inner.name;
  }

  async send(options: SendMailOptions): Promise<MailSendResult> {
    try {
      const result = await this.inner.send(options);
      this.logger.log({ provider: this.name, ...result });
      return result;
    } catch (error) {
      this.logger.error({ provider: this.name, success: false });
      throw error;
    }
  }
}
