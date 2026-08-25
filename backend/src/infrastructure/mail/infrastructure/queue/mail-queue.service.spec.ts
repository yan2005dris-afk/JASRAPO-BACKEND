import type { SendMailOptions } from '../../domain/interfaces/mail-provider.interface';
import { MailQueueService } from './mail-queue.service';

describe('MailQueueService', () => {
  const jobsService = {
    send: jest.fn(),
    insert: jest.fn(),
    work: jest.fn(),
  };
  const mailProviderFactory = {
    send: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jobsService.work.mockResolvedValue(undefined);
    mailProviderFactory.send.mockResolvedValue({
      success: true,
      messageId: 'message-1',
    });
  });

  it('restores a version 2 inline Buffer after pg-boss serialization', async () => {
    const service = new MailQueueService(
      jobsService as never,
      mailProviderFactory as never,
    );
    const originalContent = Buffer.from('pdf-content');
    const queuedData: SendMailOptions = {
      version: 2,
      to: 'client@example.com',
      subject: 'Reporte',
      attachments: [
        {
          filename: 'report.pdf',
          content: originalContent,
          contentType: 'application/pdf',
        },
      ],
    };
    const persistedData = JSON.parse(
      JSON.stringify(queuedData),
    ) as SendMailOptions;

    expect(Buffer.isBuffer(persistedData.attachments?.[0]?.content)).toBe(
      false,
    );

    await service.onModuleInit();
    const worker = jobsService.work.mock.calls[0]?.[1] as (
      jobs: Array<{ data: SendMailOptions }>,
    ) => Promise<void>;
    await worker([{ data: persistedData }]);

    const delivered = mailProviderFactory.send.mock.calls[0]?.[0] as
      | SendMailOptions
      | undefined;
    const deliveredContent = delivered?.attachments?.[0]?.content;
    expect(Buffer.isBuffer(deliveredContent)).toBe(true);
    expect(deliveredContent).toEqual(originalContent);
  });
});
