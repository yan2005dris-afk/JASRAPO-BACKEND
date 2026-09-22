import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { TerceraEdadService } from './tercera-edad.service';
import { LoggerService } from '../../../../infrastructure/observability/logger/logger.service';
import { SistemaConfigService } from '../../../../infrastructure/config/sistema-config.service';

describe('TerceraEdadService', () => {
  let service: TerceraEdadService;

  const mockLogger = { warn: jest.fn() };
  const mockSistemaConfig = { getString: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TerceraEdadService,
        { provide: LoggerService, useValue: mockLogger },
        { provide: SistemaConfigService, useValue: mockSistemaConfig },
      ],
    }).compile();

    service = module.get<TerceraEdadService>(TerceraEdadService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getEdadMinima', () => {
    it('devuelve el valor configurado cuando es un entero válido', async () => {
      mockSistemaConfig.getString.mockResolvedValue('60');

      await expect(service.getEdadMinima()).resolves.toBe(60);
      expect(mockLogger.warn).not.toHaveBeenCalled();
    });

    it('cae a 65 y loguea cuando la fila falta', async () => {
      mockSistemaConfig.getString.mockResolvedValue(null);

      await expect(service.getEdadMinima()).resolves.toBe(65);
      expect(mockLogger.warn).toHaveBeenCalledTimes(1);
    });

    it('cae a 65 y loguea cuando el valor no es numérico', async () => {
      mockSistemaConfig.getString.mockResolvedValue('abc');

      await expect(service.getEdadMinima()).resolves.toBe(65);
      expect(mockLogger.warn).toHaveBeenCalledTimes(1);
    });

    it('cae a 65 cuando el valor está fuera de rango', async () => {
      mockSistemaConfig.getString.mockResolvedValue('999');

      await expect(service.getEdadMinima()).resolves.toBe(65);
      expect(mockLogger.warn).toHaveBeenCalledTimes(1);
    });
  });

  describe('aplica', () => {
    it('aplica el umbral configurado al calcular la elegibilidad', async () => {
      mockSistemaConfig.getString.mockResolvedValue('60');
      const anio = new Date().getFullYear() - 62;

      await expect(service.aplica(`${anio}-01-01`)).resolves.toBe(true);
    });

    it('con el fallback (65) no aplica a quien tiene 62', async () => {
      mockSistemaConfig.getString.mockResolvedValue(null);
      const anio = new Date().getFullYear() - 62;

      await expect(service.aplica(`${anio}-01-01`)).resolves.toBe(false);
    });

    it('retorna false para fecha vacía sin importar el umbral', async () => {
      mockSistemaConfig.getString.mockResolvedValue('60');

      await expect(service.aplica(null)).resolves.toBe(false);
    });
  });
});
