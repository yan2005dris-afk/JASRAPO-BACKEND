import { BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { OperatorController } from './operator.controller';
import { UpdateOperatorWorkOrderDto } from '../dto/update-operator-work-order.dto';
import { PERMISSION_KEY } from 'src/infrastructure/common/decorators/require-permission.decorator';
jest.mock('../../application/reading-upload.helper', () => ({
  uploadReadingPhoto: jest.fn().mockResolvedValue('readings/deterministic.jpg'),
  rollbackReadingPhoto: jest.fn().mockResolvedValue(undefined),
  deleteOldReadingPhoto: jest.fn().mockResolvedValue(undefined),
}));

import {
  uploadReadingPhoto,
  rollbackReadingPhoto,
} from '../../application/reading-upload.helper';

describe('OperatorController work-order update', () => {
  const useCase = { execute: jest.fn() };
  const routesUseCase = { execute: jest.fn() };
  const storage = { upload: jest.fn(), delete: jest.fn() };
  let controller: OperatorController;
  const entity = {
    ordenTrabajoId: 42n,
    rutaId: 8n,
    contratoId: 9n,
    medidorId: 3n,
    tipoActividad: 'INSTALACION',
    estado: 'COMPLETADA',
    ordenVisita: 1,
    resultadoObservacion: 'done',
    evidenciaFotoUrl: 'readings/deterministic.jpg',
    completadoEn: new Date('2026-08-26T12:00:00.000Z'),
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    lecturaId: null,
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new OperatorController(
      useCase as any,
      routesUseCase as any,
      undefined as any,
      storage as any,
      undefined as any,
      undefined as any,
    );
    useCase.execute.mockResolvedValue(entity);
    routesUseCase.execute.mockResolvedValue([]);
  });

  it('protects the manifest with operator-sync:read', () => {
    expect(
      Reflect.getMetadata(
        PERMISSION_KEY,
        OperatorController.prototype.syncManifest,
      ),
    ).toEqual({ recurso: 'operator-sync', accion: 'read' });
    expect(
      Reflect.getMetadata('path', OperatorController.prototype.syncManifest),
    ).toEqual('sync/manifest');
  });

  it('wires the paginated sync manifest to the authenticated operator', async () => {
    const manifest = {
      execute: jest.fn().mockResolvedValue({ complete: true }),
    };
    const wired = new OperatorController(
      undefined as any,
      undefined as any,
      undefined as any,
      storage as any,
      manifest as any,
      undefined as any,
    );
    await wired.syncManifest({ sub: '17' } as any, 'opaque-cursor', '25');
    expect(manifest.execute).toHaveBeenCalledWith(17, 'opaque-cursor', 25);
  });

  it('forwards the operator identity and route filter', async () => {
    await expect(
      controller.getOperatorRoutes({ sub: '17' } as any, 'LECTURA' as any),
    ).resolves.toEqual([]);
    expect(routesUseCase.execute).toHaveBeenCalledWith(17, 'LECTURA');
  });

  it.each([
    undefined,
    0,
    -1,
    NaN,
    Infinity,
    Number.MAX_SAFE_INTEGER + 1,
    'not-a-number',
  ])('rejects an invalid authenticated operator ID (%p)', async (sub) => {
    await expect(
      controller.getOperatorRoutes({ sub } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(routesUseCase.execute).not.toHaveBeenCalled();
  });

  it('rejects an invalid operator ID before uploading work-order evidence', async () => {
    await expect(
      controller.updateOperatorWorkOrder(42n, { sub: 0 } as any, {}, {
        buffer: Buffer.from('x'),
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(uploadReadingPhoto).not.toHaveBeenCalled();
    expect(useCase.execute).not.toHaveBeenCalled();
  });

  it('passes the returned RustFS key and converts response IDs', async () => {
    const response = await controller.updateOperatorWorkOrder(
      42n,
      { sub: '17' } as any,
      { estado: 'COMPLETADA' } as any,
      {
        originalname: 'evidence.png',
        mimetype: 'image/png',
        buffer: Buffer.from('x'),
      } as any,
    );
    expect(uploadReadingPhoto).toHaveBeenCalled();
    expect(useCase.execute).toHaveBeenCalledWith(
      42n,
      17,
      { estado: 'COMPLETADA' },
      'readings/deterministic.jpg',
      expect.any(Function),
    );
    expect(response.ordenTrabajoId).toBe('42');
    expect(response.rutaId).toBe('8');
    expect(response.lecturaId).toBeNull();
  });

  it('rolls back storage when the use case fails', async () => {
    const error = new Error('database failure');
    useCase.execute.mockRejectedValue(error);
    await expect(
      controller.updateOperatorWorkOrder(
        42n,
        { sub: '17' } as any,
        {},
        {} as any,
      ),
    ).rejects.toBe(error);
    expect(rollbackReadingPhoto).toHaveBeenCalledWith(
      'readings/deterministic.jpg',
      storage,
    );
  });
});
