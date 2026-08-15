import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ClientController } from './client.controller';
import { ClientService } from '../../application/client.service';
import { ClientResponseDto } from '../dto/client-response.dto';

describe('ClientController', () => {
  let controller: ClientController;

  const mockClient = {
    clienteId: BigInt(1),
    identificacion: '0999999999001',
    nombres: 'JUAN',
    apellidos: 'PEREZ',
    razonSocial: null,
    email: null,
    telefono: null,
    telefonoSecundario: null,
    direccionDomicilio: null,
    activo: true,
    aplicaDiscapacidad: false,
    aplicaTerceraEdad: false,
    tipoIdentificacion: {
      id: 2,
      codigo: '04',
      descripcion: 'RUC',
    },
    deletedAt: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-02'),
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
    it('should map paginated entities to ClientResponseDto', async () => {
      const paginated = {
        data: [mockClient],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          ultimaPagina: 1,
          paginaActual: 1,
          porPagina: 10,
          anterior: null,
          siguiente: null,
        },
      };
      mockClientService.findAll.mockResolvedValue(paginated);

      const result = await controller.findAll({
        identificacion: '0999999999001',
      });

      expect(result.meta).toEqual(paginated.meta);
      expect(result.data[0]).toBeInstanceOf(ClientResponseDto);
      expect(result.data[0].clienteId).toEqual(BigInt(1));
      expect(result.data[0].identificacion).toBe('0999999999001');
      expect(mockClientService.findAll).toHaveBeenCalledWith({
        identificacion: '0999999999001',
      });
    });

    it('should handle empty results', async () => {
      mockClientService.findAll.mockResolvedValue({
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit: 10,
          ultimaPagina: 1,
          paginaActual: 1,
          porPagina: 10,
          anterior: null,
          siguiente: null,
        },
      });

      const result = await controller.findAll({});

      expect(result.data).toEqual([]);
      expect(mockClientService.findAll).toHaveBeenCalledWith({});
    });
  });

  describe('create', () => {
    it('should map the created entity to ClientResponseDto', async () => {
      mockClientService.create.mockResolvedValue(mockClient);
      const dto = {
        identificacion: '0999999999001',
        tipoIdentificacionId: 2,
        nombres: 'JUAN',
        apellidos: 'PEREZ',
      };

      const result = await controller.create(dto);

      expect(result).toBeInstanceOf(ClientResponseDto);
      expect(result.clienteId).toEqual(BigInt(1));
      expect(mockClientService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findOne', () => {
    it('should map the found entity to ClientResponseDto', async () => {
      mockClientService.findOne.mockResolvedValue(mockClient);

      const result = await controller.findOne(BigInt(1));

      expect(result).toBeInstanceOf(ClientResponseDto);
      expect(result.identificacion).toBe('0999999999001');
      expect(mockClientService.findOne).toHaveBeenCalledWith(BigInt(1));
    });
  });

  describe('update', () => {
    it('should map the updated entity to ClientResponseDto', async () => {
      mockClientService.update.mockResolvedValue(mockClient);

      const result = await controller.update(BigInt(1), { nombres: 'JUAN' });

      expect(result).toBeInstanceOf(ClientResponseDto);
      expect(mockClientService.update).toHaveBeenCalledWith(BigInt(1), {
        nombres: 'JUAN',
      });
    });
  });

  describe('delete', () => {
    it('should map the soft-deleted entity to ClientResponseDto', async () => {
      mockClientService.delete.mockResolvedValue(mockClient);

      const result = await controller.delete(BigInt(1));

      expect(result).toBeInstanceOf(ClientResponseDto);
      expect(mockClientService.delete).toHaveBeenCalledWith(BigInt(1));
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
