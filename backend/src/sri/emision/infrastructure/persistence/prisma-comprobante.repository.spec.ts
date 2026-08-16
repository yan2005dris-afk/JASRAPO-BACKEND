import { PrismaComprobanteRepository } from './prisma-comprobante.repository';

const mockLogger = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};

describe('PrismaComprobanteRepository — delete methods (T-002)', () => {
  let repository: PrismaComprobanteRepository;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      comprobanteDetalles: { deleteMany: jest.fn() },
      comprobantePagos: { deleteMany: jest.fn() },
      comprobanteImpuestos: { deleteMany: jest.fn() },
      comprobanteTotales: { deleteMany: jest.fn() },
      infoAdicional: { deleteMany: jest.fn() },
      detallesAdicionales: { deleteMany: jest.fn() },
    };

    repository = new PrismaComprobanteRepository(
      mockPrisma,
      mockLogger as any,
    );
  });

  describe('deleteDetallesByComprobanteId', () => {
    it('should delete all detalles for a given comprobanteId', async () => {
      mockPrisma.comprobanteDetalles.deleteMany.mockResolvedValue({ count: 3 });

      await repository.deleteDetallesByComprobanteId(BigInt(1));

      expect(mockPrisma.comprobanteDetalles.deleteMany).toHaveBeenCalledWith({
        where: { comprobanteId: BigInt(1) },
      });
    });

    it('should use the transaction client when provided', async () => {
      const tx = {
        comprobanteDetalles: {
          deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
        },
      };
      tx.comprobanteDetalles.deleteMany.mockResolvedValue({
        count: 0,
      });

      await repository.deleteDetallesByComprobanteId(BigInt(1), tx as any);

      expect(tx.comprobanteDetalles.deleteMany).toHaveBeenCalledWith({
        where: { comprobanteId: BigInt(1) },
      });
      expect(mockPrisma.comprobanteDetalles.deleteMany).not.toHaveBeenCalled();
    });
  });

  describe('deletePagosByComprobanteId', () => {
    it('should delete all pagos for a given comprobanteId', async () => {
      mockPrisma.comprobantePagos.deleteMany.mockResolvedValue({ count: 2 });

      await repository.deletePagosByComprobanteId(BigInt(1));

      expect(mockPrisma.comprobantePagos.deleteMany).toHaveBeenCalledWith({
        where: { comprobanteId: BigInt(1) },
      });
    });
  });

  describe('deleteTotalesByComprobanteId', () => {
    it('should delete all totales for a given comprobanteId', async () => {
      mockPrisma.comprobanteTotales.deleteMany.mockResolvedValue({ count: 3 });

      await repository.deleteTotalesByComprobanteId(BigInt(1));

      expect(mockPrisma.comprobanteTotales.deleteMany).toHaveBeenCalledWith({
        where: { comprobanteId: BigInt(1) },
      });
    });

    it('should use the transaction client when provided', async () => {
      const tx = {
        comprobanteTotales: {
          deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
        },
      };

      await repository.deleteTotalesByComprobanteId(BigInt(1), tx as any);

      expect(tx.comprobanteTotales.deleteMany).toHaveBeenCalledWith({
        where: { comprobanteId: BigInt(1) },
      });
    });
  });

  describe('deleteInfoAdicionalByComprobanteId', () => {
    it('should delete all info adicional for a given comprobanteId', async () => {
      mockPrisma.infoAdicional.deleteMany.mockResolvedValue({ count: 2 });

      await repository.deleteInfoAdicionalByComprobanteId(BigInt(1));

      expect(mockPrisma.infoAdicional.deleteMany).toHaveBeenCalledWith({
        where: { comprobanteId: BigInt(1) },
      });
    });
  });
});
