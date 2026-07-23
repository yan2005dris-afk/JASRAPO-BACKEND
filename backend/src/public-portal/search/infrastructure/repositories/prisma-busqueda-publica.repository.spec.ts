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

  describe('tipo=nombre — exact match (issue #184: was partial ILIKE)', () => {
    it('countClientesBy builds an exact (equals) AND/OR filter per name token, not contains', async () => {
      await repository.countClientesBy('nombre', 'Juan Pérez');

      expect(prisma.clientes.count).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          AND: [
            {
              OR: [
                { nombres: { equals: 'JUAN', mode: 'insensitive' } },
                { apellidos: { equals: 'JUAN', mode: 'insensitive' } },
              ],
            },
            {
              OR: [
                { nombres: { equals: 'PÉREZ', mode: 'insensitive' } },
                { apellidos: { equals: 'PÉREZ', mode: 'insensitive' } },
              ],
            },
          ],
        },
      });
    });

    it('findClientesBy never uses contains for tipo=nombre', async () => {
      await repository.findClientesBy('nombre', 'Ana', 0, 10);

      const call = prisma.clientes.findMany.mock.calls[0][0];
      expect(JSON.stringify(call.where)).not.toContain('contains');
      expect(JSON.stringify(call.where)).toContain('equals');
    });

    it('countContratosDeuda builds an exact (equals) filter on cliente name fields', async () => {
      await repository.countContratosDeuda('nombre', 'Ana Torres');

      expect(prisma.contratos.count).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          cliente: {
            deletedAt: null,
            AND: [
              {
                OR: [
                  { nombres: { equals: 'ANA', mode: 'insensitive' } },
                  { apellidos: { equals: 'ANA', mode: 'insensitive' } },
                ],
              },
              {
                OR: [
                  { nombres: { equals: 'TORRES', mode: 'insensitive' } },
                  { apellidos: { equals: 'TORRES', mode: 'insensitive' } },
                ],
              },
            ],
          },
        },
      });
    });
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
