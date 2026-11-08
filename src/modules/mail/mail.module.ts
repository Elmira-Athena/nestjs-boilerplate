import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IMailProvider } from './mail-provider.interface';
import { MAIL_PROVIDERS } from './mail.constants';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { LoggingMailProviderDecorator } from './providers/logging-mail-provider.decorator';
import { MockMailProvider } from './providers/mock-mail.provider';
import { SmtpMailProvider } from './providers/smtp-mail.provider';

@Module({
  imports: [ConfigModule],
  controllers: [MailController],
  providers: [
    SmtpMailProvider,
    MockMailProvider,
    {
      provide: MAIL_PROVIDERS,
      inject: [SmtpMailProvider, MockMailProvider],
      useFactory: (...providers: IMailProvider[]): IMailProvider[] =>
        providers.map((provider) => new LoggingMailProviderDecorator(provider)),
    },
    MailService,
  ],
  exports: [MailService],
})
export class MailModule {}
