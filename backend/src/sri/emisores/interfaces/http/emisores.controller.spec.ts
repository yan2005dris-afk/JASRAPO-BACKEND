import {
  EmisoresController,
  EMISOR_CERTIFICATE_UPLOAD_OPTIONS,
} from './emisores.controller';
import { MAX_UPLOAD_SIZE_BYTES } from 'src/infrastructure/config/app.constants';

describe('EmisoresController certificate endpoints', () => {
  const service = {
    uploadCertificado: jest.fn(),
    deleteCertificado: jest.fn(),
  };
  let controller: EmisoresController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new EmisoresController(service as any, undefined as any);
  });

  it('forwards the multipart certificate and password to the service', async () => {
    const response = { id: '1', tieneCertificado: true };
    service.uploadCertificado.mockResolvedValue(response);
    const file = { buffer: Buffer.from('certificate') } as Express.Multer.File;

    await expect(
      controller.uploadCertificado(1, file, { password: 'secret' }),
    ).resolves.toBe(response);

    expect(service.uploadCertificado).toHaveBeenCalledWith(
      1,
      file.buffer,
      'secret',
    );
  });

  it('rejects requests without a certificate file', async () => {
    await expect(
      controller.uploadCertificado(1, undefined as any, { password: 'secret' }),
    ).rejects.toThrow('El archivo del certificado es requerido');
    expect(service.uploadCertificado).not.toHaveBeenCalled();
  });

  it('forwards certificate deletion to the service', async () => {
    const response = { id: '1', tieneCertificado: false };
    service.deleteCertificado.mockResolvedValue(response);

    await expect(controller.deleteCertificado(1)).resolves.toBe(response);
    expect(service.deleteCertificado).toHaveBeenCalledWith(1);
  });

  it('limits uploads and accepts only P12/PFX certificates', () => {
    expect(EMISOR_CERTIFICATE_UPLOAD_OPTIONS.limits).toEqual({
      fileSize: MAX_UPLOAD_SIZE_BYTES,
    });
    const filter = EMISOR_CERTIFICATE_UPLOAD_OPTIONS.fileFilter!;
    const accepted = jest.fn();
    filter(
      {} as any,
      {
        originalname: 'firma.p12',
        mimetype: 'application/x-pkcs12',
      } as any,
      accepted,
    );
    expect(accepted).toHaveBeenCalledWith(null, true);

    const rejected = jest.fn();
    filter(
      {} as any,
      {
        originalname: 'firma.png',
        mimetype: 'image/png',
      } as any,
      rejected,
    );
    expect(rejected).toHaveBeenCalledWith(expect.any(Error), false);
  });
});
