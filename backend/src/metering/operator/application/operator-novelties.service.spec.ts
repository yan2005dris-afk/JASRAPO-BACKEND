import { NotFoundException } from '@nestjs/common';
import { OperatorNoveltiesService } from './operator-novelties.service';
import type { OperatorRepository } from '../domain/repositories/operator.repository';
import type { WorkOrderNoveltyService } from 'src/operations/work-order-novelties/application/work-order-novelty.service';

describe('OperatorNoveltiesService', () => {
  const row = {
    novedadId: 12n,
    ordenTrabajoId: 45n,
    lecturaId: null,
    tipo: 'FUGA',
    observacion: 'Fuga visible',
    estado: 'OPEN',
    fotoUrl: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ordenTrabajo: {
      contratoId: 6n,
      medidorId: 7n,
      medidor: { serie: 'SER-7' },
      contrato: {
        numeroGuia: 'GUIA-5-0006',
        direccionSuministro: 'Direccion contrato 6',
        cliente: {
          nombres: 'Ignorado',
          apellidos: '',
          razonSocial: 'AGUA COMUNAL',
        },
      },
    },
  };
  const repository = {
    findOperatorNovelties: jest.fn(),
    findOperatorNovelty: jest.fn(),
  };
  const novelties = { update: jest.fn() };
  let service: OperatorNoveltiesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new OperatorNoveltiesService(
      repository as unknown as OperatorRepository,
      novelties as unknown as WorkOrderNoveltyService,
    );
  });

  it('lists assigned order novelties including those without a reading', async () => {
    repository.findOperatorNovelties.mockResolvedValue({
      data: [row],
      total: 1,
    });
    const result = await service.list(9);
    expect(repository.findOperatorNovelties).toHaveBeenCalledWith({
      operarioId: 9,
      page: 1,
      limit: 100,
      filters: undefined,
    });
    expect(result.data[0]).toEqual(
      expect.objectContaining({
        novedadId: '12',
        ordenTrabajoId: '45',
        lecturaId: null,
        medidorSerie: 'SER-7',
        clienteNombre: 'AGUA COMUNAL',
      }),
    );
  });

  it('denies access to a novelty outside the operator routes', async () => {
    repository.findOperatorNovelty.mockResolvedValue(null);
    await expect(service.findOne(9, 12n)).rejects.toThrow(NotFoundException);
    expect(repository.findOperatorNovelty).toHaveBeenCalledWith(9, 12n);
    await expect(
      service.update(9, 12n, { observacion: 'Cambio' }),
    ).rejects.toThrow(NotFoundException);
    expect(novelties.update).not.toHaveBeenCalled();
  });

  it('updates the original novelty only after checking assignment', async () => {
    repository.findOperatorNovelty.mockResolvedValue(row);
    novelties.update.mockResolvedValue(row);
    const result = await service.update(9, 12n, {
      observacion: 'Cambio real',
    });
    expect(novelties.update).toHaveBeenCalledWith(
      12n,
      { observacion: 'Cambio real' },
      undefined,
      9,
    );
    expect(result.novedadId).toBe('12');
  });
});
