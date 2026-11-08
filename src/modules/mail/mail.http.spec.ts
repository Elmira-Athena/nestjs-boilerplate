import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { SendMailOptions } from './mail-provider.interface';
import { MailModule } from './mail.module';
import { SmtpMailProvider } from './providers/smtp-mail.provider';

describe('POST /api/v1/mail/send', () => {
  let app: INestApplication;
  let url: string;
  const mail = { to: 'student@example.com', subject: 'OOP', content: 'Hello' };

  const send = (body: object) =>
    fetch(`${url}/api/v1/mail/send`, {
      method: 'POST',
      headers: [['Content-Type', 'application/json']],
      body: JSON.stringify(body),
    });

  beforeAll(async () => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    const module = await Test.createTestingModule({ imports: [MailModule] })
      .overrideProvider(ConfigService)
      .useValue(new ConfigService({ MAIL_DEFAULT_PROVIDER: 'mock' }))
      .overrideProvider(SmtpMailProvider)
      .useValue({
        name: 'smtp',
        async send(options: SendMailOptions) {
          if (options.subject === 'fail')
            throw new Error('SMTP password=secret');
          return {
            success: true,
            messageId: options.isHtml ? 'html-id' : 'text-id',
          };
        },
      })
      .compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('/api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        stopAtFirstError: true,
        transform: true,
      }),
    );
    // Simulate the existing global filters which replace validation responses.
    app.useGlobalFilters({
      catch: (_error, host) =>
        host
          .switchToHttp()
          .getResponse()
          .status(599)
          .json({ message: 'global filter' }),
    });
    await app.listen(0, '127.0.0.1');
    url = await app.getUrl();
  });

  afterAll(async () => {
    await app?.close();
    jest.restoreAllMocks();
  });

  it('uses mock by default without SMTP config, credentials or a database', async () => {
    const response = await send(mail);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
  });

  it('lets the caller select SMTP and preserves isHtml', async () => {
    const response = await send({
      ...mail,
      content: '<b>Hello</b>',
      isHtml: true,
      provider: 'smtp',
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      messageId: 'html-id',
    });
  });

  it('keeps the ValidationPipe error list despite a global exception filter', async () => {
    const response = await send({ to: 'invalid-email-format', subject: '' });
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      statusCode: 400,
      message: expect.arrayContaining([
        expect.stringContaining('to'),
        expect.stringContaining('subject'),
        expect.stringContaining('content'),
      ]),
    });
  });

  it.each([
    { provider: 'sendgrid' },
    { isHtml: 'true' },
    { subject: '   ' },
    { content: ' \n ' },
    { subject: 1 },
    { content: null },
    { to: null },
  ])('rejects invalid fields %j', async (invalid) => {
    expect((await send({ ...mail, ...invalid })).status).toBe(400);
  });

  it('accepts an explicit null provider as omitted, matching IsOptional', async () => {
    expect((await send({ ...mail, provider: null })).status).toBe(200);
  });

  it('hides SMTP error details in a 502 response', async () => {
    const response = await send({ ...mail, subject: 'fail', provider: 'smtp' });
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      statusCode: 502,
      message: 'Mail delivery failed',
      error: 'Bad Gateway',
    });
  });
});
