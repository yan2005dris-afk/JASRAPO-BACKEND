import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { SectorService } from './sector.service';
import { CreateSectorUseCase } from './use-cases/create-sector.use-case';
import { UpdateSectorUseCase } from './use-cases/update-sector.use-case';
import { GetAllSectorsUseCase } from './use-cases/get-all-sectors.use-case';
import { GetSectorUseCase } from './use-cases/get-sector.use-case';
import { DeleteSectorUseCase } from './use-cases/delete-sector.use-case';

describe('SectorService', () => {
  let service: SectorService;
  let createUseCase: CreateSectorUseCase;
  let updateUseCase: UpdateSectorUseCase;
  let getAllUseCase: GetAllSectorsUseCase;
  let getOneUseCase: GetSectorUseCase;
  let deleteUseCase: DeleteSectorUseCase;

  const mockUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SectorService,
        { provide: CreateSectorUseCase, useValue: mockUseCase },
        { provide: UpdateSectorUseCase, useValue: mockUseCase },
        { provide: GetAllSectorsUseCase, useValue: mockUseCase },
        { provide: GetSectorUseCase, useValue: mockUseCase },
        { provide: DeleteSectorUseCase, useValue: mockUseCase },
      ],
    }).compile();

    service = module.get<SectorService>(SectorService);
    createUseCase = module.get<CreateSectorUseCase>(CreateSectorUseCase);
    updateUseCase = module.get<UpdateSectorUseCase>(UpdateSectorUseCase);
    getAllUseCase = module.get<GetAllSectorsUseCase>(GetAllSectorsUseCase);
    getOneUseCase = module.get<GetSectorUseCase>(GetSectorUseCase);
    deleteUseCase = module.get<DeleteSectorUseCase>(DeleteSectorUseCase);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('crearSector', () => {
    it('should delegate to CreateSectorUseCase', async () => {
      const dto = { nombre: 'Sector A', comunidadId: 1 };
      await service.crearSector(dto as any);
      expect(createUseCase.execute).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should delegate to GetAllSectorsUseCase', async () => {
      await service.findAll();
      expect(getAllUseCase.execute).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should delegate to GetSectorUseCase', async () => {
      await service.findOne(1);
      expect(getOneUseCase.execute).toHaveBeenCalledWith(1);
    });
  });

  describe('actualizarSector', () => {
    it('should delegate to UpdateSectorUseCase', async () => {
      const dto = { nombre: 'Sector Updated' };
      await service.actualizarSector(1, dto as any);
      expect(updateUseCase.execute).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('eliminarSector', () => {
    it('should delegate to DeleteSectorUseCase', async () => {
      await service.eliminarSector(1);
      expect(deleteUseCase.execute).toHaveBeenCalledWith(1);
    });
  });
});
