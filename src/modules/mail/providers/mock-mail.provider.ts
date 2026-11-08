import { Injectable, Logger } from '@nestjs/common';
import {
  IMailProvider,
  MailSendResult,
  SendMailOptions,
} from '../mail-provider.interface';
import { MailProvider } from '../mail-provider.enum';

@Injectable()
export class MockMailProvider implements IMailProvider {
  readonly name = MailProvider.MOCK;
  private readonly logger = new Logger(MockMailProvider.name);

  async send(options: SendMailOptions): Promise<MailSendResult> {
    this.logger.log(options);
    return { success: true };
  }
}
