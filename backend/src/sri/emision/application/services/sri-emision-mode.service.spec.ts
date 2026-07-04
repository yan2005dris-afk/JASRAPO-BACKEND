import type { Logger } from '@nestjs/common';
import type { AuditService } from '../../../../infrastructure/audit/audit.service';
import type { SistemaConfigService } from '../../../../infrastructure/config/sistema-config.service';
import { SriEmisionModeService } from './sri-emision-mode.service';
import { SRI_EMISION_MODO } from '../../../../infrastructure/config/sistema-config.keys';

describe('SriEmisionModeService', () => {
  let service: SriEmisionModeService;
  let sistemaConfig: jest.Mocked<Pick<SistemaConfigService, 'getString'>>;
  let auditService: jest.Mocked<Pick<AuditService, 'log'>>;
  let loggerWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    sistemaConfig = {
      getString: jest.fn(),
    };
    auditService = {
      log: jest.fn().mockResolvedValue(undefined),
    };

    service = new SriEmisionModeService(
      sistemaConfig as unknown as SistemaConfigService,
      auditService as unknown as AuditService,
    );

    // Spy on the private Logger instance — by default Nestjs Logger writes to
    // console; we override just to assert the warn call shape.
    loggerWarnSpy = jest
      .spyOn((service as unknown as { logger: Logger }).logger, 'warn')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    loggerWarnSpy.mockRestore();
  });

  it('R-2/S1: returns "automatico" when sistema_config has "automatico"', async () => {
    sistemaConfig.getString.mockResolvedValue('automatico');

    const result = await service.getMode();

    expect(result).toBe('automatico');
    expect(sistemaConfig.getString).toHaveBeenCalledWith(SRI_EMISION_MODO);
    expect(loggerWarnSpy).not.toHaveBeenCalled();
    expect(auditService.log).not.toHaveBeenCalled();
  });

  it('R-2/S2: returns "manual" when sistema_config has "manual"', async () => {
    sistemaConfig.getString.mockResolvedValue('manual');

    const result = await service.getMode();

    expect(result).toBe('manual');
    expect(loggerWarnSpy).not.toHaveBeenCalled();
    expect(auditService.log).not.toHaveBeenCalled();
  });

  it('R-2/S3: returns "automatico" + warns + audits when key is missing', async () => {
    sistemaConfig.getString.mockResolvedValue(null);

    const result = await service.getMode();

    expect(result).toBe('automatico');
    expect(loggerWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining(SRI_EMISION_MODO),
    );
    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'modo-invalido-fallback',
        recurso: 'sistema-config',
        recursoId: SRI_EMISION_MODO,
      }),
    );
  });

  it('R-2/S4: returns "automatico" + warns + audits when value is invalid', async () => {
    sistemaConfig.getString.mockResolvedValue('typo-value');

    const result = await service.getMode();

    expect(result).toBe('automatico');
    expect(loggerWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('typo-value'),
    );
    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'modo-invalido-fallback',
        recurso: 'sistema-config',
        recursoId: SRI_EMISION_MODO,
        metadata: expect.objectContaining({ rawValue: 'typo-value' }),
      }),
    );
  });

  it('audit row on fallback carries metadata describing the bad value', async () => {
    sistemaConfig.getString.mockResolvedValue('auto');

    await service.getMode();

    expect(auditService.log).toHaveBeenCalledTimes(1);
    const call = auditService.log.mock.calls[0]?.[0];
    expect(call).toMatchObject({
      accion: 'modo-invalido-fallback',
      recurso: 'sistema-config',
      exitoso: false,
    });
    expect(call?.metadata).toEqual(
      expect.objectContaining({
        rawValue: 'auto',
        fallback: 'automatico',
        reason: 'invalid-value',
      }),
    );
  });
});
