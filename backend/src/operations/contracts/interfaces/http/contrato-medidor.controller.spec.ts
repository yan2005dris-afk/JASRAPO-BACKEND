jest.mock('puppeteer', () => ({}));

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ContratoMedidorController } from './contrato-medidor.controller';
import { ContratoMedidorService } from '../../application/contrato-medidor.service';
import { ContractEntity } from '../../domain/entities/contract.entity';

describe('ContratoMedidorController', () => {
  let controller: ContratoMedidorController;

  const mockService = {
    getContractStatesCatalog: jest.fn(),
    crearContrato: jest.fn(),
    buscarContratos: jest.fn(),
    buscarContrato: jest.fn(),
    actualizar: jest.fn(),
    finalizarVinculo: jest.fn(),
    eliminar: jest.fn(),
    generateConnectionRequestPdf: jest.fn(),
    generateResponsibilityAgreementPdf: jest.fn(),
  };

  const sampleContract = new ContractEntity({
    contratoId: 1n,
    clienteId: 10n,
    categoriaTarifaId: 1,
    numeroGuia: 'G-001',
    fechaInicio: new Date('2026-01-01'),
    direccionSuministro: 'Av. 1',
    estado: 'ACTIVO',
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

  it('getContractStates should return state catalog', () => {
    mockService.getContractStatesCatalog.mockReturnValue([
      { value: 'ACTIVO', label: 'Activo' },
    ]);

    const result = controller.getContractStates();

    expect(result).toHaveLength(1);
    expect(result[0].value).toBe('ACTIVO');
  });

  it('crear should return ContractResponseDto', async () => {
    mockService.crearContrato.mockResolvedValue(sampleContract);

    const result = await controller.crear({
      clienteId: '10',
      categoriaTarifaId: 1,
      medidorId: '100',
      numeroGuia: 'G-001',
      direccionSuministro: 'Av. 1',
      comunidadId: 1,
    });

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

  it('buscarContrato should return ContractResponseDto', async () => {
    mockService.buscarContrato.mockResolvedValue(sampleContract);

    const result = await controller.buscarContrato(1n);

    expect(result.contratoId).toBe(1n);
  });

  it('actualizarContrato should return ContractResponseDto', async () => {
    mockService.actualizar.mockResolvedValue(sampleContract);

    const result = await controller.actualizarContrato(1n, { estado: 'ACTIVO' });

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
