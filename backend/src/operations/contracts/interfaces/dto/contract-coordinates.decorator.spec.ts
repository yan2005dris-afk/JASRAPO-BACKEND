import { validate, type ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CrearContratoMedidorDto } from './create-contrato-medidor.dto';
import { ActualizarContratoMedidorDto } from './update-contrato-medidor.dto';

const coordinateProperties = ['latitud', 'longitud'];

const coordinateErrors = (errors: ValidationError[]) =>
  errors.filter((error) => coordinateProperties.includes(error.property));

describe('Contract coordinates validation', () => {
  describe('ActualizarContratoMedidorDto', () => {
    it.each([
      ['both omitted', {}],
      ['both null', { latitud: null, longitud: null }],
      ['both set', { latitud: -1.8021, longitud: -80.7554 }],
    ])('accepts %s', async (_label, payload) => {
      const dto = plainToInstance(ActualizarContratoMedidorDto, payload);
      const errors = await validate(dto);
      expect(coordinateErrors(errors)).toHaveLength(0);
    });

    it.each([
      ['latitud only', { latitud: -1.8021 }],
      ['longitud only', { longitud: -80.7554 }],
      ['latitud null, longitud set', { latitud: null, longitud: -80.7554 }],
      ['latitud set, longitud null', { latitud: -1.8021, longitud: null }],
      ['latitud null, longitud omitted', { latitud: null }],
      ['latitud omitted, longitud null', { longitud: null }],
    ])('rejects %s', async (_label, payload) => {
      const dto = plainToInstance(ActualizarContratoMedidorDto, payload);
      const errors = await validate(dto);
      expect(coordinateErrors(errors).length).toBeGreaterThan(0);
    });

    it('rejects an out-of-range latitude', async () => {
      const dto = plainToInstance(ActualizarContratoMedidorDto, {
        latitud: 91,
        longitud: -80.7554,
      });
      const errors = await validate(dto);
      expect(errors.some((error) => error.property === 'latitud')).toBe(true);
    });

    it('rejects an out-of-range longitude', async () => {
      const dto = plainToInstance(ActualizarContratoMedidorDto, {
        latitud: -1.8021,
        longitud: -181,
      });
      const errors = await validate(dto);
      expect(errors.some((error) => error.property === 'longitud')).toBe(true);
    });

    it('coerces a numeric string to a number', () => {
      const dto = plainToInstance(ActualizarContratoMedidorDto, {
        latitud: '-1.5',
        longitud: '-80.5',
      });
      expect(dto.latitud).toBe(-1.5);
      expect(dto.longitud).toBe(-80.5);
    });
  });

  describe('CrearContratoMedidorDto', () => {
    const baseCreatePayload = {
      clienteId: '1',
      categoriaTarifaId: '2',
      medidorId: '100',
      direccionSuministro: 'Av. Principal 123',
      comunidadId: '1',
    };

    it('accepts coordinates omitted', async () => {
      const dto = plainToInstance(CrearContratoMedidorDto, baseCreatePayload);
      const errors = await validate(dto);
      expect(coordinateErrors(errors)).toHaveLength(0);
    });

    it('accepts a valid coordinate pair', async () => {
      const dto = plainToInstance(CrearContratoMedidorDto, {
        ...baseCreatePayload,
        latitud: -1.8021,
        longitud: -80.7554,
      });
      const errors = await validate(dto);
      expect(coordinateErrors(errors)).toHaveLength(0);
    });

    it('rejects a partial coordinate pair', async () => {
      const dto = plainToInstance(CrearContratoMedidorDto, {
        ...baseCreatePayload,
        latitud: -1.8021,
      });
      const errors = await validate(dto);
      expect(coordinateErrors(errors).length).toBeGreaterThan(0);
    });
  });
});
