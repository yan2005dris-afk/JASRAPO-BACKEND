import { BadRequestException } from '@nestjs/common';
import { SearchDeudaPublicaUseCase } from './search-deuda-publica.use-case';
import type { IContratoConDeudaRaw, IPrefacturaParaCalculo } from '../../domain/types/debt-search.types';

describe('SearchDeudaPublicaUseCase', () => {
  const makeContrato = (override: {
    contratoId?: bigint;
    numeroGuia?: string;
    estado?: string;
    clienteId?: bigint;
    nombres?: string | null;
    apellidos?: string | null;
    identificacion?: string | null;
    prefacturasImpagadas?: IPrefacturaParaCalculo[];
  } = {}): IContratoConDeudaRaw => ({
    contratoId: override.contratoId ?? 1n,
    numeroGuia: override.numeroGuia ?? 'G-001',
    estado: override.estado ?? 'ACTIVO',
    cliente: {
      clienteId: override.clienteId ?? 1n,
      identificacion: override.identificacion !== undefined ? override.identificacion : '0912345678',
      nombres: override.nombres !== undefined ? override.nombres : 'Juan',
      apellidos: override.apellidos !== undefined ? override.apellidos : 'Pérez',
    },
    prefacturasImpagadas: override.prefacturasImpagadas ?? [
      { totalPagar: 100, abono: 0, periodoId: 202601 },
    ],
  });

  const createMockRepo = (contratos: IContratoConDeudaRaw[] = [], total = 0) => ({
    findManyClientes: jest.fn(),
    countClientes: jest.fn(),
    findManyContratos: jest.fn(),
    countContratos: jest.fn(),
    findContratosDeudaBy: jest.fn().mockResolvedValue(contratos),
    countContratosDeuda: jest.fn().mockResolvedValue(total),
  });

  describe('agruparPorCliente', () => {
    it('should group multiple contracts from the same client into one entry', async () => {
      const contratos = [
        makeContrato({ contratoId: 1n, numeroGuia: 'G-001' }),
        makeContrato({ contratoId: 2n, numeroGuia: 'G-002' }),
      ];
      const useCase = new SearchDeudaPublicaUseCase(createMockRepo(contratos, 2) as any);

      const result = await useCase.execute('identificacion', '0912345678');

      expect(result.data).toHaveLength(1);
      expect(result.data[0].contratos).toHaveLength(2);
    });

    it('should produce separate entries for different clients', async () => {
      const contratos = [
        makeContrato({ clienteId: 1n, contratoId: 1n, numeroGuia: 'G-001' }),
        makeContrato({ clienteId: 2n, contratoId: 2n, numeroGuia: 'G-002' }),
      ];
      const useCase = new SearchDeudaPublicaUseCase(createMockRepo(contratos, 2) as any);

      const result = await useCase.execute('nombre', 'juan');

      expect(result.data).toHaveLength(2);
      expect(result.data[0].contratos).toHaveLength(1);
      expect(result.data[1].contratos).toHaveLength(1);
    });

    it('should compute saldoVencido, deudaAnterior and mesesAtrasado for each contract', async () => {
      const prefacturas: IPrefacturaParaCalculo[] = [
        { totalPagar: 100, abono: 25, periodoId: 202601 },
        { totalPagar: 80, abono: 0, periodoId: 202602 },
      ];
      const contratos = [makeContrato({ prefacturasImpagadas: prefacturas })];
      const useCase = new SearchDeudaPublicaUseCase(createMockRepo(contratos, 1) as any);

      const result = await useCase.execute('identificacion', '0912345678');
      const contrato = result.data[0].contratos[0];

      expect(contrato.saldoVencido).toBe(155);    // (100-25) + (80-0)
      expect(contrato.deudaAnterior).toBe(75);    // saldo de 202601 (max-1)
      expect(contrato.mesesAtrasado).toBe(2);
    });

    it('should return Sin nombre when both nombres and apellidos are null', async () => {
      const contratos = [makeContrato({ nombres: null, apellidos: null })];
      const useCase = new SearchDeudaPublicaUseCase(createMockRepo(contratos, 1) as any);

      const result = await useCase.execute('identificacion', '0912345678');

      expect(result.data[0].cliente.nombre).toBe('Sin nombre');
    });
  });

  describe('validation', () => {
    it('should throw BadRequestException when valor is blank', async () => {
      const useCase = new SearchDeudaPublicaUseCase(createMockRepo() as any);

      await expect(useCase.execute('identificacion', '   ')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('pagination', () => {
    it('should cap limit to 50 and enforce page minimum of 1', async () => {
      const useCase = new SearchDeudaPublicaUseCase(createMockRepo([], 0) as any);

      const result = await useCase.execute('nombre', 'test', 0, 100);

      expect(result.meta.limit).toBe(50);
      expect(result.meta.page).toBe(1);
    });
  });
});
