import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SriBaseService } from './sri-base.service';
import { IdentificacionValidatorService } from './identificacion-validator.service';
import { CatalogoValidatorService } from './catalogo-validator.service';
import { SriAvailabilityService } from '../soap/sri-availability.service';
import { Ambiente, TipoEmision } from '../../domain/constants';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';

const mockLogger = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};

describe('SriBaseService — resolverTipoEmision', () => {
  let service: SriBaseService;
  let sriAvailability: jest.Mocked<SriAvailabilityService>;

  beforeEach(async () => {
    sriAvailability = {
      isSriDown: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SriBaseService,
        { provide: LoggerService, useValue: mockLogger },
        { provide: ConfigService, useValue: { get: jest.fn() } },
        { provide: IdentificacionValidatorService, useValue: {} },
        { provide: CatalogoValidatorService, useValue: {} },
        { provide: SriAvailabilityService, useValue: sriAvailability },
      ],
    }).compile();

    service = module.get(SriBaseService);
  });

  it('should respect explicitly requested tipoEmision even if SRI is down', () => {
    sriAvailability.isSriDown.mockReturnValue(true);

    const result = service.resolverTipoEmision(
      Ambiente.PRUEBAS,
      TipoEmision.NORMAL,
    );

    expect(result).toBe(TipoEmision.NORMAL);
  });

  it('should automatically return CONTINGENCIA when SRI is down and no tipoEmision is requested', () => {
    sriAvailability.isSriDown.mockReturnValue(true);

    const result = service.resolverTipoEmision(Ambiente.PRUEBAS);

    expect(result).toBe(TipoEmision.CONTINGENCIA);
    expect(sriAvailability.isSriDown).toHaveBeenCalledWith(Ambiente.PRUEBAS);
  });

  it('should return NORMAL when SRI is up and no tipoEmision is requested', () => {
    sriAvailability.isSriDown.mockReturnValue(false);

    const result = service.resolverTipoEmision(Ambiente.PRODUCCION);

    expect(result).toBe(TipoEmision.NORMAL);
    expect(sriAvailability.isSriDown).toHaveBeenCalledWith(Ambiente.PRODUCCION);
  });
});
