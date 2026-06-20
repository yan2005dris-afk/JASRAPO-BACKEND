jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'mocked-msg-id' }),
    close: jest.fn(),
    use: jest.fn(),
    verify: jest.fn().mockResolvedValue(true),
  }),
}));

jest.mock('pg-boss', () => ({
  PgBoss: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    start: jest.fn().mockResolvedValue(undefined),
    stop: jest.fn().mockResolvedValue(undefined),
    createQueue: jest.fn().mockResolvedValue(undefined),
    send: jest.fn().mockResolvedValue('job-id'),
    insert: jest.fn().mockResolvedValue(['job-id']),
    work: jest.fn().mockResolvedValue(undefined),
  })),
}));

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from '../../database/prisma.module';
import { MailModule } from '../mail.module';
import { MailService } from '../application/mail.service';
import { MailQueueService } from '../infrastructure/queue/mail-queue.service';
import { MailProviderFactory } from '../infrastructure/providers/provider.factory';
import { FailoverDispatcher } from '../infrastructure/dispatchers/failover.dispatcher';
import { RoundRobinDispatcher } from '../infrastructure/dispatchers/round-robin.dispatcher';
import { JobsService } from '../../jobs/jobs.service';
import { PrismaService } from '../../database/prisma.service';

const MOCK_CONFIG: Record<string, string> = {
  BREVO_SMTP_HOST: 'smtp.test.com',
  BREVO_SMTP_PORT: '587',
  BREVO_SMTP_USER: 'test@test.com',
  BREVO_SMTP_PASS: 'test-pass',
  EMAIL_FROM_NAME: 'Test App',
  EMAIL_FROM: 'test@jasrapo.com',
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
};

const mockPrisma = {
  $queryRawUnsafe: jest.fn().mockResolvedValue([{ sent_count: 1 }]),
  $executeRawUnsafe: jest.fn().mockResolvedValue(undefined),
};

const mockBossInstance = {
  on: jest.fn(),
  start: jest.fn().mockResolvedValue(undefined),
  stop: jest.fn().mockResolvedValue(undefined),
  createQueue: jest.fn().mockResolvedValue(undefined),
  send: jest.fn().mockResolvedValue('job-id'),
  insert: jest.fn().mockResolvedValue(['job-id']),
  work: jest.fn().mockResolvedValue(undefined),
};

const mockJobsService = {
  send: jest.fn().mockResolvedValue('job-id'),
  insert: jest.fn().mockResolvedValue(['job-id']),
  work: jest.fn().mockResolvedValue(undefined),
  getBossInstance: jest.fn().mockReturnValue(mockBossInstance),
  onModuleInit: jest.fn(),
  onModuleDestroy: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(
    (key: string, defaultValue?: string) => MOCK_CONFIG[key] ?? defaultValue,
  ),
};

describe('MailModule Integration', () => {
  let module: TestingModule;
  let mailService: MailService;
  let mailQueueService: MailQueueService;
  let providerFactory: MailProviderFactory;
  let failoverDispatcher: FailoverDispatcher;
  let roundRobinDispatcher: RoundRobinDispatcher;
  let jobsService: JobsService;
  let nodemailer: typeof import('nodemailer');

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          ignoreEnvFile: true,
          isGlobal: true,
          load: [() => MOCK_CONFIG],
        }),
        DatabaseModule,
        MailModule,
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .overrideProvider(JobsService)
      .useValue(mockJobsService)
      .compile();

    mailService = module.get(MailService);
    mailQueueService = module.get(MailQueueService);
    providerFactory = module.get(MailProviderFactory);
    failoverDispatcher = module.get(FailoverDispatcher);
    roundRobinDispatcher = module.get(RoundRobinDispatcher);
    jobsService = module.get(JobsService);

    nodemailer = require('nodemailer');
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Restore rate-limit default mock
    mockPrisma.$queryRawUnsafe.mockResolvedValue([{ sent_count: 1 }]);
  });

  // ──────────────────────────────────────────────
  // Pipeline Completo: MailService → templates → ProviderFactory → dispatcher → nodemailer
  // ──────────────────────────────────────────────

  describe('Pipeline completo de envío', () => {
    it('debe enviar un correo con template a través de todo el pipeline', async () => {
      const result = await mailService.send({
        to: 'cliente@test.com',
        subject: 'Test Asunto',
        template: 'planilla',
        context: {
          nombre: 'Juan',
          periodo: 'Enero 2026',
          montoTotal: '25.50',
          fechaEmision: '01/01/2026',
        },
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('mocked-msg-id');

      // nodemailer.createTransport() fue llamado
      expect(nodemailer.createTransport).toHaveBeenCalled();

      // El template se renderizó correctamente
      const sendMailMock = (nodemailer.createTransport as jest.Mock).mock
        .results[0]?.value.sendMail as jest.Mock;
      const mailOptions = sendMailMock.mock.calls[0]?.[0];
      expect(mailOptions).toBeDefined();
      expect(mailOptions.html).toContain('Juan');
      expect(mailOptions.html).toContain('Enero 2026');
      expect(mailOptions.html).toContain('25.50');

      // Se respetó el from configurado
      expect(mailOptions.from).toBe('"Test App" <test@jasrapo.com>');
    });

    it('debe enviar un correo sin template (solo texto)', async () => {
      const result = await mailService.send({
        to: 'cliente@test.com',
        subject: 'Mensaje directo',
        text: 'Contenido en texto plano',
      });

      expect(result.success).toBe(true);
    });

    it('debe incluir adjuntos inline correctamente', async () => {
      const pdfBuffer = Buffer.from('fake-pdf-content');

      const result = await mailService.send({
        to: 'cliente@test.com',
        subject: 'Con adjunto',
        template: 'planilla',
        context: {
          nombre: 'Test',
          periodo: 'Test',
          montoTotal: '10.00',
          fechaEmision: '01/01/2026',
        },
        attachments: [
          {
            filename: 'documento.pdf',
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      });

      expect(result.success).toBe(true);
    });
  });

  // ──────────────────────────────────────────────
  // Integración con Cola (MailService → MailQueueService → JobsService)
  // ──────────────────────────────────────────────

  describe('Integración con cola de trabajos', () => {
    it('debe encolar un correo vía MailService.sendQueued()', async () => {
      await mailService.sendQueued({
        version: 2,
        to: 'cliente@test.com',
        subject: 'Test Cola',
        template: 'planilla',
        context: {
          nombre: 'Test',
          periodo: 'Enero 2026',
          montoTotal: '50.00',
          fechaEmision: '01/01/2026',
        },
      });

      expect(mockJobsService.send).toHaveBeenCalledWith(
        'send-mail',
        expect.objectContaining({
          to: 'cliente@test.com',
          version: 2,
        }),
        expect.objectContaining({ retryLimit: 3 }),
      );
    });

    it('debe encolar correos en bulk vía MailService.sendBatchPlanillas()', async () => {
      const clientes = Array.from({ length: 5 }, (_, i) => ({
        email: `cliente${i}@test.com`,
        nombre: `Cliente ${i}`,
        monto: '10.00' as unknown as any,
        pdf: Buffer.from(`pdf-${i}`),
      }));

      await mailService.sendBatchPlanillas(clientes, 'Febrero 2026');

      // Verifica que se llamó a insert con los jobs
      expect(mockJobsService.insert).toHaveBeenCalledWith(
        'send-mail',
        expect.arrayContaining([
          expect.objectContaining({
            data: expect.objectContaining({
              to: 'cliente0@test.com',
              version: 2,
            }),
          }),
        ]),
      );
    });

    it('MailQueueService.onModuleInit() debe registrar el worker en JobsService', async () => {
      // onModuleInit ya se llamó en beforeAll, pero clearAllMocks() borró las calls.
      // Llamamos explícitamente para verificar el registro.
      await mailQueueService.onModuleInit();
      expect(mockJobsService.work).toHaveBeenCalledWith(
        'send-mail',
        expect.any(Function),
      );
    });
  });

  // ──────────────────────────────────────────────
  // FailoverDispatcher con Rate Limit
  // ──────────────────────────────────────────────

  describe('FailoverDispatcher con rate limiting', () => {
    it('debe intentar con el provider de mayor prioridad primero', async () => {
      const result = await mailService.send({
        to: 'test@test.com',
        subject: 'Test failover',
        text: 'Mensaje',
      });

      expect(result.success).toBe(true);

      // Verifica que se consultó rate limit para el provider 'brevo'
      expect(mockPrisma.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO mail_provider_daily_counts'),
        'brevo',
        300,
      );
    });

    it('debe fallar si todos los providers alcanzaron el límite diario', async () => {
      mockPrisma.$queryRawUnsafe.mockResolvedValue([]);

      const result = await mailService.send({
        to: 'test@test.com',
        subject: 'Test rate limit',
        text: 'Mensaje',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('All mail providers failed');
    });
  });

  // ──────────────────────────────────────────────
  // RoundRobinDispatcher
  // ──────────────────────────────────────────────

  describe('RoundRobinDispatcher', () => {
    it('debe ser inyectable y tener la estructura esperada', () => {
      expect(roundRobinDispatcher).toBeDefined();
      expect(typeof roundRobinDispatcher.send).toBe('function');
    });
  });

  // ──────────────────────────────────────────────
  // Resolución de adjuntos v2 (MailQueueService)
  // ──────────────────────────────────────────────

  describe('Resolución de adjuntos version:2', () => {
    it('debe encolar adjuntos version:2 correctamente', async () => {
      const pdfBuffer = Buffer.from('inline-pdf');

      await mailQueueService.queueMail({
        version: 2,
        to: 'test@test.com',
        subject: 'Test attachment',
        template: 'planilla',
        context: {
          nombre: 'Test',
          periodo: 'Test',
          montoTotal: '10.00',
          fechaEmision: '01/01/2026',
        },
        attachments: [
          {
            filename: 'doc.pdf',
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      });

      expect(mockJobsService.send).toHaveBeenCalledWith(
        'send-mail',
        expect.objectContaining({
          version: 2,
          attachments: [
            expect.objectContaining({
              filename: 'doc.pdf',
              content: pdfBuffer,
            }),
          ],
        }),
        expect.any(Object),
      );
    });
  });
});
