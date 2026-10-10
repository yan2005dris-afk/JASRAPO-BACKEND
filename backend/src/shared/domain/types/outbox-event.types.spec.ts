import {
  parseRequiredBigInt,
  parsePagoValidadoPayload,
  parseCuotaPagadaPayload,
  parsePagoAnuladoPayload,
  OUTBOX_EVENTO_TIPO,
} from './outbox-event.types';

describe('outbox-event.types', () => {
  describe('OUTBOX_EVENTO_TIPO', () => {
    it('defines canonical string constants', () => {
      expect(OUTBOX_EVENTO_TIPO.PAGO_VALIDADO).toBe('pago.validado');
      expect(OUTBOX_EVENTO_TIPO.CUOTA_PAGADA).toBe('cuota.pagada');
      expect(OUTBOX_EVENTO_TIPO.PAGO_ANULADO).toBe('pago.anulado');
    });
  });

  describe('parseRequiredBigInt', () => {
    it('parses valid bigint, number, and numeric string', () => {
      expect(parseRequiredBigInt(10n, 'testId')).toBe(10n);
      expect(parseRequiredBigInt(123, 'testId')).toBe(123n);
      expect(parseRequiredBigInt('456', 'testId')).toBe(456n);
      expect(parseRequiredBigInt(' 789 ', 'testId')).toBe(789n);
    });

    it('throws error when value is null, undefined or empty string', () => {
      expect(() => parseRequiredBigInt(undefined, 'testId')).toThrow(
        /campo requerido 'testId' está ausente/,
      );

      expect(() => parseRequiredBigInt(null, 'testId')).toThrow(
        /campo requerido 'testId' está ausente/,
      );
      expect(() => parseRequiredBigInt('', 'testId')).toThrow(
        /campo requerido 'testId' está ausente/,
      );
    });

    it('throws error when string is not a valid integer representation', () => {
      expect(() => parseRequiredBigInt('not-a-number', 'testId')).toThrow(
        /no tiene formato BigInt válido/,
      );
    });

    it('throws error when number is not a safe integer', () => {
      expect(() => parseRequiredBigInt(1.5, 'testId')).toThrow(
        /no es un entero seguro/,
      );
    });

    it('throws error on unsupported types', () => {
      expect(() => parseRequiredBigInt({}, 'testId')).toThrow(
        /tipo inesperado para 'testId'/,
      );
    });
  });

  describe('parsePagoValidadoPayload', () => {
    it('parses valid payload correctly', () => {
      const parsed = parsePagoValidadoPayload({
        pagoId: '12',
        estadoPago: 'REGISTRADO',
        actualizadoPor: 'USER1',
      });
      expect(parsed).toEqual({
        pagoId: 12n,
        estadoPago: 'REGISTRADO',
        actualizadoPor: 'USER1',
      });
    });

    it('falls back to creadoPor if actualizadoPor is missing', () => {
      const parsed = parsePagoValidadoPayload({
        pagoId: '15',
        creadoPor: 'CREATOR',
      });
      expect(parsed.pagoId).toBe(15n);
      expect(parsed.actualizadoPor).toBe('CREATOR');
    });

    it('fails if pagoId is missing', () => {
      expect(() => parsePagoValidadoPayload({})).toThrow(
        /campo requerido 'pagoId' está ausente/,
      );
    });
  });

  describe('parseCuotaPagadaPayload', () => {
    it('parses valid payload with optional fields', () => {
      const parsed = parseCuotaPagadaPayload({
        cuotaConvenioId: '50',
        pagoId: '100',
        convenioId: '200',
      });
      expect(parsed).toEqual({
        cuotaConvenioId: 50n,
        pagoId: 100n,
        convenioId: 200n,
      });
    });

    it('parses without optional fields', () => {
      const parsed = parseCuotaPagadaPayload({
        cuotaConvenioId: 50,
      });
      expect(parsed.cuotaConvenioId).toBe(50n);
      expect(parsed.pagoId).toBeUndefined();
      expect(parsed.convenioId).toBeUndefined();
    });

    it('fails if cuotaConvenioId is invalid', () => {
      expect(() =>
        parseCuotaPagadaPayload({ cuotaConvenioId: 'invalid' }),
      ).toThrow(/no tiene formato BigInt válido/);
    });
  });

  describe('parsePagoAnuladoPayload', () => {
    it('parses valid payload with motivoAnulacion and anuladoPor', () => {
      const parsed = parsePagoAnuladoPayload({
        pagoId: '99',
        motivoAnulacion: 'Error de digitación',
        anuladoPor: 'ADMIN',
      });
      expect(parsed).toEqual({
        pagoId: 99n,
        motivoAnulacion: 'Error de digitación',
        anuladoPor: 'ADMIN',
      });
    });

    it('defaults motivoAnulacion to empty string if omitted', () => {
      const parsed = parsePagoAnuladoPayload({
        pagoId: 99n,
      });
      expect(parsed.pagoId).toBe(99n);
      expect(parsed.motivoAnulacion).toBe('');
    });
  });
});
