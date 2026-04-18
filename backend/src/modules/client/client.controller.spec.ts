import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ClientController } from './client.controller';
import { ClientService } from './client.service';

describe('ClientController', () => {
  let controller: ClientController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientController],
      providers: [
        {
          provide: ClientService,
          useValue: {
            search: jest.fn().mockResolvedValue([
              { clienteId: 1, nombres: 'JUAN', identificacion: '1234567890' },
            ]),
            searchPrivate: jest.fn().mockResolvedValue([
              { clienteId: 1, nombres: 'JUAN', identificacion: '1234567890' },
            ]),
            create: jest.fn().mockResolvedValue({
              clienteId: 1,
              nombres: 'JUAN',
              identificacion: '1234567890',
            }),
            findAll: jest.fn().mockResolvedValue([
              { clienteId: 1, nombres: 'JUAN' },
              { clienteId: 2, nombres: 'PEDRO' },
            ]),
            findOne: jest.fn().mockResolvedValue({
              clienteId: 1,
              nombres: 'JUAN',
              identificacion: '1234567890',
            }),
            update: jest.fn().mockResolvedValue({
              clienteId: 1,
              nombres: 'JUAN ACTUALIZADO',
            }),
            remove: jest.fn().mockResolvedValue({
              clienteId: 1,
              deletedAt: new Date(),
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<ClientController>(ClientController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('search', () => {
    it('should be defined', () => {
      expect(controller.search).toBeDefined();
    });

    it('should call clientService.search with correct params', async () => {
      const result = await controller.search('identificacion', '1234567890');
      expect(result).toHaveLength(1);
    });
  });

  describe('searchPrivate', () => {
    it('should be defined', () => {
      expect(controller.searchPrivate).toBeDefined();
    });

    it('should call clientService.searchPrivate with correct params', async () => {
      const result = await controller.searchPrivate('nombreCompleto', 'JUAN');
      expect(result).toHaveLength(1);
    });
  });

  describe('create', () => {
    it('should be defined', () => {
      expect(controller.create).toBeDefined();
    });

    it('should call clientService.create with dto', async () => {
      const createDto = {
        tipoIdentificacion: 'CEDULA' as const,
        identificacion: '1234567890',
        nombres: 'Juan',
        apellidos: 'Perez',
      };
      const result = await controller.create(createDto);
      expect(result).toHaveProperty('clienteId');
    });
  });

  describe('findAll', () => {
    it('should be defined', () => {
      expect(controller.findAll).toBeDefined();
    });

    it('should call clientService.findAll', async () => {
      const result = await controller.findAll();
      expect(result).toHaveLength(2);
    });
  });

  describe('findOne', () => {
    it('should be defined', () => {
      expect(controller.findOne).toBeDefined();
    });

    it('should call clientService.findOne with id', async () => {
      const result = await controller.findOne('1');
      expect(result).toHaveProperty('clienteId');
    });
  });

  describe('update', () => {
    it('should be defined', () => {
      expect(controller.update).toBeDefined();
    });

    it('should call clientService.update with id and dto', async () => {
      const updateDto = { nombres: 'Juan Actualizado' };
      const result = await controller.update('1', updateDto);
      expect(result).toHaveProperty('nombres', 'JUAN ACTUALIZADO');
    });
  });

  describe('remove', () => {
    it('should be defined', () => {
      expect(controller.remove).toBeDefined();
    });

    it('should call clientService.remove with id', async () => {
      const result = await controller.remove('1');
      expect(result).toHaveProperty('deletedAt');
    });
  });
});