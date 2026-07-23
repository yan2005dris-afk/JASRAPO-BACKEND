import { PrismaBusquedaPublicaRepository } from './prisma-busqueda-publica.repository';
import type { PrismaService } from 'src/infrastructure/database/prisma.service';

describe('PrismaBusquedaPublicaRepository', () => {
  let prisma: jest.Mocked<PrismaService>;
  let repository: PrismaBusquedaPublicaRepository;

  beforeEach(() => {
    prisma = {
      clientes: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
      },
      contratos: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
      },
    } as unknown as jest.Mocked<PrismaService>;

    repository = new PrismaBusquedaPublicaRepository(prisma);
  });

  describe('tipo=identificacion — unaffected exact match', () => {
    it('countClientesBy matches identificacion as-is, not per-token', async () => {
      await repository.countClientesBy('identificacion', '0912345678');

      expect(prisma.clientes.count).toHaveBeenCalledWith({
        where: { identificacion: '0912345678', deletedAt: null },
      });
    });
  });

  describe('tipo=numeroGuia — unaffected substring match', () => {
    it('countContratosDeuda still uses contains for numeroGuia', async () => {
      await repository.countContratosDeuda('numeroGuia', 'G-00');

      expect(prisma.contratos.count).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          numeroGuia: { contains: 'G-00', mode: 'insensitive' },
          cliente: { deletedAt: null },
          prefacturas: {
            some: {
              deletedAt: null,
              estado: { in: expect.any(Array) },
            },
          },
        },
      });
    });
  });
});
