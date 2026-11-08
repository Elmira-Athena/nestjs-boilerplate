import { ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport } from 'nodemailer';
import { SmtpMailProvider } from './smtp-mail.provider';

const mockSendMail = jest.fn();
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({ sendMail: mockSendMail })),
}));

const settings = {
  SMTP_HOST: 'smtp.example.com',
  SMTP_PORT: '587',
  SMTP_USER: 'sender@example.com',
  SMTP_PASS: 'test-password',
  SMTP_FROM: 'OOP <sender@example.com>',
};
const mail = {
  to: 'student@example.com',
  subject: 'OOP',
  content: '<b>Hello</b>',
};

describe('SmtpMailProvider adapter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSendMail.mockResolvedValue({
      messageId: 'smtp-id',
      accepted: ['student@example.com'],
      rejected: [],
      envelope: { from: 'sender@example.com', to: ['student@example.com'] },
      response: '250 OK',
    });
  });

  it('maps text/HTML and normalizes the SMTP result, reusing its transporter', async () => {
    const provider = new SmtpMailProvider(new ConfigService(settings));
    await expect(provider.send(mail)).resolves.toEqual({
      success: true,
      messageId: 'smtp-id',
    });
    await provider.send({ ...mail, isHtml: true });
    expect(createTransport).toHaveBeenCalledTimes(1);
    expect(createTransport).toHaveBeenCalledWith({
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      auth: { user: 'sender@example.com', pass: 'test-password' },
    });
    expect(mockSendMail).toHaveBeenNthCalledWith(1, {
      from: 'OOP <sender@example.com>',
      to: 'student@example.com',
      subject: 'OOP',
      text: '<b>Hello</b>',
    });
    expect(mockSendMail).toHaveBeenNthCalledWith(2, {
      from: 'OOP <sender@example.com>',
      to: 'student@example.com',
      subject: 'OOP',
      html: '<b>Hello</b>',
    });
  });

  it('uses TLS on port 465 and SMTP_USER when SMTP_FROM is omitted', async () => {
    await new SmtpMailProvider(
      new ConfigService({
        ...settings,
        SMTP_PORT: '465',
        SMTP_FROM: undefined,
      }),
    ).send(mail);
    expect(createTransport).toHaveBeenCalledWith(
      expect.objectContaining({ secure: true, port: 465 }),
    );
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({ from: 'sender@example.com' }),
    );
  });

  it.each([
    { SMTP_HOST: '' },
    { SMTP_USER: '' },
    { SMTP_PASS: '' },
    { SMTP_PORT: 'abc' },
    { SMTP_PORT: '0' },
    { SMTP_PORT: '65536' },
    { SMTP_PORT: '25.5' },
  ])('rejects invalid SMTP config %j before connecting', async (invalid) => {
    const provider = new SmtpMailProvider(
      new ConfigService({ ...settings, ...invalid }),
    );
    await expect(provider.send(mail)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    expect(createTransport).not.toHaveBeenCalled();
  });

  it('propagates network errors rather than reporting delivery', async () => {
    mockSendMail.mockRejectedValue(new Error('connection failed'));
    await expect(
      new SmtpMailProvider(new ConfigService(settings)).send(mail),
    ).rejects.toThrow('connection failed');
  });

  it('does not report delivery when SMTP accepted no recipient', async () => {
    mockSendMail.mockResolvedValue({
      messageId: 'rejected',
      accepted: [],
      rejected: [mail.to],
    });
    await expect(
      new SmtpMailProvider(new ConfigService(settings)).send(mail),
    ).rejects.toThrow();
  });
});
