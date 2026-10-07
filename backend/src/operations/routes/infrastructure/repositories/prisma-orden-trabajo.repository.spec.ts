import { PrismaOrdenTrabajoRepository } from './prisma-orden-trabajo.repository';

describe('PrismaOrdenTrabajoRepository.updateOperatorWorkOrder', () => {
  it('persists evidence and derives the effective activity from the route catalog', async () => {
    const updated = {
      ordenTrabajoId: 1n,
      rutaId: 2n,
      ruta: { tipoActividad: { codigo: 'MANUAL' } },
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
    const tx = {
      $queryRaw: jest.fn(),
      ordenesTrabajo: {
        findUnique: jest.fn().mockResolvedValue({
          ordenTrabajoId: 1n,
          contratoId: 3n,
          estado: 'PENDIENTE',
          completadoEn: null,
          ruta: { tipoActividad: { codigo: 'MANUAL' } },
        }),
        update,
      },
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
    });

    expect(result.tipoActividad).toBe('MANUAL');
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        include: {
          ruta: { include: { tipoActividad: { select: { codigo: true } } } },
        },
      }),
    );
  });

  it('persists operator GPS coordinates and only forwards settable fields', async () => {
    const update = jest.fn().mockResolvedValue({
      ordenTrabajoId: 1n,
      rutaId: 2n,
      contratoId: 3n,
      medidorId: 4n,
      estado: 'COMPLETADA',
      ordenVisita: 1,
      resultadoObservacion: null,
      evidenciaFotoUrl: null,
      completadoEn: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      lecturaId: null,
      ruta: { tipoActividad: { codigo: 'INSTALACION' } },
    });
    const tx = {
      $queryRaw: jest.fn(),
      ordenesTrabajo: {
        findUnique: jest.fn().mockResolvedValue({
          ordenTrabajoId: 1n,
          contratoId: 3n,
          medidorId: 4n,
          estado: 'PENDIENTE',
          completadoEn: null,
          ruta: { tipoActividad: { codigo: 'INSTALACION' } },
        }),
        update,
      },
      contratos: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ estadoServicio: 'PENDIENTE_INSTALACION' }),
        update: jest.fn().mockResolvedValue({}),
      },
      medidores: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };
    const prisma = {
      $transaction: jest.fn((callback: (value: typeof tx) => unknown) =>
        callback(tx),
      ),
    };

    await new PrismaOrdenTrabajoRepository(
      prisma as any,
    ).updateOperatorWorkOrder(1n, {
      estado: 'COMPLETADA',
      latitud: -26.80828472,
      longitud: -65.25268137,
    });

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          latitud: -26.80828472,
          longitud: -65.25268137,
        }),
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
      $queryRaw: jest.fn(),
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
      medidores: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
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
        estadoServicio: 'ACTIVO',
        estadoCobranza: 'AL_DIA',
      },
    });
  });

  it.each(['updateEstado', 'updateOperatorWorkOrder'] as const)(
    'installs the reserved meter through %s',
    async (method) => {
      const { prisma, tx } = createPrisma(
        order('INSTALACION'),
        'PENDIENTE_INSTALACION',
      );

      await new PrismaOrdenTrabajoRepository(prisma as never)[method](1n, {
        estado: 'COMPLETADA',
      });

      expect(tx.medidores.updateMany).toHaveBeenCalledWith({
        where: {
          medidorId: 4n,
          estado: 'PENDIENTE',
          deletedAt: null,
          historial: {
            some: { contratoId: 3n, fechaHasta: null, deletedAt: null },
          },
        },
        data: { estado: 'INSTALADO', fechaInstalacion: expect.any(Date) },
      });
    },
  );

  it('rejects installation without an assigned meter', async () => {
    const { prisma, tx, contractUpdate } = createPrisma(
      { ...order('INSTALACION'), medidorId: null },
      'PENDIENTE_INSTALACION',
    );

    await expect(
      new PrismaOrdenTrabajoRepository(prisma as never).updateEstado(1n, {
        estado: 'COMPLETADA',
      }),
    ).rejects.toThrow('medidor asignado');
    expect(tx.medidores.updateMany).not.toHaveBeenCalled();
    expect(contractUpdate).not.toHaveBeenCalled();
    expect(tx.ordenesTrabajo.update).not.toHaveBeenCalled();
  });

  it('rejects a meter that is no longer reserved for the contract', async () => {
    const { prisma, tx, contractUpdate } = createPrisma(
      order('INSTALACION'),
      'PENDIENTE_INSTALACION',
    );
    tx.medidores.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      new PrismaOrdenTrabajoRepository(prisma as never).updateEstado(1n, {
        estado: 'COMPLETADA',
      }),
    ).rejects.toThrow('pendiente y vinculado');
    expect(contractUpdate).not.toHaveBeenCalled();
    expect(tx.ordenesTrabajo.update).not.toHaveBeenCalled();
  });

  it('does not reinstall a meter when reconnecting service', async () => {
    const { prisma, tx } = createPrisma(order('RECONEXION'), 'SUSPENDIDO');

    await new PrismaOrdenTrabajoRepository(prisma as never).updateEstado(1n, {
      estado: 'COMPLETADA',
    });

    expect(tx.medidores.updateMany).not.toHaveBeenCalled();
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

  it.each(['LECTURA', 'MANUAL'])(
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
    const { prisma, tx, contractUpdate } = createPrisma(
      order('INSTALACION', 'COMPLETADA'),
      'ACTIVO',
    );

    await expect(
      new PrismaOrdenTrabajoRepository(prisma as never).updateEstado(1n, {
        estado: 'COMPLETADA',
      }),
    ).resolves.toBeDefined();
    expect(contractUpdate).not.toHaveBeenCalled();
    expect(tx.medidores.updateMany).not.toHaveBeenCalled();
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
