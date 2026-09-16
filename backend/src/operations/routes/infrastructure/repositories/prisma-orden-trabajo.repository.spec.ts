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
        findUnique: jest.fn().mockResolvedValue({
          ordenTrabajoId: 1n,
          contratoId: 3n,
          estado: 'PENDIENTE',
          completadoEn: null,
          ruta: { tipoActividad: { codigo: 'INSPECCION' } },
        }),
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

describe('PrismaOrdenTrabajoRepository contract lifecycle effects', () => {
  const order = (activity: string, state = 'PENDIENTE') => ({
    ordenTrabajoId: 1n,
    rutaId: 2n,
    contratoId: 3n,
    medidorId: 4n,
    estado: state,
    ordenVisita: 1,
    resultadoObservacion: null,
    evidenciaFotoUrl: null,
    completadoEn: state === 'COMPLETADA' ? new Date() : null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    lecturaId: null,
    ruta: { tipoActividad: { codigo: activity } },
  });

  const createPrisma = (current: unknown, contractState = 'ACTIVO') => {
    const contractUpdate = jest.fn().mockResolvedValue({});
    const tx = {
      ordenesTrabajo: {
        findUnique: jest.fn().mockResolvedValue(current),
        update: jest
          .fn()
          .mockImplementation(({ data }: { data: object }) =>
            Promise.resolve({ ...order('INSTALACION'), ...data }),
          ),
      },
      contratos: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ estadoServicio: contractState }),
        update: contractUpdate,
      },
    };
    return {
      prisma: {
        $transaction: jest.fn((callback: (value: typeof tx) => unknown) =>
          callback(tx),
        ),
      },
      tx,
      contractUpdate,
    };
  };

  it.each([
    ['INSTALACION', 'PENDIENTE_INSTALACION'],
    ['RECONEXION', 'SUSPENDIDO'],
  ])('activates the contract when completing %s', async (activity, state) => {
    const { prisma, contractUpdate } = createPrisma(order(activity), state);

    await new PrismaOrdenTrabajoRepository(prisma as never).updateEstado(1n, {
      estado: 'COMPLETADA',
    });

    expect(contractUpdate).toHaveBeenCalledWith({
      where: { contratoId: 3n },
      data: {
        estado: 'ACTIVO',
        estadoServicio: 'ACTIVO',
        estadoCobranza: 'AL_DIA',
      },
    });
  });

  it('rejects an invalid contract source state before updating the order', async () => {
    const { prisma, tx } = createPrisma(order('INSTALACION'), 'ACTIVO');

    await expect(
      new PrismaOrdenTrabajoRepository(prisma as never).updateEstado(1n, {
        estado: 'COMPLETADA',
      }),
    ).rejects.toThrow('PENDIENTE_INSTALACION');
    expect(tx.ordenesTrabajo.update).not.toHaveBeenCalled();
  });

  it.each(['FALLIDA', 'CANCELADA'])(
    'does not change the contract for %s completion',
    async (state) => {
      const { prisma, contractUpdate } = createPrisma(
        order('INSTALACION'),
        'PENDIENTE_INSTALACION',
      );

      await new PrismaOrdenTrabajoRepository(prisma as never).updateEstado(1n, {
        estado: state,
      });

      expect(contractUpdate).not.toHaveBeenCalled();
    },
  );

  it.each(['LECTURA', 'INSPECCION', 'MANUAL'])(
    'does not change the contract for %s activity completion',
    async (activity) => {
      const { prisma, contractUpdate } = createPrisma(
        order(activity),
        'ACTIVO',
      );

      await new PrismaOrdenTrabajoRepository(prisma as never).updateEstado(1n, {
        estado: 'COMPLETADA',
      });

      expect(contractUpdate).not.toHaveBeenCalled();
    },
  );

  it('does not change the contract when completing an already completed order', async () => {
    const { prisma, contractUpdate } = createPrisma(
      order('INSTALACION', 'COMPLETADA'),
      'ACTIVO',
    );

    await expect(
      new PrismaOrdenTrabajoRepository(prisma as never).updateEstado(1n, {
        estado: 'COMPLETADA',
      }),
    ).resolves.toBeDefined();
    expect(contractUpdate).not.toHaveBeenCalled();
  });

  it('rolls back the order update when the contract effect fails', async () => {
    const { prisma, tx, contractUpdate } = createPrisma(
      order('INSTALACION'),
      'PENDIENTE_INSTALACION',
    );
    contractUpdate.mockRejectedValue(new Error('contract write failed'));

    await expect(
      new PrismaOrdenTrabajoRepository(prisma as never).updateEstado(1n, {
        estado: 'COMPLETADA',
      }),
    ).rejects.toThrow('contract write failed');
    expect(tx.ordenesTrabajo.update).not.toHaveBeenCalled();
  });

  it('applies the same lifecycle effect through the operator update path', async () => {
    const { prisma, contractUpdate } = createPrisma(
      order('RECONEXION'),
      'SUSPENDIDO',
    );

    await new PrismaOrdenTrabajoRepository(
      prisma as never,
    ).updateOperatorWorkOrder(1n, { estado: 'COMPLETADA' });

    expect(contractUpdate).toHaveBeenCalledWith({
      where: { contratoId: 3n },
      data: {
        estado: 'ACTIVO',
        estadoServicio: 'ACTIVO',
        estadoCobranza: 'AL_DIA',
      },
    });
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
