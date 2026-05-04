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

  describe('findAll', () => {
    it('should call service.findAll with filters', async () => {
      mockClientService.findAll.mockResolvedValue([mockClient]);

      const result = await controller.findAll({
        identificacion: '0999999999001',
      });

      expect(result).toEqual([mockClient]);
      expect(mockClientService.findAll).toHaveBeenCalledWith({
        identificacion: '0999999999001',
      });
    });

    it('should call service.findAll without filters', async () => {
      mockClientService.findAll.mockResolvedValue([mockClient]);

      const result = await controller.findAll({});

      expect(result).toEqual([mockClient]);
      expect(mockClientService.findAll).toHaveBeenCalledWith({});
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
