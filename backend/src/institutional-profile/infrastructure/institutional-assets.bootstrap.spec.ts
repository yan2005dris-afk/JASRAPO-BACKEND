import { InstitutionalAssetsBootstrap } from './institutional-assets.bootstrap';

describe('InstitutionalAssetsBootstrap', () => {
  const storage = {
    exists: jest.fn(),
    upload: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('conserva el activo versionado cuando ya existe', async () => {
    storage.exists.mockResolvedValue(true);
    const bootstrap = new InstitutionalAssetsBootstrap(storage as never);

    await bootstrap.onApplicationBootstrap();

    expect(storage.upload).not.toHaveBeenCalled();
  });

  it('publica el activo inicial en la referencia de la versión v1', async () => {
    storage.exists.mockResolvedValue(false);
    storage.upload.mockResolvedValue({ key: 'profiles/v1/logo.jpeg' });
    const bootstrap = new InstitutionalAssetsBootstrap(storage as never);

    await bootstrap.onApplicationBootstrap();

    expect(storage.upload).toHaveBeenCalledWith(
      'institutional-assets',
      'profiles/v1/logo.jpeg',
      expect.any(Buffer),
      { contentType: 'image/jpeg' },
    );
  });
});
