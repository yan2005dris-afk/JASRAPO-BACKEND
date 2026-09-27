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

describe('PrismaOrdenTrabajoRepository.findActiveInstallationByContratoId', () => {
  const rawOrder = {
    ordenTrabajoId: 7n,
    rutaId: 20n,
    contratoId: 3n,
    medidorId: null,
    estado: 'PENDIENTE',
    ordenVisita: 0,
    resultadoObservacion: null,
    evidenciaFotoUrl: null,
    completadoEn: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    lecturaId: null,
    ruta: { tipoActividad: { codigo: 'INSTALACION' } },
  };

  it('devuelve la orden de instalación activa filtrando canceladas/fallidas', async () => {
    const findFirst = jest.fn().mockResolvedValue(rawOrder);
    const prisma = { ordenesTrabajo: { findFirst } };

    const result = await new PrismaOrdenTrabajoRepository(
      prisma as any,
    ).findActiveInstallationByContratoId(3n);

    expect(result?.ordenTrabajoId).toBe(7n);
    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          contratoId: 3n,
          deletedAt: null,
          estado: { notIn: ['CANCELADA', 'FALLIDA'] },
          ruta: { tipoActividad: { codigo: 'INSTALACION' } },
        }),
      }),
    );
  });

  it('devuelve null cuando el contrato no tiene una orden activa', async () => {
    const prisma = {
      ordenesTrabajo: { findFirst: jest.fn().mockResolvedValue(null) },
    };

    const result = await new PrismaOrdenTrabajoRepository(
      prisma as any,
    ).findActiveInstallationByContratoId(3n);

    expect(result).toBeNull();
  });
});

describe('PrismaOrdenTrabajoRepository.reassignInstallationOrder', () => {
  const updatedRaw = {
    ordenTrabajoId: 7n,
    rutaId: 30n,
    contratoId: 3n,
    medidorId: null,
    estado: 'PENDIENTE',
    ordenVisita: 0,
    resultadoObservacion: null,
    evidenciaFotoUrl: null,
    completadoEn: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    lecturaId: null,
    ruta: { tipoActividad: { codigo: 'INSTALACION' } },
  };

  const buildPrisma = (opts: {
    remaining: number;
    operarioId: number | null;
  }) => {
    const rutasUpdate = jest.fn().mockResolvedValue({});
    const tx = {
      ordenesTrabajo: {
        findUnique: jest.fn().mockResolvedValue({ rutaId: 20n }),
        update: jest.fn().mockResolvedValue(updatedRaw),
        count: jest.fn().mockResolvedValue(opts.remaining),
      },
      rutas: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ operarioId: opts.operarioId }),
        update: rutasUpdate,
      },
    };
    const prisma = {
      $transaction: jest.fn((cb: (v: typeof tx) => unknown) => cb(tx)),
    };
    return { prisma, tx, rutasUpdate };
  };

  it('mueve la orden a la nueva ruta y cancela la ruta origen huérfana', async () => {
    const { prisma, tx, rutasUpdate } = buildPrisma({
      remaining: 0,
      operarioId: null,
    });

    const result = await new PrismaOrdenTrabajoRepository(
      prisma as any,
    ).reassignInstallationOrder(7n, 30n);

    expect(result.rutaId).toBe(30n);
    expect(tx.ordenesTrabajo.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { ordenTrabajoId: 7n },
        data: { rutaId: 30n },
      }),
    );
    expect(rutasUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { rutaId: 20n },
        data: { estado: 'CANCELADA' },
      }),
    );
  });

  it('NO cancela la ruta origen si aún tiene órdenes', async () => {
    const { prisma, rutasUpdate } = buildPrisma({
      remaining: 2,
      operarioId: null,
    });

    await new PrismaOrdenTrabajoRepository(
      prisma as any,
    ).reassignInstallationOrder(7n, 30n);

    expect(rutasUpdate).not.toHaveBeenCalled();
  });

  it('NO cancela la ruta origen si tiene operario asignado', async () => {
    const { prisma, rutasUpdate } = buildPrisma({
      remaining: 0,
      operarioId: 5,
    });

    await new PrismaOrdenTrabajoRepository(
      prisma as any,
    ).reassignInstallationOrder(7n, 30n);

    expect(rutasUpdate).not.toHaveBeenCalled();
  });
});
