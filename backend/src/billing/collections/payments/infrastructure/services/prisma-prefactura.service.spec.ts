import { PrismaPrefacturaService } from './prisma-prefactura.service';
import type { PrismaService } from 'src/infrastructure/database/prisma.service';

describe('PrismaPrefacturaService', () => {
  let prisma: jest.Mocked<PrismaService>;
  let service: PrismaPrefacturaService;

  beforeEach(() => {
    prisma = {
      prefacturaDetalle: {
        findMany: jest.fn(),
      },
      prefacturas: {
        findUnique: jest.fn(),
      },
      cuotaConvenio: {
        findMany: jest.fn(),
      },
    } as unknown as jest.Mocked<PrismaService>;

    service = new PrismaPrefacturaService(prisma);
  });

  describe('findPrefacturaDetalleByCuotaConvenioId', () => {
    it('delegates to prisma.prefacturaDetalle.findMany with the given cuotaConvenioId', async () => {
      const expected = [
        { prefacturaDetalleId: 10n, prefacturaId: 100n, cuotaConvenioId: 5n },
      ];
      prisma.prefacturaDetalle.findMany.mockResolvedValue(expected);

      const result = await service.findPrefacturaDetalleByCuotaConvenioId(5n);

      expect(prisma.prefacturaDetalle.findMany).toHaveBeenCalledWith({
        where: { cuotaConvenioId: 5n },
      });
      expect(result).toEqual(expected);
    });

    it('uses transaction client when tx is provided', async () => {
      const tx = {
        prefacturaDetalle: {
          findMany: jest.fn().mockResolvedValue([]),
        },
      } as any;

      await service.findPrefacturaDetalleByCuotaConvenioId(5n, tx);

      expect(tx.prefacturaDetalle.findMany).toHaveBeenCalledWith({
        where: { cuotaConvenioId: 5n },
      });
      expect(prisma.prefacturaDetalle.findMany).not.toHaveBeenCalled();
    });

    it('returns empty array when no matching records found', async () => {
      prisma.prefacturaDetalle.findMany.mockResolvedValue([]);

      const result = await service.findPrefacturaDetalleByCuotaConvenioId(999n);

      expect(result).toEqual([]);
    });
  });

  describe('findPrefacturaById', () => {
    it('delegates to prisma.prefacturas.findUnique with prefacturaId', async () => {
      const expected = { prefacturaId: 100n, comprobanteId: 200n };
      prisma.prefacturas.findUnique.mockResolvedValue(expected);

      const result = await service.findPrefacturaById(100n);

      expect(prisma.prefacturas.findUnique).toHaveBeenCalledWith({
        where: { prefacturaId: 100n },
      });
      expect(result).toEqual(expected);
    });

    it('passes select when provided', async () => {
      const select = { prefacturaId: true, comprobanteId: true };
      prisma.prefacturas.findUnique.mockResolvedValue({ prefacturaId: 100n });

      await service.findPrefacturaById(100n, select);

      expect(prisma.prefacturas.findUnique).toHaveBeenCalledWith({
        where: { prefacturaId: 100n },
        select,
      });
    });

    it('uses transaction client when tx is provided', async () => {
      const tx = {
        prefacturas: {
          findUnique: jest.fn().mockResolvedValue(null),
        },
      } as any;

      await service.findPrefacturaById(100n, undefined, tx);

      expect(tx.prefacturas.findUnique).toHaveBeenCalledWith({
        where: { prefacturaId: 100n },
      });
      expect(prisma.prefacturas.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('findManyCuotaConvenio', () => {
    it('delegates to prisma.cuotaConvenio.findMany with where and select', async () => {
      const where = { cuotaConvenioId: { in: [5n, 6n] } };
      const select = { cuotaConvenioId: true, estado: true };
      const expected = [
        { cuotaConvenioId: 5n, estado: 'PAGADA' },
        { cuotaConvenioId: 6n, estado: 'PAGADA' },
      ];
      prisma.cuotaConvenio.findMany.mockResolvedValue(expected);

      const result = await service.findManyCuotaConvenio(where, select);

      expect(prisma.cuotaConvenio.findMany).toHaveBeenCalledWith({
        where,
        select,
      });
      expect(result).toEqual(expected);
    });

    it('uses transaction client when tx is provided', async () => {
      const tx = {
        cuotaConvenio: {
          findMany: jest.fn().mockResolvedValue([]),
        },
      } as any;

      await service.findManyCuotaConvenio({}, undefined, tx);

      expect(tx.cuotaConvenio.findMany).toHaveBeenCalledWith({
        where: {},
      });
      expect(prisma.cuotaConvenio.findMany).not.toHaveBeenCalled();
    });
  });
});
