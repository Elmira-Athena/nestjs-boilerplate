import { Logger } from '@nestjs/common';
import { LoggingMailProviderDecorator } from './logging-mail-provider.decorator';
import { MockMailProvider } from './mock-mail.provider';

const mail = {
  to: 'student@example.com',
  subject: 'OOP',
  content: 'private body',
};

describe('Mail logging', () => {
  afterEach(() => jest.restoreAllMocks());

  it('mock logs the message without sending a real email', async () => {
    const log = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    await expect(new MockMailProvider().send(mail)).resolves.toEqual({
      success: true,
    });
    expect(log).toHaveBeenCalledWith(mail);
  });

  it('decorates a provider without changing its result or logging content', async () => {
    const log = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    const received = [];
    const provider = new LoggingMailProviderDecorator({
      name: 'smtp',
      async send(options) {
        received.push(options);
        return { success: true, messageId: 'id' };
      },
    });
    expect(provider.name).toBe('smtp');
    await expect(provider.send(mail)).resolves.toEqual({
      success: true,
      messageId: 'id',
    });
    expect(received).toEqual([mail]);
    expect(log).toHaveBeenCalledWith({
      provider: 'smtp',
      success: true,
      messageId: 'id',
    });
  });

  it('logs failure metadata and preserves the original exception', async () => {
    const log = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    const failure = new Error('secret provider details');
    const provider = new LoggingMailProviderDecorator({
      name: 'smtp',
      async send() {
        throw failure;
      },
    });
    await expect(provider.send(mail)).rejects.toBe(failure);
    expect(log).toHaveBeenCalledWith({ provider: 'smtp', success: false });
  });
});
