import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SriBaseService } from './sri-base.service';
import { IdentificacionValidatorService } from './identificacion-validator.service';
import { CatalogoValidatorService } from './catalogo-validator.service';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { InvalidDomainOperationException } from '../../../../shared/domain/exceptions/domain.exception';
import { format, subDays, addDays } from 'date-fns';

describe('SriBaseService', () => {
  let service: SriBaseService;

  const mockLogger = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('development'),
  };

  const mockIdentificacionValidator = {
    validar: jest.fn().mockImplementation((tipo: string, id: string) => {
      if (id === '1790012345001' || id === '1712345678') {
        return { valido: true };
      }
      return { valido: false, error: 'Dígito verificador incorrecto' };
    }),
  };

  const mockCatalogoValidator = {
    validateImpuestos: jest.fn().mockResolvedValue({ valid: true, errors: [] }),
    validateRetenciones: jest.fn().mockResolvedValue({ valid: true, errors: [] }),
    validateTipoIdentificacion: jest.fn().mockResolvedValue({ valid: true }),
    validateFormasPago: jest.fn().mockResolvedValue({ valid: true, errors: [] }),
    validateDocumentoSustento: jest.fn().mockResolvedValue({ valid: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SriBaseService,
        { provide: ConfigService, useValue: mockConfigService },
        {
          provide: IdentificacionValidatorService,
          useValue: mockIdentificacionValidator,
        },
        {
          provide: CatalogoValidatorService,
          useValue: mockCatalogoValidator,
        },
        { provide: LoggerService, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<SriBaseService>(SriBaseService);
  });

  describe('validarFechaEmision', () => {
    it('should accept current date (today)', () => {
      const todayStr = format(new Date(), 'dd/MM/yyyy');
      expect(() => service.validarFechaEmision(todayStr)).not.toThrow();
    });

    it('should accept a date within 3 days in the past', () => {
      const past2DaysStr = format(subDays(new Date(), 2), 'dd/MM/yyyy');
      expect(() => service.validarFechaEmision(past2DaysStr)).not.toThrow();
    });

    it('should throw InvalidDomainOperationException for dates older than 3 days (retroactive penalty)', () => {
      const past5DaysStr = format(subDays(new Date(), 5), 'dd/MM/yyyy');
      expect(() => service.validarFechaEmision(past5DaysStr)).toThrow(
        InvalidDomainOperationException,
      );
    });

    it('should throw InvalidDomainOperationException for future dates', () => {
      const futureStr = format(addDays(new Date(), 3), 'dd/MM/yyyy');
      expect(() => service.validarFechaEmision(futureStr)).toThrow(
        InvalidDomainOperationException,
      );
    });

    it('should throw InvalidDomainOperationException for invalid date format', () => {
      expect(() => service.validarFechaEmision('2026-08-15')).toThrow(
        InvalidDomainOperationException,
      );
    });
  });

  describe('validarIdentificacion', () => {
    it('should pass for valid identification', () => {
      expect(() =>
        service.validarIdentificacion('04', '1790012345001', 'comprador'),
      ).not.toThrow();
    });

    it('should throw InvalidDomainOperationException for invalid identification', () => {
      expect(() =>
        service.validarIdentificacion('04', '0000000000000', 'comprador'),
      ).toThrow(InvalidDomainOperationException);
    });
  });
});
