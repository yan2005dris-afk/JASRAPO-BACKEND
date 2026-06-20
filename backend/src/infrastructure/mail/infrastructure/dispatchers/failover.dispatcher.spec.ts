import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { FailoverDispatcher } from './failover.dispatcher';
import { MailRateLimitService } from '../rate-limit/mail-rate-limit.service';
import type { MailProviderConfig } from '../../../domain/config/mail-provider-config.interface';
import type * as nodemailer from 'nodemailer';

const mockSendMail = jest.fn();

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: mockSendMail,
  })),
}));

describe('FailoverDispatcher', () => {
  let dispatcher: FailoverDispatcher;

  const mockRateLimitService = {
    tryAcquire: jest.fn(),
    release: jest.fn(),
  };

  const providers: MailProviderConfig[] = [
    {
      name: 'brevo',
      enabled: true,
      priority: 1,
      strategy: 'failover',
      rateLimit: { maxPerDay: 300 },
      transport: {
        host: 'smtp.brevo.com',
        port: 587,
        auth: { user: 'u', pass: 'p' },
      },
    },
    {
      name: 'gmail',
      enabled: true,
      priority: 2,
      strategy: 'failover',
      rateLimit: { maxPerDay: 500 },
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        auth: { user: 'u', pass: 'p' },
      },
    },
  ];

  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Test" <test@test.com>',
    to: 'recipient@test.com',
    subject: 'Test',
    html: '<p>Hello</p>',
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockRateLimitService.tryAcquire.mockResolvedValue(true);
    mockRateLimitService.release.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FailoverDispatcher,
        { provide: MailRateLimitService, useValue: mockRateLimitService },
      ],
    }).compile();

    dispatcher = module.get(FailoverDispatcher);
  });

  describe('E05: All providers fail', () => {
    it('should send using the first enabled provider by priority', async () => {
      mockSendMail.mockResolvedValue({ messageId: 'msg-1' });

      const result = await dispatcher.send(mailOptions, providers);

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('msg-1');
      expect(mockSendMail).toHaveBeenCalledTimes(1);
    });

    it('should fallback to gmail when brevo fails', async () => {
      mockSendMail
        .mockRejectedValueOnce(new Error('brevo down'))
        .mockResolvedValueOnce({ messageId: 'msg-2' });

      const result = await dispatcher.send(mailOptions, providers);

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('msg-2');
      expect(mockSendMail).toHaveBeenCalledTimes(2);
      expect(mockRateLimitService.release).toHaveBeenCalledWith('brevo');
    });

    it('should skip provider when rate limit is reached', async () => {
      mockRateLimitService.tryAcquire
        .mockResolvedValueOnce(false) // brevo limit reached
        .mockResolvedValueOnce(true); // gmail available

      mockSendMail.mockResolvedValueOnce({ messageId: 'msg-gmail' });

      const result = await dispatcher.send(mailOptions, providers);

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('msg-gmail');
      expect(mockSendMail).toHaveBeenCalledTimes(1); // Only gmail
      expect(mockRateLimitService.tryAcquire).toHaveBeenCalledTimes(2);
    });

    it('should return failure when all providers fail', async () => {
      mockSendMail.mockRejectedValue(new Error('provider down'));

      const result = await dispatcher.send(mailOptions, providers);

      expect(result.success).toBe(false);
      expect(result.error).toBe('All mail providers failed');
    });

    it('should return failure when no providers are enabled', async () => {
      const noProviders: MailProviderConfig[] = [
        { ...providers[0], enabled: false },
        { ...providers[1], enabled: false },
      ];

      const result = await dispatcher.send(mailOptions, noProviders);

      expect(result.success).toBe(false);
      expect(result.error).toBe('No mail providers configured');
    });

    it('should handle concurrent sends via Promise.all', async () => {
      mockSendMail.mockResolvedValue({ messageId: 'msg-concurrent' });
      mockRateLimitService.tryAcquire.mockResolvedValue(true);

      const results = await Promise.all(
        Array.from({ length: 5 }, () =>
          dispatcher.send(mailOptions, providers),
        ),
      );

      expect(results.length).toBe(5);
      expect(results.every((r) => r.success)).toBe(true);
      expect(mockSendMail).toHaveBeenCalledTimes(5);
    });
  });
});
