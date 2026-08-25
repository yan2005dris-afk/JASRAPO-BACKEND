import { Readable } from 'node:stream';
import { UnprocessableEntityException } from '@nestjs/common';
import { StorageInstitutionalAssetAdapter } from './storage-institutional-asset.adapter';

describe('StorageInstitutionalAssetAdapter', () => {
  const storage = {
    exists: jest.fn(),
    getObject: jest.fn(),
  };
  const reference = {
    contenedor: 'institutional-assets',
    clave: 'profiles/v2/logo.png',
    tipoContenido: 'image/png',
  };

  beforeEach(() => jest.clearAllMocks());

  it('resuelve una referencia versionada como data URL estable', async () => {
    storage.exists.mockResolvedValue(true);
    storage.getObject.mockResolvedValue(Readable.from(Buffer.from('logo')));
    const adapter = new StorageInstitutionalAssetAdapter(storage as never);

    const result = await adapter.resolve(reference);

    expect(result).toEqual({
      ...reference,
      url: 'data:image/png;base64,bG9nbw==',
    });
  });

  it('falla antes del render si el activo referenciado no existe', async () => {
    storage.exists.mockResolvedValue(false);
    const adapter = new StorageInstitutionalAssetAdapter(storage as never);

    await expect(adapter.resolve(reference)).rejects.toBeInstanceOf(
      UnprocessableEntityException,
    );
    expect(storage.getObject).not.toHaveBeenCalled();
  });
});
