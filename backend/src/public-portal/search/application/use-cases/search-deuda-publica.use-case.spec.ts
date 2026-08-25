import {
  DomainValidationException,
  EntityNotFoundException,
} from 'src/shared/domain/exceptions/domain.exception';
import { SearchDeudaPublicaUseCase } from './search-deuda-publica.use-case';
import type {
  IClienteConContratosRaw,
  IContratoConDeudaRaw,
  IPrefacturaParaCalculo,
} from '../../domain/types/debt-search.types';

import type { BusquedaPublicaRepository } from '../../domain/repositories/busqueda-publica.repository';

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
): jest.Mocked<BusquedaPublicaRepository> => ({
  findClientesBy: jest.fn().mockResolvedValue(clientes),
  countClientesBy: jest.fn().mockResolvedValue(clientes.length),
  findContratosDeudaBy: jest.fn().mockResolvedValue(contratosDeuda),
  countContratosDeuda: jest.fn().mockResolvedValue(contratosDeuda.length),
});

describe('SearchDeudaPublicaUseCase', () => {
  describe('routing — which repo method is called per tipo', () => {
    it('identificacion uses findClientesBy and skips findContratosDeudaBy', async () => {
      const repo = createMockRepo([makeCliente()]);
      const useCase = new SearchDeudaPublicaUseCase(repo);

      await useCase.execute('identificacion', '0912345678');

      expect(repo.findClientesBy).toHaveBeenCalledWith(
        'identificacion',
        '0912345678',
        0,
        50,
      );
      expect(repo.findContratosDeudaBy).not.toHaveBeenCalled();
    });

    it('numeroGuia uses findContratosDeudaBy and skips findClientesBy', async () => {
      const repo = createMockRepo([], [makeContratoRaw()]);
      const useCase = new SearchDeudaPublicaUseCase(repo);

      await useCase.execute('numeroGuia', 'G-001');

      expect(repo.findContratosDeudaBy).toHaveBeenCalledWith(
        'numeroGuia',
        'G-001',
        0,
        50,
      );
      expect(repo.findClientesBy).not.toHaveBeenCalled();
    });
  });

  describe('identificacion path (client-first)', () => {
    it('returns client with no contracts and zero totalDeuda when client has no contracts', async () => {
      const useCase = new SearchDeudaPublicaUseCase(
        createMockRepo([makeCliente()]),
      );

      const result = await useCase.execute('identificacion', '0912345678');

      expect(result.cliente.nombre).toBe('Juan Pérez');
      expect(result.cliente.identificacion).toBe('0912345678');
      expect(result.contratos).toHaveLength(0);
      expect(result.totalDeuda).toBe(0);
    });

    it('computes debt values and totalDeuda from prefacturas inside contratos', async () => {
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
      const contrato = result.contratos[0];

      expect(contrato.saldoVencido).toBe(155);
      expect(contrato.deudaAnterior).toBe(75);
      expect(contrato.mesesAtrasado).toBe(2);
      expect(result.totalDeuda).toBe(155);
    });

    it('returns Sin nombre when nombres and apellidos are null', async () => {
      const useCase = new SearchDeudaPublicaUseCase(
        createMockRepo([makeCliente({ nombres: null, apellidos: null })]),
      );

      const result = await useCase.execute('identificacion', '0912345678');

      expect(result.cliente.nombre).toBe('Sin nombre');
    });
  });

  describe('numeroGuia path (contract-first)', () => {
    it('groups multiple contracts from the same client into one entry and sums totalDeuda', async () => {
      const contratos = [
        makeContratoRaw({ contratoId: 1n, numeroGuia: 'G-001' }),
        makeContratoRaw({ contratoId: 2n, numeroGuia: 'G-002' }),
      ];
      const useCase = new SearchDeudaPublicaUseCase(
        createMockRepo([], contratos),
      );

      const result = await useCase.execute('numeroGuia', 'G-00');

      expect(result.cliente.nombre).toBe('Juan Pérez');
      expect(result.contratos).toHaveLength(2);
      expect(result.totalDeuda).toBe(200);
    });
  });

  describe('not found / validation', () => {
    it('throws EntityNotFoundException when no client or contract is found', async () => {
      const useCase = new SearchDeudaPublicaUseCase(createMockRepo([], []));

      await expect(
        useCase.execute('identificacion', '0000000000'),
      ).rejects.toThrow(EntityNotFoundException);
    });

    it('throws DomainValidationException when valor is blank', async () => {
      const useCase = new SearchDeudaPublicaUseCase(createMockRepo());

      await expect(useCase.execute('identificacion', '   ')).rejects.toThrow(
        DomainValidationException,
      );
    });
  });
});
