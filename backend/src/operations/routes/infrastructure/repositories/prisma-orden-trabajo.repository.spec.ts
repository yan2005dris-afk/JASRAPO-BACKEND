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

describe('PrismaOrdenTrabajoRepository.create', () => {
  it('persists the route relation without an independent activity type', async () => {
    const created = {
      ordenTrabajoId: 1n,
      rutaId: 2n,
      ruta: { tipoActividad: { codigo: 'INSTALACION' } },
      contratoId: 3n,
      medidorId: null,
      estado: 'PENDIENTE',
      ordenVisita: 0,
    };
    const create = jest.fn().mockResolvedValue(created);
    const prisma = { ordenesTrabajo: { create } };

    const result = await new PrismaOrdenTrabajoRepository(prisma as any).create(
      {
        rutaId: 2n,
        contratoId: 3n,
        medidorId: null,
        estado: 'PENDIENTE',
      },
    );

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          rutaId: 2n,
          contratoId: 3n,
          medidorId: null,
          estado: 'PENDIENTE',
          ordenVisita: 0,
        },
      }),
    );
    expect(create.mock.calls[0][0].data).not.toHaveProperty('tipoActividad');
    expect(result.tipoActividad).toBe('INSTALACION');
  });
});
