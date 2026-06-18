import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailProviderFactory } from './provider.factory';
import { MailRateLimitService } from '../mail-rate-limit.service';
import type { SendMailOptions } from '../interfaces/mail-provider.interface';

const mockSendMail = jest.fn();

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: mockSendMail,
  })),
}));

jest.mock('fs', () => ({
  readFileSync: jest.fn(() => '<p>Hola {{nombre}}</p>'),
}));

describe('MailProviderFactory', () => {
  let factory: MailProviderFactory;

  const mockRateLimitService = {
    tryAcquire: jest.fn(),
    release: jest.fn(),
  };

  const baseOptions: SendMailOptions = {
    to: 'cliente@test.com',
    subject: 'Test',
    template: 'planilla',
    context: { nombre: 'Juan' },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockRateLimitService.tryAcquire.mockResolvedValue(true);
    mockRateLimitService.release.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailProviderFactory,
        {
          provide: MailRateLimitService,
          useValue: mockRateLimitService,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: string) => {
              const values: Record<string, string> = {
                BREVO_SMTP_USER: 'brevo-user',
                BREVO_SMTP_PASS: 'brevo-pass',
                EMAIL_USER: 'gmail-user',
                EMAIL_PASSWORD: 'gmail-pass',
                EMAIL_FROM: 'no-reply@jasrapo.com',
                EMAIL_FROM_NAME: 'JASRAP-Olon',
              };
              return values[key] ?? defaultValue;
            }),
          },
        },
      ],
    }).compile();

    factory = module.get(MailProviderFactory);
  });

  it('should send using the first available provider', async () => {
    mockSendMail.mockResolvedValue({ messageId: 'msg-1' });

    const result = await factory.send(baseOptions);

    expect(result.success).toBe(true);
    expect(result.messageId).toBe('msg-1');
    expect(mockSendMail).toHaveBeenCalledTimes(1);
  });

  it('should fallback to gmail when brevo fails', async () => {
    mockSendMail
      .mockRejectedValueOnce(new Error('brevo down'))
      .mockResolvedValueOnce({ messageId: 'msg-2' });

    const result = await factory.send(baseOptions);

    expect(result.success).toBe(true);
    expect(result.messageId).toBe('msg-2');
    expect(mockSendMail).toHaveBeenCalledTimes(2);
    expect(mockRateLimitService.release).toHaveBeenCalledWith('brevo');
  });

  it('should fallback to gmail when brevo rate limit is reached', async () => {
    mockRateLimitService.tryAcquire
      .mockResolvedValueOnce(false) // brevo limit reached
      .mockResolvedValueOnce(true); // gmail available

    mockSendMail.mockResolvedValueOnce({ messageId: 'msg-fallback' });

    const result = await factory.send(baseOptions);

    expect(result.success).toBe(true);
    expect(result.messageId).toBe('msg-fallback');
    expect(mockSendMail).toHaveBeenCalledTimes(1); // Only called for gmail
    expect(mockRateLimitService.tryAcquire).toHaveBeenCalledTimes(2);
  });

  it('should return failure when all providers fail', async () => {
    mockSendMail.mockRejectedValue(new Error('provider down'));

    const result = await factory.send(baseOptions);

    expect(result.success).toBe(false);
    expect(result.error).toBe('All mail providers failed');
  });

  it('should mask recipient emails in operational logs', async () => {
    const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    mockSendMail.mockResolvedValue({ messageId: 'msg-1' });

    await factory.send(baseOptions);

    expect(logSpy.mock.calls[0]?.[0]).toContain('c***@test.com');
    expect(logSpy.mock.calls[0]?.[0]).not.toContain('cliente@test.com');

    logSpy.mockRestore();
  });

  it('should handle multiple concurrent sends via Promise.all properly', async () => {
    mockSendMail.mockResolvedValue({ messageId: 'msg-concurrent' });
    mockRateLimitService.tryAcquire.mockResolvedValue(true);

    const promises = Array.from({ length: 5 }, () => factory.send(baseOptions));
    const results = await Promise.all(promises);

    expect(results.length).toBe(5);
    expect(results.every((r) => r.success)).toBe(true);
    expect(mockSendMail).toHaveBeenCalledTimes(5);
    expect(mockRateLimitService.tryAcquire).toHaveBeenCalledTimes(5);
  });
});
