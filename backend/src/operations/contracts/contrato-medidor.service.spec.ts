import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ContratoMedidorService } from './contrato-medidor.service';
import { CreateContractLinkUseCase } from './use-cases/create-contract-link.use-case';
import { FindAllContractsUseCase } from './use-cases/find-all-contracts.use-case';
import { FindOneContractUseCase } from './use-cases/find-one-contract.use-case';
import { UpdateContractUseCase } from './use-cases/update-contract.use-case';
import { RemoveContractUseCase } from './use-cases/remove-contract.use-case';
import { FinalizeMeterLinkUseCase } from './use-cases/finalize-meter-link.use-case';

describe('ContratoMedidorService', () => {
  let service: ContratoMedidorService;

  const mockCreateLinkUseCase = { execute: jest.fn() };
  const mockFindAllUseCase = { execute: jest.fn() };
  const mockFindOneUseCase = { execute: jest.fn() };
  const mockUpdateUseCase = { execute: jest.fn() };
  const mockRemoveUseCase = { execute: jest.fn() };
  const mockFinalizeLinkUseCase = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContratoMedidorService,
        { provide: CreateContractLinkUseCase, useValue: mockCreateLinkUseCase },
        { provide: FindAllContractsUseCase, useValue: mockFindAllUseCase },
        { provide: FindOneContractUseCase, useValue: mockFindOneUseCase },
        { provide: UpdateContractUseCase, useValue: mockUpdateUseCase },
        { provide: RemoveContractUseCase, useValue: mockRemoveUseCase },
        {
          provide: FinalizeMeterLinkUseCase,
          useValue: mockFinalizeLinkUseCase,
        },
      ],
    }).compile();

    service = module.get<ContratoMedidorService>(ContratoMedidorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('crearContrato', () => {
    it('should delegate to CreateContractLinkUseCase', async () => {
      const dto = { contratoId: '1', medidorId: '1' };
      mockCreateLinkUseCase.execute.mockResolvedValue({ id: 1 });

      const result = await service.crearContrato(dto);

      expect(result).toEqual({ id: 1 });
      expect(mockCreateLinkUseCase.execute).toHaveBeenCalledWith(dto);
    });
  });

  describe('buscarContratos', () => {
    it('should delegate to FindAllContractsUseCase', async () => {
      const params = { skip: 0, take: 10 };
      mockFindAllUseCase.execute.mockResolvedValue([]);

      const result = await service.buscarContratos(params);

      expect(result).toEqual([]);
      expect(mockFindAllUseCase.execute).toHaveBeenCalledWith(params);
    });
  });

  describe('buscarContrato', () => {
    it('should delegate to FindOneContractUseCase', async () => {
      const id = BigInt(1);
      mockFindOneUseCase.execute.mockResolvedValue({ id: 1 });

      const result = await service.buscarContrato(id);

      expect(result).toEqual({ id: 1 });
      expect(mockFindOneUseCase.execute).toHaveBeenCalledWith(id);
    });
  });

  describe('actualizar', () => {
    it('should delegate to UpdateContractUseCase', async () => {
      const id = BigInt(1);
      const dto = { numeroGuia: 'NEW-GUIA' };
      mockUpdateUseCase.execute.mockResolvedValue({ id: 1 });

      const result = await service.actualizar(id, dto);

      expect(result).toEqual({ id: 1 });
      expect(mockUpdateUseCase.execute).toHaveBeenCalledWith(id, dto);
    });
  });

  describe('finalizarVinculo', () => {
    it('should delegate to FinalizeMeterLinkUseCase', async () => {
      const id = BigInt(1);
      mockFinalizeLinkUseCase.execute.mockResolvedValue({ id: 1 });

      const result = await service.finalizarVinculo(id);

      expect(result).toEqual({ id: 1 });
      expect(mockFinalizeLinkUseCase.execute).toHaveBeenCalledWith(id);
    });
  });

  describe('eliminar', () => {
    it('should delegate to RemoveContractUseCase', async () => {
      const id = BigInt(1);
      mockRemoveUseCase.execute.mockResolvedValue({ message: 'Deleted' });

      const result = await service.eliminar(id);

      expect(result).toEqual({ message: 'Deleted' });
      expect(mockRemoveUseCase.execute).toHaveBeenCalledWith(id);
    });
  });
});
