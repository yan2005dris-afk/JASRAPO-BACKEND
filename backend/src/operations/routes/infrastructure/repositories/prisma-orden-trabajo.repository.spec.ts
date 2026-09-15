import { PrismaOrdenTrabajoRepository } from './prisma-orden-trabajo.repository';

describe('PrismaOrdenTrabajoRepository.updateOperatorWorkOrder', () => {
  it('persists evidence and derives the effective activity from the route catalog', async () => {
    const updated = {
      ordenTrabajoId: 1n,
      rutaId: 2n,
      ruta: { tipoActividad: { codigo: 'INSPECCION' } },
      contratoId: 3n,
      medidorId: 4n,
      estado: 'COMPLETADA',
      ordenVisita: 1,
      resultadoObservacion: 'ok',
      evidenciaFotoUrl: 'readings/evidence.jpg',
      completadoEn: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      lecturaId: null,
    };
    const update = jest.fn().mockResolvedValue(updated);
    const upsert = jest.fn().mockResolvedValue({});
    const tx = {
      ordenesTrabajo: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ ordenTrabajoId: 1n, completadoEn: null }),
        update,
      },
      ejecucionesOrdenTrabajo: { upsert },
    };
    const prisma = {
      $transaction: jest.fn((callback: (value: typeof tx) => unknown) =>
        callback(tx),
      ),
    };

    const result = await new PrismaOrdenTrabajoRepository(
      prisma as any,
    ).updateOperatorWorkOrder(1n, {
      estado: 'COMPLETADA',
      resultadoObservacion: 'ok',
      evidenciaFotoUrl: 'readings/evidence.jpg',
      estadoSellos: 'INTEGRO',
      hayFugas: false,
      confirmacionRetiroSello: true,
    });

    expect(result.tipoActividad).toBe('INSPECCION');
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        include: {
          ruta: { include: { tipoActividad: { select: { codigo: true } } } },
        },
      }),
    );
  });
});
