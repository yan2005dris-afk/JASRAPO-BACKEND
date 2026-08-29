import { PrismaOrdenTrabajoRepository } from './prisma-orden-trabajo.repository';

describe('PrismaOrdenTrabajoRepository.updateOperatorWorkOrder', () => {
  it('persists evidence and execution data in one transaction', async () => {
    const current = { ordenTrabajoId: 1n, completadoEn: null };
    const updated = {
      ordenTrabajoId: 1n,
      rutaId: 2n,
      contratoId: 3n,
      medidorId: 4n,
      tipoActividad: 'INSPECCION',
      estado: 'COMPLETADA',
      ordenVisita: 1,
      resultadoObservacion: 'ok',
      evidenciaFotoUrl: 'readings/evidence.jpg',
      completadoEn: new Date('2026-08-26T12:00:00.000Z'),
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      lecturaId: null,
    };
    const update = jest.fn().mockResolvedValue(updated);
    const upsert = jest.fn().mockResolvedValue({});
    const tx = {
      ordenesTrabajo: {
        findUnique: jest.fn().mockResolvedValue(current),
        update,
      },
      ejecucionesOrdenTrabajo: { upsert },
    };
    const prisma = {
      $transaction: jest.fn((callback: (tx: typeof tx) => unknown) =>
        callback(tx),
      ),
    };
    const repository = new PrismaOrdenTrabajoRepository(prisma as any);

    await repository.updateOperatorWorkOrder(1n, {
      estado: 'COMPLETADA',
      resultadoObservacion: 'ok',
      evidenciaFotoUrl: 'readings/evidence.jpg',
      estadoSellos: 'INTEGRO',
      hayFugas: false,
      confirmacionRetiroSello: true,
    });

    expect(update).toHaveBeenCalledWith({
      where: { ordenTrabajoId: 1n },
      data: expect.objectContaining({
        estado: 'COMPLETADA',
        evidenciaFotoUrl: 'readings/evidence.jpg',
        resultadoObservacion: 'ok',
        completadoEn: expect.any(Date),
      }),
    });
    expect(upsert).toHaveBeenCalledWith({
      where: { ordenTrabajoId: 1n },
      create: {
        ordenTrabajoId: 1n,
        estadoSellos: 'INTEGRO',
        hayFugas: false,
        confirmacionRetiroSello: true,
      },
      update: {
        estadoSellos: 'INTEGRO',
        hayFugas: false,
        confirmacionRetiroSello: true,
      },
    });
  });
});
