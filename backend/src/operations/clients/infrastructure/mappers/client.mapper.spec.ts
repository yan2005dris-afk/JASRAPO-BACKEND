import { ClientMapper } from './client.mapper';
import { ClientEntity } from '../../domain/entities/client.entity';

describe('ClientMapper', () => {
  describe('toDomain', () => {
    it('should return null when raw is null', () => {
      expect(ClientMapper.toDomain(null)).toBeNull();
    });

    it('should return null when raw is undefined', () => {
      expect(ClientMapper.toDomain(undefined)).toBeNull();
    });

    it('should map a complete Prisma record to ClientEntity', () => {
      const raw = {
        clienteId: BigInt(1),
        identificacion: '0926715658',
        nombres: 'JUAN',
        apellidos: 'PEREZ',
        razonSocial: null,
        email: 'juan@example.com',
        telefono: '0999999999',
        telefonoSecundario: null,
        direccionDomicilio: 'Av. Siempre Viva 123',
        activo: true,
        aplicaDiscapacidad: false,
        aplicaTerceraEdad: false,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-02'),
        deletedAt: null,
        tipoIdentificacion: {
          id: 1,
          codigo: '05',
          descripcion: 'CÉDULA',
        },
      };

      const result = ClientMapper.toDomain(raw);

      expect(result).toBeInstanceOf(ClientEntity);
      expect(result!.clienteId).toEqual(BigInt(1));
      expect(result!.identificacion).toBe('0926715658');
      expect(result!.nombres).toBe('JUAN');
      expect(result!.apellidos).toBe('PEREZ');
      expect(result!.razonSocial).toBeNull();
      expect(result!.email).toBe('juan@example.com');
      expect(result!.telefono).toBe('0999999999');
      expect(result!.telefonoSecundario).toBeNull();
      expect(result!.direccionDomicilio).toBe('Av. Siempre Viva 123');
      expect(result!.activo).toBe(true);
      expect(result!.aplicaDiscapacidad).toBe(false);
      expect(result!.aplicaTerceraEdad).toBe(false);
      expect(result!.tipoIdentificacion).toEqual({
        id: 1,
        codigo: '05',
        descripcion: 'CÉDULA',
      });
    });

    it('should map tipoIdentificacion as null when relation is absent', () => {
      const raw = {
        clienteId: BigInt(2),
        identificacion: '0999999999001',
        nombres: 'MARIA',
        apellidos: 'LOPEZ',
        razonSocial: null,
        email: null,
        telefono: null,
        telefonoSecundario: null,
        direccionDomicilio: null,
        activo: true,
        aplicaDiscapacidad: false,
        aplicaTerceraEdad: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        tipoIdentificacion: null,
      };

      const result = ClientMapper.toDomain(raw);

      expect(result).toBeInstanceOf(ClientEntity);
      expect(result!.tipoIdentificacion).toBeNull();
    });

    it('should map deletedAt when present', () => {
      const deletedDate = new Date('2026-03-15');
      const raw = {
        clienteId: BigInt(3),
        identificacion: '1234567890',
        nombres: 'Test',
        apellidos: 'User',
        razonSocial: null,
        email: null,
        telefono: null,
        telefonoSecundario: null,
        direccionDomicilio: null,
        activo: false,
        aplicaDiscapacidad: false,
        aplicaTerceraEdad: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: deletedDate,
        tipoIdentificacion: { id: 2, codigo: '04', descripcion: 'RUC' },
      };

      const result = ClientMapper.toDomain(raw);

      expect(result).toBeInstanceOf(ClientEntity);
      expect(result!.deletedAt).toEqual(deletedDate);
    });
  });

  describe('toDomainList', () => {
    it('should return empty array when input is empty', () => {
      expect(ClientMapper.toDomainList([])).toEqual([]);
    });

    it('should filter out null entries', () => {
      const raw = {
        clienteId: BigInt(1),
        identificacion: '0926715658',
        nombres: 'JUAN',
        apellidos: 'PEREZ',
        razonSocial: null,
        email: null,
        telefono: null,
        telefonoSecundario: null,
        direccionDomicilio: null,
        activo: true,
        aplicaDiscapacidad: false,
        aplicaTerceraEdad: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        tipoIdentificacion: { id: 1, codigo: '05', descripcion: 'CÉDULA' },
      };

      const result = ClientMapper.toDomainList([raw, null, undefined]);

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(ClientEntity);
      expect(result[0].clienteId).toEqual(BigInt(1));
    });

    it('should map multiple records', () => {
      const raw1 = {
        clienteId: BigInt(1),
        identificacion: '111',
        nombres: 'A',
        apellidos: 'B',
        razonSocial: null,
        email: null,
        telefono: null,
        telefonoSecundario: null,
        direccionDomicilio: null,
        activo: true,
        aplicaDiscapacidad: false,
        aplicaTerceraEdad: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        tipoIdentificacion: { id: 1, codigo: '05', descripcion: 'CÉDULA' },
      };
      const raw2 = {
        clienteId: BigInt(2),
        identificacion: '222',
        nombres: 'C',
        apellidos: 'D',
        razonSocial: null,
        email: null,
        telefono: null,
        telefonoSecundario: null,
        direccionDomicilio: null,
        activo: false,
        aplicaDiscapacidad: false,
        aplicaTerceraEdad: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        tipoIdentificacion: { id: 2, codigo: '04', descripcion: 'RUC' },
      };

      const result = ClientMapper.toDomainList([raw1, raw2]);

      expect(result).toHaveLength(2);
      expect(result[0].clienteId).toEqual(BigInt(1));
      expect(result[1].clienteId).toEqual(BigInt(2));
    });
  });
});
