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
        findFirst: jest.fn(),
      },
      cuotaConvenio: {
        findMany: jest.fn(),
      },
    } as unknown as jest.Mocked<PrismaService>;

    service = new PrismaPrefacturaService(prisma);
  });

  describe('findPrefacturaDetalleByCuotaConvenioId', () => {
    it('delegates to prisma.prefacturaDetalle.findMany', async () => {
      prisma.prefacturaDetalle.findMany.mockResolvedValue([
        { prefacturaId: 100n } as any,
      ]);

      const result = await service.findPrefacturaDetalleByCuotaConvenioId(5n);

      expect(prisma.prefacturaDetalle.findMany).toHaveBeenCalledWith({
        where: { cuotaConvenioId: 5n },
        select: { prefacturaId: true },
      });
      expect(result).toEqual([{ prefacturaId: 100n }]);
    });
  });

  describe('findPrefacturaWithDetails', () => {
    it('delegates to prisma.prefacturas.findFirst with prefacturaId', async () => {
      prisma.prefacturas.findFirst.mockResolvedValue({
        prefacturaId: 100n,
        comprobanteId: 200n,
        prefacturaDetalle: [{ cuotaConvenioId: 5n }, { cuotaConvenioId: 6n }],
      } as any);

      const result = await service.findPrefacturaWithDetails(100n);

      expect(result).toEqual({
        prefacturaId: 100n,
        comprobanteId: 200n,
        cuotaConvenioIds: [5n, 6n],
      });
    });

    it('returns null when prefactura not found', async () => {
      prisma.prefacturas.findFirst.mockResolvedValue(null);

      const result = await service.findPrefacturaWithDetails(999n);

      expect(result).toBeNull();
    });
  });

  describe('findCuotasByIds', () => {
    it('delegates to prisma.cuotaConvenio.findMany with cuota IDs', async () => {
      prisma.cuotaConvenio.findMany.mockResolvedValue([
        { cuotaConvenioId: 5n, estado: 'PAGADA' } as any,
        { cuotaConvenioId: 6n, estado: 'PAGADA' } as any,
      ]);

      const result = await service.findCuotasByIds([5n, 6n]);

      expect(prisma.cuotaConvenio.findMany).toHaveBeenCalledWith({
        where: { cuotaConvenioId: { in: [5n, 6n] }, deletedAt: null },
        select: { cuotaConvenioId: true, estado: true },
      });
      expect(result).toEqual([
        { cuotaConvenioId: 5n, estado: 'PAGADA' },
        { cuotaConvenioId: 6n, estado: 'PAGADA' },
      ]);
    });
  });
});
