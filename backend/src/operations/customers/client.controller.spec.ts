import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ClientController } from './client.controller';
import { ClientService } from './client.service';
import { TipoIdentificacion } from 'src/generated/prisma/enums';

describe('ClientController', () => {
  let controller: ClientController;

  const mockClient = {
    clienteId: '1',
    identificacion: '0999999999001',
    tipoIdentificacion: TipoIdentificacion.RUC,
    nombres: 'JUAN',
    apellidos: 'PEREZ',
  };

  const mockClientService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    search: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientController],
      providers: [
        {
          provide: ClientService,
          useValue: mockClientService,
        },
      ],
    }).compile();

    controller = module.get<ClientController>(ClientController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('search', () => {
    it('should be defined', () => {
      expect(controller.search).toBeDefined();
    });

    it('should call clientService.search with correct params', async () => {
      mockClientService.search.mockResolvedValue([mockClient]);

      const result = await controller.search(
        'nombreCompleto',
        'JUAN',
        '1',
        '10',
      );

      expect(result).toHaveLength(1);
      expect(mockClientService.search).toHaveBeenCalledWith(
        'nombreCompleto',
        'JUAN',
        1,
        10,
      );
    });
  });

  describe('create', () => {
    it('should call service.create', async () => {
      mockClientService.create.mockResolvedValue(mockClient);
      const dto = {
        identificacion: '0999999999001',
        tipoIdentificacion: TipoIdentificacion.RUC,
        nombres: 'JUAN',
        apellidos: 'PEREZ',
      };

      const result = await controller.create(dto);

      expect(result).toEqual(mockClient);
      expect(mockClientService.create).toHaveBeenCalledWith(dto);
    });
  });
});
