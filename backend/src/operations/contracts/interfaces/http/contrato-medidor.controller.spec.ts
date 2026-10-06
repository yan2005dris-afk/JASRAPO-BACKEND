jest.mock('puppeteer', () => ({}));

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ContratoMedidorController } from './contrato-medidor.controller';
import { ContratoMedidorService } from '../../application/contrato-medidor.service';
import { ContractEntity } from '../../domain/entities/contract.entity';
import { ServiceAreaResponseDto } from '../dto/service-area-response.dto';

describe('ContratoMedidorController', () => {
  let controller: ContratoMedidorController;

  const mockService = {
    crearContrato: jest.fn(),
    buscarContratos: jest.fn(),
    buscarContrato: jest.fn(),
    actualizar: jest.fn(),
    finalizarVinculo: jest.fn(),
    eliminar: jest.fn(),
    generateConnectionRequestPdf: jest.fn(),
    generateResponsibilityAgreementPdf: jest.fn(),
    getServiceArea: jest.fn(),
  };

  const sampleContract = new ContractEntity({
    contratoId: 1n,
    clienteId: 10n,
    categoriaTarifaId: 1,
    numeroGuia: 'G-001',
    fechaInicio: new Date('2026-01-01'),
    direccionSuministro: 'Av. 1',
    estadoServicio: 'ACTIVO',
    estadoCobranza: 'AL_DIA',
    comunidadId: 1,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContratoMedidorController],
      providers: [
        {
          provide: ContratoMedidorService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ContratoMedidorController>(
      ContratoMedidorController,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('crear should return ContractResponseDto', async () => {
    mockService.crearContrato.mockResolvedValue(sampleContract);

    const result = await controller.crear(
      {
        clienteId: '10',
        categoriaTarifaId: '1',
        medidorId: '100',
        direccionSuministro: 'Av. 1',
        comunidadId: '1',
      },
      { rol: 'ADMIN' } as any,
    );

    expect(result.contratoId).toBe(1n);
    expect(result.numeroGuia).toBe('G-001');
  });

  it('buscarContratos should return paginated ContractResponseDto', async () => {
    mockService.buscarContratos.mockResolvedValue({
      data: [sampleContract],
      meta: { total: 1, page: 1, limit: 10 },
    });

    const result = await controller.buscarContratos({ page: 1, limit: 10 });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].contratoId).toBe(1n);
  });

  it('getServiceArea should return ServiceAreaResponseDto', () => {
    mockService.getServiceArea.mockReturnValue({
      nombre: 'Parroquia Manglaralto',
      fuente: 'OpenStreetMap (relation 278708), ODbL',
      geometria: {
        type: 'Polygon',
        coordinates: [
          [
            [-80.8, -1.7],
            [-80.7, -1.7],
            [-80.7, -1.8],
            [-80.8, -1.7],
          ],
        ],
      },
    });

    const result = controller.getServiceArea();

    expect(result).toBeInstanceOf(ServiceAreaResponseDto);
    expect(result.nombre).toBe('Parroquia Manglaralto');
    expect(result.geometria.type).toBe('Polygon');
    expect(result.geometria.coordinates[0]).toHaveLength(4);
  });

  it('declares service-area before the :id route so it is not captured as an id', () => {
    const routes = Object.getOwnPropertyNames(
      ContratoMedidorController.prototype,
    )
      .map((name) =>
        Reflect.getMetadata(
          'path',
          ContratoMedidorController.prototype[
            name as keyof ContratoMedidorController
          ],
        ),
      )
      .filter((path) => path !== undefined);

    expect(routes.indexOf('service-area')).toBeGreaterThanOrEqual(0);
    expect(routes.indexOf('service-area')).toBeLessThan(routes.indexOf(':id'));
  });

  it('buscarContrato should return ContractResponseDto', async () => {
    mockService.buscarContrato.mockResolvedValue(sampleContract);

    const result = await controller.buscarContrato(1n);

    expect(result.contratoId).toBe(1n);
  });

  it('actualizarContrato should return ContractResponseDto', async () => {
    mockService.actualizar.mockResolvedValue(sampleContract);

    const result = await controller.actualizarContrato(1n, {
      estadoServicio: 'ACTIVO',
    });

    expect(result.contratoId).toBe(1n);
  });

  it('finalizarVinculo should return ContractResponseDto', async () => {
    mockService.finalizarVinculo.mockResolvedValue(sampleContract);

    const result = await controller.finalizarVinculo(1n);

    expect(result.contratoId).toBe(1n);
  });

  it('eliminarContrato should return ContractResponseDto', async () => {
    mockService.eliminar.mockResolvedValue(sampleContract);

    const result = await controller.eliminarContrato(1n);

    expect(result.contratoId).toBe(1n);
  });
});
