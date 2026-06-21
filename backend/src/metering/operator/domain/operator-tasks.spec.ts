import { TipoRuta } from 'src/shared/enums';
import { Test } from '@nestjs/testing';
import { PrismaOperatorRepository } from '../infrastructure/repositories/prisma-operator.repository';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

describe('Operator Tasks - Schema & Repository', () => {
  describe('TipoRuta enum (1.1-1.2)', () => {
    it('should include INSTALACION for installation tasks', () => {
      expect(TipoRuta.INSTALACION).toBe('INSTALACION');
    });

    it('should include INSPECCION for inspection tasks', () => {
      expect(TipoRuta.INSPECCION).toBe('INSPECCION');
    });

    it('should preserve existing TOMA_LECTURA and RECONEXION', () => {
      expect(TipoRuta.TOMA_LECTURA).toBe('TOMA_LECTURA');
      expect(TipoRuta.RECONEXION).toBe('RECONEXION');
    });
  });

  describe('PrismaOperatorRepository - task methods', () => {
    let repository: PrismaOperatorRepository;
    let prisma: any;

    const mockPrisma = {
      rutas: {
        findMany: jest.fn(),
        update: jest.fn(),
        aggregate: jest.fn(),
      },
      medidores: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      usuarios: {
        findMany: jest.fn(),
      },
    };

    beforeEach(async () => {
      jest.clearAllMocks();

      const module = await Test.createTestingModule({
        providers: [
          PrismaOperatorRepository,
          { provide: PrismaService, useValue: mockPrisma },
        ],
      }).compile();

      repository = module.get(PrismaOperatorRepository);
      prisma = mockPrisma;
    });

    describe('findTasksByOperator', () => {
      it('should find tasks for an operator in a given period ordered by comunidad, sector, orden', async () => {
        const mockTasks = [
          {
            rutaId: BigInt(1),
            nombre: 'Task 1',
            comunidadId: 5,
            sectorId: 3,
            orden: 1,
          },
          {
            rutaId: BigInt(2),
            nombre: 'Task 2',
            comunidadId: 5,
            sectorId: 3,
            orden: 2,
          },
        ];
        prisma.rutas.findMany.mockResolvedValue(mockTasks);

        const result = await repository.findTasksByOperator(10, 20);

        expect(prisma.rutas.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { operarioId: 10, periodoId: 20, deletedAt: null },
            orderBy: [
              { comunidadId: 'asc' },
              { sectorId: 'asc' },
              { orden: 'asc' },
            ],
          }),
        );
        expect(result).toEqual(mockTasks);
      });

      it('should return empty array when operator has no tasks', async () => {
        prisma.rutas.findMany.mockResolvedValue([]);

        const result = await repository.findTasksByOperator(999, 20);

        expect(result).toEqual([]);
        expect(prisma.rutas.findMany).toHaveBeenCalled();
      });
    });

    describe('updateTaskState', () => {
      it('should update the estado of a task by rutaId', async () => {
        const mockUpdated = {
          rutaId: BigInt(1),
          estado: 'EN_PROGRESO',
          fechaInicio: new Date(),
        };
        prisma.rutas.update.mockResolvedValue(mockUpdated);

        const result = await repository.updateTaskState(BigInt(1), {
          estado: 'EN_PROGRESO',
        });

        expect(prisma.rutas.update).toHaveBeenCalledWith({
          where: { rutaId: BigInt(1), deletedAt: null },
          data: { estado: 'EN_PROGRESO' },
        });
        expect(result).toEqual(mockUpdated);
      });

      it('should set fechaInicio when transitioning to EN_PROGRESO', async () => {
        const mockUpdated = {
          rutaId: BigInt(1),
          estado: 'EN_PROGRESO',
          fechaInicio: new Date(),
        };
        prisma.rutas.update.mockResolvedValue(mockUpdated);

        await repository.updateTaskState(BigInt(1), {
          estado: 'EN_PROGRESO',
          fechaInicio: new Date(),
        });

        expect(prisma.rutas.update).toHaveBeenCalledWith({
          where: { rutaId: BigInt(1), deletedAt: null },
          data: expect.objectContaining({
            estado: 'EN_PROGRESO',
            fechaInicio: expect.any(Date),
          }),
        });
      });
    });

    describe('findOperatorsByGeography', () => {
      it('should find operators with routes in a given comunidad and sector', async () => {
        const mockOperators = [
          { usuarioId: 1, nombres: 'Juan', apellidos: 'Perez' },
          { usuarioId: 2, nombres: 'Maria', apellidos: 'Lopez' },
        ];
        prisma.usuarios.findMany.mockResolvedValue(mockOperators);

        const result = await repository.findOperatorsByGeography(5, 3);

        expect(prisma.usuarios.findMany).toHaveBeenCalledWith({
          where: {
            rutas: {
              some: {
                comunidadId: 5,
                sectorId: 3,
                deletedAt: null,
              },
            },
          },
        });
        expect(result).toEqual(mockOperators);
      });

      it('should find operators with routes in a comunidad when sector is null', async () => {
        prisma.usuarios.findMany.mockResolvedValue([]);

        const result = await repository.findOperatorsByGeography(5, null);

        expect(prisma.usuarios.findMany).toHaveBeenCalledWith({
          where: {
            rutas: {
              some: {
                comunidadId: 5,
                deletedAt: null,
              },
            },
          },
        });
        expect(result).toEqual([]);
      });
    });

    describe('getMaxOrdenInZona', () => {
      it('should return the max orden for a given comunidad and sector', async () => {
        prisma.rutas.aggregate.mockResolvedValue({ _max: { orden: 5 } });

        const result = await repository.getMaxOrdenInZona(5, 3);

        expect(prisma.rutas.aggregate).toHaveBeenCalledWith({
          where: { comunidadId: 5, sectorId: 3, deletedAt: null },
          _max: { orden: true },
        });
        expect(result).toBe(5);
      });

      it('should return 0 when no tasks exist in the zona', async () => {
        prisma.rutas.aggregate.mockResolvedValue({ _max: { orden: null } });

        const result = await repository.getMaxOrdenInZona(5, 3);

        expect(result).toBe(0);
      });

      it('should handle null sectorId by querying without sector filter', async () => {
        prisma.rutas.aggregate.mockResolvedValue({ _max: { orden: null } });

        await repository.getMaxOrdenInZona(5, null);

        expect(prisma.rutas.aggregate).toHaveBeenCalledWith({
          where: { comunidadId: 5, deletedAt: null },
          _max: { orden: true },
        });
      });
    });

    describe('findMeterContractLocation', () => {
      it('should return contract location for a meter', async () => {
        prisma.medidores.findUnique.mockResolvedValue({
          serie: 'MED-001',
          historial: [{ contrato: { comunidadId: 5, sectorId: 3 } }],
        });

        const result = await repository.findMeterContractLocation(BigInt(100));

        expect(prisma.medidores.findUnique).toHaveBeenCalledWith({
          where: { medidorId: BigInt(100) },
          select: expect.objectContaining({ serie: true }),
        });
        expect(result).toEqual({
          serie: 'MED-001',
          comunidadId: 5,
          sectorId: 3,
        });
      });

      it('should return null when meter does not exist', async () => {
        prisma.medidores.findUnique.mockResolvedValue(null);

        const result = await repository.findMeterContractLocation(BigInt(999));

        expect(result).toBeNull();
      });

      it('should return null sectorId when contract has no sector', async () => {
        prisma.medidores.findUnique.mockResolvedValue({
          serie: 'MED-002',
          historial: [{ contrato: { comunidadId: 7, sectorId: null } }],
        });

        const result = await repository.findMeterContractLocation(BigInt(200));

        expect(result).toEqual({
          serie: 'MED-002',
          comunidadId: 7,
          sectorId: null,
        });
      });
    });

    describe('findMedidoresById', () => {
      it('should return meters for given ids', async () => {
        const mockMeters = [
          {
            medidorId: BigInt(1),
            serie: 'M1',
            marca: 'X',
            modelo: 'Y',
            latitud: null,
            longitud: null,
          },
        ];
        prisma.medidores.findMany.mockResolvedValue(mockMeters);

        const result = await repository.findMedidoresById([BigInt(1)]);

        expect(prisma.medidores.findMany).toHaveBeenCalledWith({
          where: { medidorId: { in: [BigInt(1)] } },
          select: expect.objectContaining({ medidorId: true, serie: true }),
        });
        expect(result).toEqual(mockMeters);
      });
    });
  });
});
