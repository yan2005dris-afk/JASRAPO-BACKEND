import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { OrdenesTrabajoService } from 'src/operations/work-orders/application/ordenes-trabajo.service';
import { GetOperatorActivityTypesUseCase } from './get-operator-activity-types.use-case';
import type { TipoActividad } from 'src/operations/work-orders/domain/types/tipo-actividad.type';

describe('GetOperatorActivityTypesUseCase', () => {
  let useCase: GetOperatorActivityTypesUseCase;
  let ordenesTrabajoService: { getActivityTypes: jest.Mock };

  const mockTipos: TipoActividad[] = [
    {
      tipoActividadId: 1,
      codigo: 'LECTURA',
      nombre: 'Lectura',
      descripcion: null,
      icono: 'bi-droplet',
      activo: true,
    },
  ];

  beforeEach(async () => {
    ordenesTrabajoService = {
      getActivityTypes: jest.fn().mockResolvedValue(mockTipos),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetOperatorActivityTypesUseCase,
        {
          provide: OrdenesTrabajoService,
          useValue: ordenesTrabajoService,
        },
      ],
    }).compile();

    useCase = module.get<GetOperatorActivityTypesUseCase>(
      GetOperatorActivityTypesUseCase,
    );
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should delegate to OrdenesTrabajoService.getActivityTypes', async () => {
    const result = await useCase.execute();

    expect(ordenesTrabajoService.getActivityTypes).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockTipos);
  });
});