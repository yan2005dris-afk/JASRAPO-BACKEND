import { PrismaReadingRepository } from './prisma-reading.repository';
import { ReadingMapper } from '../mappers/reading.mapper';
import { safeReadingsSelect } from './prisma-reading.repository';
import { Decimal } from 'decimal.js';

describe('PrismaReadingRepository - soft delete select regression', () => {
  const buildPrismaMock = () => {
    const findUnique = jest.fn();
    const findFirst = jest.fn();
    return {
      lecturas: {
        findUnique,
      },
      periodos: {
        findFirst,
      },
    };
  };

  it('findActivePeriod queries the ABIERTO period and returns its id', async () => {
    const prisma = buildPrismaMock();
    const repository = new PrismaReadingRepository(prisma as any);

    prisma.periodos.findFirst.mockResolvedValue({ periodoId: 5 });

    const result = await repository.findActivePeriod();

    expect(prisma.periodos.findFirst).toHaveBeenCalledWith({
      where: { estado: 'ABIERTO' },
      select: { periodoId: true },
    });
    expect(result).toEqual({ periodoId: 5 });
  });

  it('safeReadingsSelect must request deletedAt so the use case soft-delete guard works', () => {
    expect((safeReadingsSelect as Record<string, unknown>).deletedAt).toBe(
      true,
    );
  });

  it('ReadingMapper.toDomain normalizes undefined deletedAt to null (defensive)', () => {
    const entity = ReadingMapper.toDomain({
      lecturaId: BigInt(1),
      fecha: new Date(),
      lecturaAnterior: 100,
      lecturaActual: 150,
      consumoCalculado: 50,
      medidorId: BigInt(1),
      estado: 'PENDIENTE',
      lecturaInicial: false,
      periodoId: 1,
      deletedAt: undefined,
    });

    expect(entity).not.toBeNull();
    expect(entity!.deletedAt).toBeNull();
  });

  it('ReadingMapper.toDomain preserves null deletedAt for active rows', () => {
    const entity = ReadingMapper.toDomain({
      lecturaId: BigInt(1),
      fecha: new Date(),
      lecturaAnterior: 100,
      lecturaActual: 150,
      consumoCalculado: 50,
      medidorId: BigInt(1),
      estado: 'PENDIENTE',
      lecturaInicial: false,
      periodoId: 1,
      deletedAt: null,
    });

    expect(entity).not.toBeNull();
    expect(entity!.deletedAt).toBeNull();
  });

  it('ReadingMapper.toDomain preserves a real Date for soft-deleted rows', () => {
    const deletedAt = new Date('2026-01-15T10:00:00.000Z');
    const entity = ReadingMapper.toDomain({
      lecturaId: BigInt(1),
      fecha: new Date(),
      lecturaAnterior: 100,
      lecturaActual: 150,
      consumoCalculado: 50,
      medidorId: BigInt(1),
      estado: 'PENDIENTE',
      lecturaInicial: false,
      periodoId: 1,
      deletedAt,
    });

    expect(entity).not.toBeNull();
    expect(entity!.deletedAt).toEqual(deletedAt);
  });

  it('findUnique maps an active record to a LecturaEntity with deletedAt === null', async () => {
    const prisma = buildPrismaMock();
    const repository = new PrismaReadingRepository(prisma as any);

    prisma.lecturas.findUnique.mockResolvedValue({
      lecturaId: BigInt(1),
      fecha: new Date(),
      lecturaAnterior: 100,
      lecturaActual: 150,
      consumoCalculado: 50,
      medidorId: BigInt(1),
      descripcionAnomalia: null,
      fechaValidacion: null,
      evidenciaFotoUrl: null,
      estado: 'PENDIENTE',
      lecturaInicial: false,
      periodoId: 1,
      deletedAt: null,
      medidor: null,
      periodoRel: null,
    });

    const entity = await repository.findUnique({ lecturaId: BigInt(1) });

    expect(prisma.lecturas.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { lecturaId: BigInt(1) },
        select: expect.objectContaining({ deletedAt: true }),
      }),
    );
    expect(entity).not.toBeNull();
    expect(entity!.deletedAt).toBeNull();
  });

  it('findUnique preserves soft-deleted Date so the use case guard treats it as deleted', async () => {
    const prisma = buildPrismaMock();
    const repository = new PrismaReadingRepository(prisma as any);
    const deletedAt = new Date('2026-01-15T10:00:00.000Z');

    prisma.lecturas.findUnique.mockResolvedValue({
      lecturaId: BigInt(1),
      fecha: new Date(),
      lecturaAnterior: 100,
      lecturaActual: 150,
      consumoCalculado: 50,
      medidorId: BigInt(1),
      descripcionAnomalia: null,
      fechaValidacion: null,
      evidenciaFotoUrl: null,
      estado: 'PENDIENTE',
      lecturaInicial: false,
      periodoId: 1,
      deletedAt,
      medidor: null,
      periodoRel: null,
    });

    const entity = await repository.findUnique({ lecturaId: BigInt(1) });

    expect(entity).not.toBeNull();
    expect(entity!.deletedAt).toEqual(deletedAt);
    expect(entity!.deletedAt).not.toBeNull();
  });

  describe('findReadingSnapshot (Temporal Query + Assignment Identity)', () => {
    it('returns last approved reading within active contract assignment window', async () => {
      const findFirstHistorial = jest.fn().mockResolvedValue({
        historialId: BigInt(10),
        fechaDesde: new Date('2026-01-01'),
        lecturaInicial: '50.00',
      });
      const findFirstLecturas = jest.fn().mockResolvedValue({
        lecturaActual: '120.50',
      });

      const prisma = {
        historialMedidores: { findFirst: findFirstHistorial },
        lecturas: { findFirst: findFirstLecturas },
      };
      const repository = new PrismaReadingRepository(prisma as any);

      const targetFecha = new Date('2026-02-01');
      const snapshot = await repository.findReadingSnapshot(
        BigInt(1),
        targetFecha,
      );

      expect(findFirstHistorial).toHaveBeenCalledWith({
        where: {
          medidorId: BigInt(1),
          deletedAt: null,
          fechaDesde: { lte: targetFecha },
          OR: [{ fechaHasta: null }, { fechaHasta: { gte: targetFecha } }],
        },
        orderBy: { fechaDesde: 'desc' },
        select: {
          historialId: true,
          fechaDesde: true,
          lecturaInicial: true,
        },
      });

      expect(findFirstLecturas).toHaveBeenCalledWith({
        where: {
          medidorId: BigInt(1),
          estado: 'APROBADA',
          deletedAt: null,
          fecha: {
            lt: targetFecha,
            gte: new Date('2026-01-01'),
          },
        },
        orderBy: { fecha: 'desc' },
        select: { lecturaActual: true },
      });

      expect(snapshot).toEqual({
        lecturaAnterior: new Decimal('120.50'),
        lecturaInicial: false,
      });
    });

    it('returns assignment initial reading when no previous approved reading exists', async () => {
      const findFirstHistorial = jest.fn().mockResolvedValue({
        historialId: BigInt(10),
        fechaDesde: new Date('2026-01-01'),
        lecturaInicial: '15.00',
      });
      const findFirstLecturas = jest.fn().mockResolvedValue(null);

      const prisma = {
        historialMedidores: { findFirst: findFirstHistorial },
        lecturas: { findFirst: findFirstLecturas },
      };
      const repository = new PrismaReadingRepository(prisma as any);

      const targetFecha = new Date('2026-01-15');
      const snapshot = await repository.findReadingSnapshot(
        BigInt(1),
        targetFecha,
      );

      expect(snapshot).toEqual({
        lecturaAnterior: new Decimal('15.00'),
        lecturaInicial: true,
      });
    });
  });

  describe('photo evidence atomicity', () => {
    it('updates the linked work order evidence in the same transaction as the reading', async () => {
      const updated = {
        lecturaId: BigInt(1),
        fecha: new Date(),
        lecturaAnterior: 100,
        lecturaActual: 150,
        consumoCalculado: 50,
        medidorId: BigInt(1),
        estado: 'PENDIENTE',
        lecturaInicial: false,
        periodoId: 1,
        deletedAt: null,
        medidor: null,
        periodoRel: null,
        ordenesTrabajo: [],
      };
      const tx = {
        ordenesTrabajo: {
          updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        },
        lecturas: { update: jest.fn().mockResolvedValue(updated) },
        lecturaAnomalia: { findFirst: jest.fn() },
      };
      const prisma = {
        $transaction: jest.fn(
          async (callback: (client: typeof tx) => unknown) => callback(tx),
        ),
      };
      const repository = new PrismaReadingRepository(prisma as any);

      await repository.update(
        { lecturaId: BigInt(1) },
        { evidenciaFotoUrl: 'readings/evidence.jpg' },
      );

      expect(tx.ordenesTrabajo.updateMany).toHaveBeenCalledWith({
        where: { lecturaId: BigInt(1), deletedAt: null },
        data: { evidenciaFotoUrl: 'readings/evidence.jpg' },
      });
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });

    it('rejects photo evidence when no active linked work order exists', async () => {
      const tx = {
        ordenesTrabajo: {
          updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        },
        lecturas: { update: jest.fn() },
      };
      const prisma = {
        $transaction: jest.fn(
          async (callback: (client: typeof tx) => unknown) => callback(tx),
        ),
      };
      const repository = new PrismaReadingRepository(prisma as any);

      await expect(
        repository.update(
          { lecturaId: BigInt(1) },
          { evidenciaFotoUrl: 'readings/evidence.jpg' },
        ),
      ).rejects.toThrow('orden de trabajo vinculada');
      expect(tx.lecturas.update).not.toHaveBeenCalled();
    });
  });

  describe('isReadingLinkedToReplacement', () => {
    it('returns true when reading is linked to an active replacement as final or initial', async () => {
      const prisma = {
        reemplazoMedidor: {
          count: jest.fn().mockResolvedValue(1),
        },
      };
      const repository = new PrismaReadingRepository(prisma as any);

      const result = await repository.isReadingLinkedToReplacement(BigInt(100));

      expect(result).toBe(true);
      expect(prisma.reemplazoMedidor.count).toHaveBeenCalledWith({
        where: {
          OR: [
            { lecturaFinalSalienteId: BigInt(100) },
            { lecturaInicialEntranteId: BigInt(100) },
          ],
          deletedAt: null,
        },
      });
    });

    it('returns false when reading is not linked to any replacement', async () => {
      const prisma = {
        reemplazoMedidor: {
          count: jest.fn().mockResolvedValue(0),
        },
      };
      const repository = new PrismaReadingRepository(prisma as any);

      const result = await repository.isReadingLinkedToReplacement(BigInt(200));

      expect(result).toBe(false);
    });
  });
});
