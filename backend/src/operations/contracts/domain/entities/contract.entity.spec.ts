import { ContractEntity } from './contract.entity';

describe('ContractEntity', () => {
  it('should create a valid ContractEntity instance', () => {
    const contract = ContractEntity.create({
      contratoId: BigInt(1),
      clienteId: BigInt(10),
      numeroGuia: 'GUIA-001',
      direccionSuministro: 'Av. Principal 123',
      estado: 'SOLICITUD',
    });

    expect(contract).toBeInstanceOf(ContractEntity);
    expect(contract.numeroGuia).toBe('GUIA-001');
  });

  it('should throw error when numeroGuia or direccionSuministro is empty', () => {
    expect(() => {
      new ContractEntity({
        numeroGuia: '   ',
        direccionSuministro: 'Dirección',
        estado: 'ACTIVO',
      });
    }).toThrow('El número de guía no puede estar vacío');

    expect(() => {
      new ContractEntity({
        numeroGuia: 'GUIA-001',
        direccionSuministro: '',
        estado: 'ACTIVO',
      });
    }).toThrow('La dirección de suministro no puede estar vacía');
  });

  it('should validate state transitions correctly', () => {
    const contract = new ContractEntity({
      contratoId: BigInt(1),
      estado: 'SOLICITUD',
    });

    expect(contract.canTransitionTo('PENDIENTE_PAGO')).toBe(true);
    expect(contract.canTransitionTo('ACTIVO')).toBe(true);

    contract.cambiarEstado('ACTIVO');
    expect(contract.estado).toBe('ACTIVO');
    expect(contract.esActivo()).toBe(true);

    expect(contract.canTransitionTo('EN_MORA')).toBe(true);

    expect(() => {
      contract.cambiarEstado('ESTADO_INVALIDO');
    }).toThrow('Transición de estado inválida de ACTIVO a ESTADO_INVALIDO');
  });

  it('should check contract validity', () => {
    const contract = new ContractEntity({
      contratoId: BigInt(1),
      estado: 'ACTIVO',
      deletedAt: null,
    });

    expect(contract.esValido()).toBe(true);

    const deletedContract = new ContractEntity({
      contratoId: BigInt(2),
      estado: 'ACTIVO',
      deletedAt: new Date(),
    });

    expect(deletedContract.esValido()).toBe(false);
  });
});
