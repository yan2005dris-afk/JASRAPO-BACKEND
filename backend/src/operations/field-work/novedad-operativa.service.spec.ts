import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NovedadOperativaService } from './novedad-operativa.service';
import { CreateFieldWorkUseCase } from './use-cases/create-field-work.use-case';
import { FindAllFieldWorksUseCase } from './use-cases/find-all-field-works.use-case';
import { FindOneFieldWorkUseCase } from './use-cases/find-one-field-work.use-case';
import { UpdateFieldWorkUseCase } from './use-cases/update-field-work.use-case';
import { RemoveFieldWorkUseCase } from './use-cases/remove-field-work.use-case';
import { TipoNovedad, EstadoNovedad } from 'src/generated/prisma/enums';

describe('NovedadOperativaService', () => {
  let service: NovedadOperativaService;
  let createUseCase: CreateFieldWorkUseCase;
  let findAllUseCase: FindAllFieldWorksUseCase;
  let findOneUseCase: FindOneFieldWorkUseCase;
  let updateUseCase: UpdateFieldWorkUseCase;
  let removeUseCase: RemoveFieldWorkUseCase;

  const mockUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NovedadOperativaService,
        { provide: CreateFieldWorkUseCase, useValue: mockUseCase },
        { provide: FindAllFieldWorksUseCase, useValue: mockUseCase },
        { provide: FindOneFieldWorkUseCase, useValue: mockUseCase },
        { provide: UpdateFieldWorkUseCase, useValue: mockUseCase },
        { provide: RemoveFieldWorkUseCase, useValue: mockUseCase },
      ],
    }).compile();

    service = module.get<NovedadOperativaService>(NovedadOperativaService);
    createUseCase = module.get<CreateFieldWorkUseCase>(CreateFieldWorkUseCase);
    findAllUseCase = module.get<FindAllFieldWorksUseCase>(FindAllFieldWorksUseCase);
    findOneUseCase = module.get<FindOneFieldWorkUseCase>(FindOneFieldWorkUseCase);
    updateUseCase = module.get<UpdateFieldWorkUseCase>(UpdateFieldWorkUseCase);
    removeUseCase = module.get<RemoveFieldWorkUseCase>(RemoveFieldWorkUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('crearNovedadOperativa should delegate to CreateFieldWorkUseCase', async () => {
    const dto = { lecturaId: '1', observacion: 'test', tipo: TipoNovedad.FUGA, estado: EstadoNovedad.PENDIENTE };
    await service.crearNovedadOperativa(dto);
    expect(createUseCase.execute).toHaveBeenCalledWith(dto);
  });

  it('buscarNovedades should delegate to FindAllFieldWorksUseCase', async () => {
    const params = { skip: 0, take: 10 };
    await service.buscarNovedades(params);
    expect(findAllUseCase.execute).toHaveBeenCalledWith(params);
  });

  it('buscarNovedad should delegate to FindOneFieldWorkUseCase', async () => {
    const id = BigInt(1);
    await service.buscarNovedad(id);
    expect(findOneUseCase.execute).toHaveBeenCalledWith(id);
  });

  it('actualizarNovedad should delegate to UpdateFieldWorkUseCase', async () => {
    const id = BigInt(1);
    const dto = { observacion: 'updated' };
    await service.actualizarNovedad(id, dto);
    expect(updateUseCase.execute).toHaveBeenCalledWith(id, dto);
  });

  it('eliminarNovedad should delegate to RemoveFieldWorkUseCase', async () => {
    const id = BigInt(1);
    await service.eliminarNovedad(id);
    expect(removeUseCase.execute).toHaveBeenCalledWith(id);
  });
});
