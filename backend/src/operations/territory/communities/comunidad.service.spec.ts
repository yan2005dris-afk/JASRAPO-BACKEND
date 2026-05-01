import { Test, TestingModule } from '@nestjs/testing';
import { ComunidadService } from './comunidad.service';
import { CreateCommunityUseCase } from './use-cases/create-community.use-case';
import { UpdateCommunityUseCase } from './use-cases/update-community.use-case';
import { GetAllCommunitiesUseCase } from './use-cases/get-all-communities.use-case';
import { GetCommunityUseCase } from './use-cases/get-community.use-case';
import { DeleteCommunityUseCase } from './use-cases/delete-community.use-case';

describe('ComunidadService', () => {
  let service: ComunidadService;
  let createUseCase: CreateCommunityUseCase;
  let updateUseCase: UpdateCommunityUseCase;
  let getAllUseCase: GetAllCommunitiesUseCase;
  let getOneUseCase: GetCommunityUseCase;
  let deleteUseCase: DeleteCommunityUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComunidadService,
        {
          provide: CreateCommunityUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: UpdateCommunityUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetAllCommunitiesUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetCommunityUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: DeleteCommunityUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<ComunidadService>(ComunidadService);
    createUseCase = module.get<CreateCommunityUseCase>(CreateCommunityUseCase);
    updateUseCase = module.get<UpdateCommunityUseCase>(UpdateCommunityUseCase);
    getAllUseCase = module.get<GetAllCommunitiesUseCase>(GetAllCommunitiesUseCase);
    getOneUseCase = module.get<GetCommunityUseCase>(GetCommunityUseCase);
    deleteUseCase = module.get<DeleteCommunityUseCase>(DeleteCommunityUseCase);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('crearComunidad should delegate to CreateCommunityUseCase', async () => {
    const dto = { nombre: 'Comunidad Test', sectorId: 1 };
    await service.crearComunidad(dto);
    expect(createUseCase.execute).toHaveBeenCalledWith(dto);
  });

  it('findAll should delegate to GetAllCommunitiesUseCase', async () => {
    await service.findAll();
    expect(getAllUseCase.execute).toHaveBeenCalled();
  });

  it('findOne should delegate to GetCommunityUseCase', async () => {
    const id = 1;
    await service.findOne(id);
    expect(getOneUseCase.execute).toHaveBeenCalledWith(id);
  });

  it('actualizarComunidad should delegate to UpdateCommunityUseCase', async () => {
    const id = 1;
    const dto = { nombre: 'Comunidad Updated' };
    await service.actualizarComunidad(id, dto);
    expect(updateUseCase.execute).toHaveBeenCalledWith(id, dto);
  });

  it('eliminarActualizar should delegate to DeleteCommunityUseCase', async () => {
    const id = 1;
    await service.eliminarActualizar(id);
    expect(deleteUseCase.execute).toHaveBeenCalledWith(id);
  });
});
