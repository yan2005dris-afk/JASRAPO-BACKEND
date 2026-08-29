import { OperatorController } from './operator.controller';
jest.mock('../../application/reading-upload.helper', () => ({
  uploadReadingPhoto: jest.fn().mockResolvedValue('readings/deterministic.jpg'),
  rollbackReadingPhoto: jest.fn().mockResolvedValue(undefined),
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
      undefined as any,
      undefined as any,
      useCase as any,
      undefined as any,
      undefined as any,
      undefined as any,
      routesUseCase as any,
      undefined as any,
      undefined as any,
      storage as any,
    );
    useCase.execute.mockResolvedValue(entity);
    routesUseCase.execute.mockResolvedValue([]);
  });

  it('forwards the operator identity and route filter', async () => {
    await expect(
      controller.getOperatorRoutes({ sub: '17' } as any, 'LECTURA' as any),
    ).resolves.toEqual([]);
    expect(routesUseCase.execute).toHaveBeenCalledWith(17, 'LECTURA');
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
