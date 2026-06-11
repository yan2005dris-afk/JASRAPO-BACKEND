import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ClientController } from './client.controller';
import { ClientService } from '../../application/client.service';

describe('ClientController', () => {
  let controller: ClientController;

  const mockClient = {
    clienteId: BigInt(1),
    identificacion: '0999999999001',
    tipoIdentificacionId: 2,
    nombres: 'JUAN',
    apellidos: 'PEREZ',
    tipoIdentificacion: {
      id: 2,
      codigo: '04',
      descripcion: 'RUC',
    },
  };

  const mockClientService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findAllIdentificaciones: jest.fn(),
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
        tipoIdentificacionId: 2,
        nombres: 'JUAN',
        apellidos: 'PEREZ',
      };

      const result = await controller.create(dto);

      expect(result).toEqual(mockClient);
      expect(mockClientService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAllIdentificaciones', () => {
    it('should call service.findAllIdentificaciones', async () => {
      const mockIdentificaciones = [
        {
          id: 1,
          codigo: '05',
          descripcion: 'Cédula',
          activo: true,
        },
      ];
      mockClientService.findAllIdentificaciones.mockResolvedValue(
        mockIdentificaciones,
      );

      const result = await controller.findAllIdentificaciones();

      expect(result).toEqual(mockIdentificaciones);
      expect(mockClientService.findAllIdentificaciones).toHaveBeenCalled();
    });
  });
});
