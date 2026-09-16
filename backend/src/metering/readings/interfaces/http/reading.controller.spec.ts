import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ReadingController } from './reading.controller';
import { ReadingService } from '../../application/reading.service';

describe('ReadingController', () => {
  let controller: ReadingController;
  let service: ReadingService;
  const reading = {
    lecturaId: 1n,
    fecha: new Date('2024-01-15'),
    lecturaAnterior: 100,
    lecturaActual: 150,
    consumoCalculado: 50,
    contratoId: 1n,
    descripcionAnomalia: null,
    fechaValidacion: null,
    medidorId: 1n,
    periodoId: 1,
    estado: 'VALIDADA',
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReadingController],
      providers: [
        {
          provide: ReadingService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();
    controller = module.get(ReadingController);
    service = module.get(ReadingService);
  });

  it('lists readings', async () => {
    (service.findAll as jest.Mock).mockResolvedValue({
      data: [reading],
      meta: { total: 1 },
    });
    const result = await controller.findAll({ page: 1, limit: 10 });
    expect(service.findAll).toHaveBeenCalled();
    expect(result.meta).toEqual({ total: 1 });
    expect(result.data).toHaveLength(1);
  });

  it('gets a reading by id', async () => {
    (service.findOne as jest.Mock).mockResolvedValue(reading);
    await controller.findOne(1n);
    expect(service.findOne).toHaveBeenCalledWith(1n);
  });

  it('updates a reading', async () => {
    const dto = { lecturaActual: 200 };
    (service.update as jest.Mock).mockResolvedValue(reading);
    await controller.actualizarLectura(1n, dto);
    expect(service.update).toHaveBeenCalledWith(1n, dto);
  });

  it('removes a reading', async () => {
    (service.delete as jest.Mock).mockResolvedValue({ message: 'deleted' });
    await controller.eliminarLectura(1n);
    expect(service.delete).toHaveBeenCalledWith(1n);
  });
});
