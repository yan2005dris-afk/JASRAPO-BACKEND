import { Test } from '@nestjs/testing';
import { WorkOrderNoveltyController } from './work-order-novelty.controller';
import { WorkOrderNoveltyService } from '../../application/services/work-order-novelty.service';
import { WorkOrderNoveltyEntity } from '../../domain/entities/work-order-novelty.entity';
import { EstadoNovedad, TipoAnomalia } from 'src/shared/enums';

describe('WorkOrderNoveltyController', () => {
  let controller: WorkOrderNoveltyController;
  let serviceMock: any;

  beforeEach(async () => {
    serviceMock = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };
    const module = await Test.createTestingModule({
      controllers: [WorkOrderNoveltyController],
      providers: [{ provide: WorkOrderNoveltyService, useValue: serviceMock }],
    }).compile();
    controller = module.get<WorkOrderNoveltyController>(
      WorkOrderNoveltyController,
    );
  });

  it('creates novelty and serializes IDs as strings', async () => {
    const entity = new WorkOrderNoveltyEntity({
      novedadId: 100n,
      ordenTrabajoId: 200n,
      tipo: TipoAnomalia.FUGA,
      estado: EstadoNovedad.OPEN,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    serviceMock.create.mockResolvedValue(entity);
    const res = await controller.create({
      ordenTrabajoId: '200',
      tipo: TipoAnomalia.FUGA,
    });
    expect(res.novedadId).toBe('100');
    expect(res.ordenTrabajoId).toBe('200');
  });

  it('lists novelties with pagination and filter', async () => {
    const entity = new WorkOrderNoveltyEntity({
      novedadId: 101n,
      ordenTrabajoId: 201n,
      tipo: TipoAnomalia.OTRO,
      estado: EstadoNovedad.OPEN,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    serviceMock.findAll.mockResolvedValue({ data: [entity], total: 1 });
    const res = await controller.findAll(
      '201',
      undefined,
      undefined,
      '1',
      '10',
    );
    expect(res.total).toBe(1);
    expect(res.data[0].novedadId).toBe('101');
  });

  it('finds and updates novelty', async () => {
    const entity = new WorkOrderNoveltyEntity({
      novedadId: 102n,
      ordenTrabajoId: 202n,
      estado: EstadoNovedad.RESOLVED,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    serviceMock.findById.mockResolvedValue(entity);
    serviceMock.update.mockResolvedValue(entity);
    expect((await controller.findOne(102n)).novedadId).toBe('102');
    const updated = await controller.update(
      102n,
      { estado: EstadoNovedad.RESOLVED },
      7,
    );
    expect(updated.novedadId).toBe('102');
    expect(serviceMock.update).toHaveBeenCalledWith(
      102n,
      { estado: EstadoNovedad.RESOLVED },
      undefined,
      7,
    );
  });

  it('soft deletes a novelty and returns confirmation', async () => {
    serviceMock.softDelete.mockResolvedValue(undefined);
    const res = await controller.remove(102n, 7);
    expect(res).toEqual({ message: 'Novedad eliminada correctamente' });
    expect(serviceMock.softDelete).toHaveBeenCalledWith(102n, 7);
  });
});
