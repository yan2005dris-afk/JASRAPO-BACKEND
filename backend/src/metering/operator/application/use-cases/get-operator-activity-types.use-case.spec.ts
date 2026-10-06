import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { GetOperatorActivityTypesUseCase } from './get-operator-activity-types.use-case';

describe('GetOperatorActivityTypesUseCase', () => {
  let useCase: GetOperatorActivityTypesUseCase;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetOperatorActivityTypesUseCase,
        {
          provide: PrismaService,
          useValue: {
            tipoActividad: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    useCase = module.get<GetOperatorActivityTypesUseCase>(
      GetOperatorActivityTypesUseCase,
    );
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return active activity types', async () => {
    const mockTypes = [
      {
        tipoActividadId: 1n,
        codigo: 'LECTURA',
        nombre: 'Lectura',
        descripcion: null,
        icono: 'bi-droplet',
        activo: true,
      },
    ];

    jest.spyOn(prisma.tipoActividad, 'findMany').mockResolvedValue(mockTypes);

    const result = await useCase.execute();

    expect(prisma.tipoActividad.findMany).toHaveBeenCalledWith({
      where: { activo: true },
      orderBy: { tipoActividadId: 'asc' },
    });

    expect(result).toEqual([
      {
        tipoActividadId: 1,
        codigo: 'LECTURA',
        nombre: 'Lectura',
        descripcion: null,
        icono: 'bi-droplet',
        activo: true,
      },
    ]);
  });
});
