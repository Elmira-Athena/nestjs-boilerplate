import {
  BadGatewayException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IMailProvider, SendMailOptions } from './mail-provider.interface';
import { MailService } from './mail.service';

const mail = { to: 'student@example.com', subject: 'OOP', content: 'Hello' };

describe('MailService registry', () => {
  const sent: string[] = [];
  const provider = (name: string): IMailProvider => ({
    name,
    async send(options: SendMailOptions) {
      sent.push(`${name}:${options.to}`);
      return { success: true, messageId: `${name}-id` };
    },
  });

  beforeEach(() => sent.splice(0));

  it('uses the configured default and lets the request override it', async () => {
    const service = new MailService(
      [provider('mock'), provider('smtp')],
      new ConfigService({ MAIL_DEFAULT_PROVIDER: 'smtp' }),
    );
    await expect(service.send(mail)).resolves.toEqual({
      success: true,
      messageId: 'smtp-id',
    });
    await service.send({ ...mail, provider: 'mock' });
    expect(sent).toEqual([
      'smtp:student@example.com',
      'mock:student@example.com',
    ]);
  });

  it('defaults to mock and supports a newly registered strategy', async () => {
    const service = new MailService([provider('mock')], new ConfigService());
    await service.send(mail);
    service.register(provider('resend'));
    await service.send({ ...mail, provider: 'resend' });
    expect(sent).toEqual([
      'mock:student@example.com',
      'resend:student@example.com',
    ]);
  });

  it('rejects unknown names, duplicate registration and an invalid default', async () => {
    const service = new MailService([provider('mock')], new ConfigService());
    await expect(
      service.send({ ...mail, provider: 'missing' }),
    ).rejects.toThrow('Unknown mail provider');
    expect(() => service.register(provider('mock'))).toThrow('Duplicate');
    expect(
      () =>
        new MailService(
          [provider('mock')],
          new ConfigService({ MAIL_DEFAULT_PROVIDER: 'missing' }),
        ),
    ).toThrow('Unknown default mail provider');
  });

  it('maps delivery errors to 502 without exposing provider details', async () => {
    const service = new MailService(
      [
        {
          name: 'mock',
          async send() {
            throw new Error('SMTP password=secret');
          },
        },
      ],
      new ConfigService(),
    );
    await expect(service.send(mail)).rejects.toEqual(
      new BadGatewayException('Mail delivery failed'),
    );
  });

  it('does not report success when a strategy returns success=false', async () => {
    const service = new MailService(
      [
        {
          name: 'mock',
          async send() {
            return { success: false };
          },
        },
      ],
      new ConfigService(),
    );
    await expect(service.send(mail)).rejects.toBeInstanceOf(
      BadGatewayException,
    );
  });

  it('preserves a configuration error as HTTP 503', async () => {
    const service = new MailService(
      [
        {
          name: 'mock',
          async send() {
            throw new ServiceUnavailableException();
          },
        },
      ],
      new ConfigService(),
    );
    await expect(service.send(mail)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
