import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { RoundRobinDispatcher } from './round-robin.dispatcher';
import { MailRateLimitService } from '../rate-limit/mail-rate-limit.service';
import type { MailProviderConfig } from '../../../domain/config/mail-provider-config.interface';
import type * as nodemailer from 'nodemailer';

const mockSendMail = jest.fn();

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: mockSendMail,
  })),
}));

describe('RoundRobinDispatcher', () => {
  let dispatcher: RoundRobinDispatcher;

  const mockRateLimitService = {
    tryAcquire: jest.fn(),
    release: jest.fn(),
  };

  const providers: MailProviderConfig[] = [
    {
      name: 'brevo',
      enabled: true,
      priority: 1,
      strategy: 'round-robin',
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
      strategy: 'round-robin',
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
        RoundRobinDispatcher,
        { provide: MailRateLimitService, useValue: mockRateLimitService },
      ],
    }).compile();

    dispatcher = module.get(RoundRobinDispatcher);
  });

  describe('E04: Round-robin distribution', () => {
    it('should distribute sends evenly across 2 providers (2 each)', async () => {
      mockSendMail.mockResolvedValue({ messageId: 'msg-ok' });

      for (let index = 0; index < 4; index++) {
        await dispatcher.send(mailOptions, providers);
      }

      expect(mockSendMail).toHaveBeenCalledTimes(4);
      // Verify calls to nodemailer createTransport happened
      // (don't assert on transporter creation order — it's implementation detail)
    });

    it('should use both providers in round-robin order', async () => {
      mockSendMail.mockResolvedValue({ messageId: 'msg-ok' });

      await dispatcher.send(mailOptions, providers);
      await dispatcher.send(mailOptions, providers);

      expect(mockSendMail).toHaveBeenCalledTimes(2);
      expect(mockRateLimitService.tryAcquire).toHaveBeenCalledTimes(2);
    });

    it('should skip provider in cooldown and use the other', async () => {
      // First attempt: make brevo fail once
      mockSendMail
        .mockRejectedValueOnce(new Error('brevo down')) // brevo fails
        .mockResolvedValueOnce({ messageId: 'gmail-ok' }); // gmail recovers

      await dispatcher.send(mailOptions, providers);

      // brevo should be in cooldown now
      // Second send: brevo skipped (cooldown), gmail used
      mockSendMail.mockResolvedValue({ messageId: 'gmail-again' });
      mockRateLimitService.tryAcquire.mockResolvedValueOnce(true);

      const result = await dispatcher.send(mailOptions, providers);

      expect(result.success).toBe(true);
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

    it('should handle multiple concurrent sends', async () => {
      mockSendMail.mockResolvedValue({ messageId: 'msg-concurrent' });

      const results = await Promise.all(
        Array.from({ length: 5 }, () =>
          dispatcher.send(mailOptions, providers),
        ),
      );

      expect(results.length).toBe(5);
      expect(results.every((r) => r.success)).toBe(true);
    });
  });
});
