import { ClaveAccesoService } from './clave-acceso.service';
import { Ambiente, TipoEmision } from '../../domain/constants';
import type { ClaveAccesoData } from '../../domain/interfaces';
import type { LoggerService } from 'src/infrastructure/observability/logger/logger.service';

const mockLogger = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};

describe('ClaveAccesoService', () => {
  let service: ClaveAccesoService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ClaveAccesoService(mockLogger as unknown as LoggerService);
  });

  describe('generate', () => {
    const baseData: ClaveAccesoData = {
      fechaEmision: new Date(2026, 6, 3), // 03/07/2026 (mes 0-indexado)
      tipoComprobante: '01' as any,
      ruc: '1234567890001',
      ambiente: Ambiente.PRUEBAS,
      establecimiento: '001',
      puntoEmision: '001',
      secuencial: '000000001',
      codigoNumerico: '12345678',
      tipoEmision: TipoEmision.NORMAL,
    };

    it('generates the exact 49-digit clave de acceso for fixed input data', () => {
      const clave = service.generate(baseData);

      // fecha(8) + tipoComprobante(2) + ruc(13) + ambiente(1) + estab(3) +
      // ptoEmi(3) + secuencial(9) + codigoNumerico(8) + tipoEmision(1) + dv(1) = 49
      expect(clave).toHaveLength(49);
      expect(clave).toBe('0307202601123456789000110010010000000011234567812');
    });

    it('produces a clave whose structure matches each documented field', () => {
      const clave = service.generate(baseData);

      expect(clave.substring(0, 8)).toBe('03072026'); // fecha ddmmaaaa
      expect(clave.substring(8, 10)).toBe('01'); // tipoComprobante
      expect(clave.substring(10, 23)).toBe('1234567890001'); // ruc
      expect(clave.charAt(23)).toBe(Ambiente.PRUEBAS); // ambiente
      expect(clave.substring(24, 27)).toBe('001'); // establecimiento
      expect(clave.substring(27, 30)).toBe('001'); // puntoEmision
      expect(clave.substring(30, 39)).toBe('000000001'); // secuencial
      expect(clave.substring(39, 47)).toBe('12345678'); // codigoNumerico
      expect(clave.charAt(47)).toBe(TipoEmision.NORMAL); // tipoEmision
      expect(/^\d$/.test(clave.charAt(48))).toBe(true); // digito verificador
    });

    it('defaults ambiente to PRUEBAS when not provided', () => {
      const { ambiente: _ambiente, ...rest } = baseData;
      const clave = service.generate(rest as ClaveAccesoData);

      expect(clave.charAt(23)).toBe(Ambiente.PRUEBAS);
    });

    it('defaults tipoEmision to NORMAL when not provided', () => {
      const { tipoEmision: _tipoEmision, ...rest } = baseData;
      const clave = service.generate(rest as ClaveAccesoData);

      expect(clave.charAt(47)).toBe(TipoEmision.NORMAL);
    });

    it('generates a random 8-digit codigoNumerico when not provided', () => {
      const { codigoNumerico: _codigoNumerico, ...rest } = baseData;
      const clave = service.generate(rest as ClaveAccesoData);

      expect(/^\d{8}$/.test(clave.substring(39, 47))).toBe(true);
    });

    it('pads establecimiento, puntoEmision and secuencial to their fixed widths', () => {
      const clave = service.generate({
        ...baseData,
        establecimiento: '1',
        puntoEmision: '2',
        secuencial: '5',
      });

      expect(clave.substring(24, 27)).toBe('001');
      expect(clave.substring(27, 30)).toBe('002');
      expect(clave.substring(30, 39)).toBe('000000005');
    });

    it('throws when the RUC does not have 13 digits', () => {
      expect(() =>
        service.generate({ ...baseData, ruc: '123456789' }),
      ).toThrow('RUC inválido');
    });

    it('strips non-numeric characters from the RUC before validating length', () => {
      const clave = service.generate({
        ...baseData,
        ruc: '1234-5678-90001',
      });

      expect(clave.substring(10, 23)).toBe('1234567890001');
    });
  });

  describe('calculateModulo11 (via generate) — check digit algorithm', () => {
    it('matches a manually computed módulo 11 check digit for a known clave base', () => {
      // claveBase manually computed offline with factores [2,3,4,5,6,7] cycling
      // from the rightmost digit: dv = 11 - (suma % 11), 11 -> 0, 10 -> 1.
      const clave = service.generate({
        fechaEmision: new Date(2026, 6, 3),
        tipoComprobante: '01' as any,
        ruc: '1234567890001',
        ambiente: Ambiente.PRUEBAS,
        establecimiento: '001',
        puntoEmision: '001',
        secuencial: '000000001',
        codigoNumerico: '12345678',
        tipoEmision: TipoEmision.NORMAL,
      });

      expect(clave.charAt(48)).toBe('2');
    });
  });

  describe('validate', () => {
    const validClave = '0307202601123456789000110010010000000011234567812';

    it('returns true for a valid clave de acceso', () => {
      expect(service.validate(validClave)).toBe(true);
    });

    it('returns false when the length is not 49', () => {
      expect(service.validate(validClave.slice(0, 48))).toBe(false);
      expect(service.validate(`${validClave}0`)).toBe(false);
    });

    it('returns false when the clave contains non-numeric characters', () => {
      const withLetter = `${validClave.slice(0, 10)}A${validClave.slice(11)}`;
      expect(service.validate(withLetter)).toBe(false);
    });

    it('detects a corrupted digit and rejects the clave (check digit catches tampering)', () => {
      // Flip a digit in the middle of the base (RUC segment) without touching
      // the check digit — the recomputed módulo 11 must no longer match.
      const corruptedDigit = validClave.charAt(15) === '9' ? '8' : '9';
      const corrupted =
        validClave.substring(0, 15) +
        corruptedDigit +
        validClave.substring(16);

      expect(corrupted).not.toBe(validClave);
      expect(service.validate(corrupted)).toBe(false);
    });

    it('detects a corrupted check digit itself', () => {
      const lastDigit = validClave.charAt(48);
      const corruptedDigit = lastDigit === '9' ? '8' : '9';
      const corrupted = validClave.substring(0, 48) + corruptedDigit;

      expect(service.validate(corrupted)).toBe(false);
    });
  });

  describe('parse', () => {
    it('returns null for an invalid clave de acceso', () => {
      expect(service.parse('invalid')).toBeNull();
    });

    it('extracts every documented field from a valid clave de acceso', () => {
      const clave = service.generate({
        fechaEmision: new Date(2026, 6, 3),
        tipoComprobante: '01' as any,
        ruc: '1234567890001',
        ambiente: Ambiente.PRUEBAS,
        establecimiento: '001',
        puntoEmision: '001',
        secuencial: '000000001',
        codigoNumerico: '12345678',
        tipoEmision: TipoEmision.NORMAL,
      });

      const parsed = service.parse(clave);

      expect(parsed).not.toBeNull();
      expect(parsed?.tipoComprobante).toBe('01');
      expect(parsed?.ruc).toBe('1234567890001');
      expect(parsed?.ambiente).toBe(Ambiente.PRUEBAS);
      expect(parsed?.establecimiento).toBe('001');
      expect(parsed?.puntoEmision).toBe('001');
      expect(parsed?.secuencial).toBe('000000001');
      expect(parsed?.codigoNumerico).toBe('12345678');
      expect(parsed?.tipoEmision).toBe(TipoEmision.NORMAL);
      expect(parsed?.fechaEmision.getFullYear()).toBe(2026);
      expect(parsed?.fechaEmision.getMonth()).toBe(6); // julio (0-indexado)
      expect(parsed?.fechaEmision.getDate()).toBe(3);
    });
  });
});
