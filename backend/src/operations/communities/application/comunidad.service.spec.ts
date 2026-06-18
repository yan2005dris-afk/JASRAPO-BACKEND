import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ComunidadService } from './comunidad.service';
import { CreateCommunityUseCase } from './use-cases/create-community.use-case';
import { UpdateCommunityUseCase } from './use-cases/update-community.use-case';
import { FindAllCommunitiesUseCase } from './use-cases/find-all-communities.use-case';
import { FindOneCommunityUseCase } from './use-cases/find-one-community.use-case';
import { DeleteCommunityUseCase } from './use-cases/delete-community.use-case';
import type { CommunityFilterDto } from '../interfaces/dto/community-filter.dto';

describe('ComunidadService', () => {
  let service: ComunidadService;
  let createUseCase: CreateCommunityUseCase;
  let updateUseCase: UpdateCommunityUseCase;
  let findAllUseCase: FindAllCommunitiesUseCase;
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

  it('findAll should delegate to FindAllCommunitiesUseCase with pagination', async () => {
    await service.findAll(2, 5);
    expect(findAllUseCase.execute).toHaveBeenCalledWith(2, 5, undefined);
  });

  it('findAll should use defaults when no pagination provided', async () => {
    await service.findAll();
    expect(findAllUseCase.execute).toHaveBeenCalledWith(
      undefined,
      undefined,
      undefined,
    );
  });

  it('findAll should pass CommunityFilterDto', async () => {
    const filter: CommunityFilterDto = { nombre: 'test', codigo: 'TC-001' };
    await service.findAll(1, 10, filter);
    expect(findAllUseCase.execute).toHaveBeenCalledWith(1, 10, filter);
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
