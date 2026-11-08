import {
  BadGatewayException,
  BadRequestException,
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IMailProvider,
  MailSendResult,
  SendMailOptions,
} from './mail-provider.interface';
import { MailProvider } from './mail-provider.enum';
import { MAIL_PROVIDERS } from './mail.constants';

@Injectable()
export class MailService {
  private readonly providers = new Map<string, IMailProvider>();
  private readonly defaultProvider: string;

  constructor(
    @Inject(MAIL_PROVIDERS) providers: IMailProvider[],
    config: ConfigService,
  ) {
    providers.forEach((provider) => this.register(provider));
    this.defaultProvider = config.get<string>(
      'MAIL_DEFAULT_PROVIDER',
      MailProvider.MOCK,
    );
    if (!this.providers.has(this.defaultProvider)) {
      throw new Error('Unknown default mail provider');
    }
  }

  register(provider: IMailProvider): void {
    if (this.providers.has(provider.name)) {
      throw new Error(`Duplicate mail provider: ${provider.name}`);
    }
    this.providers.set(provider.name, provider);
  }

  async send({
    provider: name,
    ...options
  }: SendMailOptions & { provider?: string }): Promise<MailSendResult> {
    const provider = this.providers.get(name ?? this.defaultProvider);
    if (!provider) {
      throw new BadRequestException('Unknown mail provider');
    }

    try {
      const result = await provider.send(options);
      if (!result.success) {
        throw new Error('Provider did not accept the message');
      }
      return result;
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }
      throw new BadGatewayException('Mail delivery failed');
    }
  }
}
