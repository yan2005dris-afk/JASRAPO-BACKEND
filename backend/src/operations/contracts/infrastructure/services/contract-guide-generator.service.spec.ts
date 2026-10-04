import { ContractGuideGeneratorService } from './contract-guide-generator.service';
import { InvalidDomainOperationException } from 'src/shared/domain/exceptions/domain.exception';
import type { Prisma } from 'src/generated/prisma/client';

describe('ContractGuideGeneratorService', () => {
  let service: ContractGuideGeneratorService;

  type TransactionMock = {
    comunidades: { findUnique: jest.Mock };
    $queryRaw: jest.Mock;
    secuenciaContrato: { update: jest.Mock };
    contratos: { findUnique: jest.Mock };
  };

  beforeEach(() => {
    service = new ContractGuideGeneratorService();
  });

  function createTransactionMock(
    ultimoValor = 0n,
  ): Prisma.TransactionClient & TransactionMock {
    return {
      comunidades: {
        findUnique: jest.fn().mockResolvedValue({ codigo: 'oló-n' }),
      },
      $queryRaw: jest
        .fn()
        .mockResolvedValue([
          { secuencia_contrato_id: 1, longitud: 5, ultimo_valor: ultimoValor },
        ]),
      secuenciaContrato: {
        update: jest.fn().mockResolvedValue({}),
      },
      contratos: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
    } as unknown as Prisma.TransactionClient & TransactionMock;
  }

  it('combines the normalized community, physical serial and padded sequence', async () => {
    const tx = createTransactionMock();

    await expect(
      service.generate(tx, {
        comunidadId: 1,
        serieMedidor: 'ITR-984321',
      }),
    ).resolves.toBe('ITR-984321-OLO-N-00001');

    expect(tx.secuenciaContrato.update).toHaveBeenCalledWith({
      where: { secuenciaContratoId: 1 },
      data: { ultimoValor: 1n },
    });
    expect(tx.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it('skips a guide that already exists in historical contract data', async () => {
    const tx = createTransactionMock();
    tx.contratos.findUnique
      .mockResolvedValueOnce({ contratoId: 2n })
      .mockResolvedValueOnce(null);

    await expect(
      service.generate(tx, { comunidadId: 1, serieMedidor: 'ITR-984321' }),
    ).resolves.toBe('ITR-984321-OLO-N-00002');

    expect(tx.secuenciaContrato.update).toHaveBeenCalledWith({
      where: { secuenciaContratoId: 1 },
      data: { ultimoValor: 2n },
    });
  });

  it('rejects a serial that has no alphanumeric characters', async () => {
    const tx = createTransactionMock();

    await expect(
      service.generate(tx, { comunidadId: 1, serieMedidor: '---' }),
    ).rejects.toBeInstanceOf(InvalidDomainOperationException);

    expect(tx.$queryRaw).not.toHaveBeenCalled();
  });

  it('uses the sequence length migrated from the meter counter', async () => {
    const tx = createTransactionMock(99n);
    tx.$queryRaw.mockResolvedValue([
      { secuencia_contrato_id: 1, longitud: 6, ultimo_valor: 99n },
    ]);

    await expect(
      service.generate(tx, { comunidadId: 1, serieMedidor: 'EL-44021' }),
    ).resolves.toBe('EL-44021-OLO-N-000100');
  });

  it('fails clearly when the sequence row is missing', async () => {
    const tx = createTransactionMock();
    tx.$queryRaw.mockResolvedValue([]);

    await expect(
      service.generate(tx, { comunidadId: 1, serieMedidor: 'SN84920' }),
    ).rejects.toBeInstanceOf(InvalidDomainOperationException);
  });
});
