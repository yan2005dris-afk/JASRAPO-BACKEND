import { BadRequestException } from '@nestjs/common';
import { SearchDeudaPublicaUseCase } from './search-deuda-publica.use-case';
import type {
  IClienteConContratosRaw,
  IContratoConDeudaRaw,
  IPrefacturaParaCalculo,
} from '../../domain/types/debt-search.types';

const makeCliente = (
  override: Partial<IClienteConContratosRaw> = {},
): IClienteConContratosRaw => ({
  clienteId: 1n,
  identificacion: '0912345678',
  nombres: 'Juan',
  apellidos: 'Pérez',
  contratos: [],
  ...override,
});

const makeContratoRaw = (
  override: Partial<IContratoConDeudaRaw> = {},
): IContratoConDeudaRaw => ({
  contratoId: 1n,
  numeroGuia: 'G-001',
  estado: 'ACTIVO',
  cliente: {
    clienteId: 1n,
    identificacion: '0912345678',
    nombres: 'Juan',
    apellidos: 'Pérez',
  },
  prefacturasImpagadas: [{ totalPagar: 100, abono: 0, periodoId: 202601 }],
  ...override,
});

const createMockRepo = (
  clientes: IClienteConContratosRaw[] = [],
  contratosDeuda: IContratoConDeudaRaw[] = [],
  total = 0,
) => ({
  findClientesBy: jest.fn().mockResolvedValue(clientes),
  countClientesBy: jest.fn().mockResolvedValue(clientes.length || total),
  findContratosDeudaBy: jest.fn().mockResolvedValue(contratosDeuda),
  countContratosDeuda: jest.fn().mockResolvedValue(contratosDeuda.length || total),
});

describe('SearchDeudaPublicaUseCase', () => {
  describe('identificacion / nombre path (client-first)', () => {
    it('returns client with no contracts when client has none', async () => {
      const useCase = new SearchDeudaPublicaUseCase(
        createMockRepo([makeCliente()]),
      );

      const result = await useCase.execute('identificacion', '0912345678');

      expect(result.data).toHaveLength(1);
      expect(result.data[0].contratos).toHaveLength(0);
    });

    it('returns separate entries for different clients', async () => {
      const clientes = [
        makeCliente({ clienteId: 1n }),
        makeCliente({ clienteId: 2n, identificacion: '0999999999' }),
      ];
      const useCase = new SearchDeudaPublicaUseCase(createMockRepo(clientes));

      const result = await useCase.execute('nombre', 'juan');

      expect(result.data).toHaveLength(2);
    });

    it('computes debt values from prefacturas inside contratos', async () => {
      const prefacturas: IPrefacturaParaCalculo[] = [
        { totalPagar: 100, abono: 25, periodoId: 202601 },
        { totalPagar: 80, abono: 0, periodoId: 202602 },
      ];
      const cliente = makeCliente({
        contratos: [
          {
            contratoId: 1n,
            numeroGuia: 'G-001',
            estado: 'ACTIVO',
            prefacturasImpagadas: prefacturas,
          },
        ],
      });
      const useCase = new SearchDeudaPublicaUseCase(createMockRepo([cliente]));

      const result = await useCase.execute('identificacion', '0912345678');
      const contrato = result.data[0].contratos[0];

      expect(contrato.saldoVencido).toBe(155);
      expect(contrato.deudaAnterior).toBe(75);
      expect(contrato.mesesAtrasado).toBe(2);
    });

    it('returns Sin nombre when nombres and apellidos are null', async () => {
      const useCase = new SearchDeudaPublicaUseCase(
        createMockRepo([makeCliente({ nombres: null, apellidos: null })]),
      );

      const result = await useCase.execute('identificacion', '0912345678');

      expect(result.data[0].cliente.nombre).toBe('Sin nombre');
    });
  });

  describe('numeroGuia path (contract-first)', () => {
    it('groups multiple contracts from the same client into one entry', async () => {
      const contratos = [
        makeContratoRaw({ contratoId: 1n, numeroGuia: 'G-001' }),
        makeContratoRaw({ contratoId: 2n, numeroGuia: 'G-002' }),
      ];
      const useCase = new SearchDeudaPublicaUseCase(
        createMockRepo([], contratos, 2),
      );

      const result = await useCase.execute('numeroGuia', 'G-00');

      expect(result.data).toHaveLength(1);
      expect(result.data[0].contratos).toHaveLength(2);
    });
  });

  describe('validation', () => {
    it('throws BadRequestException when valor is blank', async () => {
      const useCase = new SearchDeudaPublicaUseCase(createMockRepo());

      await expect(useCase.execute('identificacion', '   ')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('pagination', () => {
    it('caps limit to 50 and enforces page minimum of 1', async () => {
      const useCase = new SearchDeudaPublicaUseCase(createMockRepo([], [], 0));

      const result = await useCase.execute('nombre', 'test', 0, 100);

      expect(result.meta.limit).toBe(50);
      expect(result.meta.page).toBe(1);
    });
  });
});
