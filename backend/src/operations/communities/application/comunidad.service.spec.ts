import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ComunidadService } from './comunidad.service';
import { CreateCommunityUseCase } from './use-cases/create-community.use-case';
import { UpdateCommunityUseCase } from './use-cases/update-community.use-case';
import { FindAllCommunitiesUseCase } from './use-cases/find-all-communities.use-case';
import { FindAllCommunitiesWithSectorUseCase } from './use-cases/find-all-communities-with-sector.use-case';
import { FindOneCommunityUseCase } from './use-cases/find-one-community.use-case';
import { DeleteCommunityUseCase } from './use-cases/delete-community.use-case';

describe('ComunidadService', () => {
  let service: ComunidadService;
  let createUseCase: CreateCommunityUseCase;
  let updateUseCase: UpdateCommunityUseCase;
  let findAllUseCase: FindAllCommunitiesUseCase;
  let findAllWithSectorUseCase: FindAllCommunitiesWithSectorUseCase;
  let findOneUseCase: FindOneCommunityUseCase;
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
          provide: FindAllCommunitiesUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: FindAllCommunitiesWithSectorUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: FindOneCommunityUseCase,
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
    findAllUseCase = module.get<FindAllCommunitiesUseCase>(
      FindAllCommunitiesUseCase,
    );
    findAllWithSectorUseCase = module.get<FindAllCommunitiesWithSectorUseCase>(
      FindAllCommunitiesWithSectorUseCase,
    );
    findOneUseCase = module.get<FindOneCommunityUseCase>(
      FindOneCommunityUseCase,
    );
    deleteUseCase = module.get<DeleteCommunityUseCase>(DeleteCommunityUseCase);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create should delegate to CreateCommunityUseCase', async () => {
    const dto = {
      nombre: 'Comunidad Test',
      codigo: 'CT-001',
      porcentajeTasaSeguridad: 5,
    };
    await service.create(dto);
    expect(createUseCase.execute).toHaveBeenCalledWith(dto);
  });

  it('findAll should delegate to FindAllCommunitiesUseCase', async () => {
    await service.findAll();
    expect(findAllUseCase.execute).toHaveBeenCalled();
  });

  it('findAllWithSector should delegate to FindAllCommunitiesWithSectorUseCase', async () => {
    await service.findAllWithSector({ sectorId: 1 });
    expect(findAllWithSectorUseCase.execute).toHaveBeenCalledWith({
      sectorId: 1,
    });
  });

  it('findOne should delegate to FindOneCommunityUseCase', async () => {
    const id = 1;
    await service.findOne(id);
    expect(findOneUseCase.execute).toHaveBeenCalledWith(id);
  });

  it('update should delegate to UpdateCommunityUseCase', async () => {
    const id = 1;
    const dto = { nombre: 'Comunidad Updated' };
    await service.update(id, dto);
    expect(updateUseCase.execute).toHaveBeenCalledWith(id, dto);
  });

  it('delete should delegate to DeleteCommunityUseCase', async () => {
    const id = 1;
    await service.delete(id);
    expect(deleteUseCase.execute).toHaveBeenCalledWith(id);
  });
});
