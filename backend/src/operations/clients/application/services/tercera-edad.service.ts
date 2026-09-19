import { Injectable } from '@nestjs/common';
import { LoggerService } from '../../../../infrastructure/observability/logger/logger.service';
import { SistemaConfigService } from '../../../../infrastructure/config/sistema-config.service';
import { CLIENTES_TERCERA_EDAD_EDAD_MINIMA } from '../../../../infrastructure/config/sistema-config.keys';
import { TerceraEdadUtil } from '../../domain/tercera-edad.util';

/** Fallback usado cuando la fila falta o el valor almacenado es inválido. */
const FALLBACK_EDAD_MINIMA = TerceraEdadUtil.EDAD_MINIMA;

/** Límite defensivo para descartar valores absurdos leídos de la config. */
const MAX_EDAD_MINIMA = 120;

/**
 * Servicio de aplicación que resuelve el umbral de tercera edad desde
 * `sistema_config` (clave `clientes.tercera-edad.edad-minima`) y delega el
 * cálculo puro en `TerceraEdadUtil`.
 *
 * Mantiene el dominio libre de infraestructura: la util sigue siendo pura y
 * este servicio es el único que conoce `SistemaConfigService`.
 *
 * Nunca lanza: un valor faltante o inválido degrada al fallback (65) con un
 * warn, para no romper el registro/edición de clientes por una mala config.
 */
@Injectable()
export class TerceraEdadService {
  constructor(
    private readonly logger: LoggerService,
    private readonly sistemaConfig: SistemaConfigService,
  ) {}

  /** Umbral de edad configurado, con fallback seguro a 65. */
  async getEdadMinima(): Promise<number> {
    const raw = await this.sistemaConfig.getString(
      CLIENTES_TERCERA_EDAD_EDAD_MINIMA,
    );
    const parsed = this.parse(raw);

    if (parsed === null) {
      const reason = raw === null ? 'missing-key' : 'invalid-value';
      this.logger.warn(
        `[TerceraEdadService] ${CLIENTES_TERCERA_EDAD_EDAD_MINIMA}=${JSON.stringify(
          raw,
        )} is invalid (${reason}); falling back to "${FALLBACK_EDAD_MINIMA}"`,
      );
      return FALLBACK_EDAD_MINIMA;
    }

    return parsed;
  }

  /** Indica si la fecha de nacimiento califica para el beneficio de tercera edad. */
  async aplica(fechaNacimiento?: Date | string | null): Promise<boolean> {
    const edadMinima = await this.getEdadMinima();
    return TerceraEdadUtil.aplica(fechaNacimiento, edadMinima);
  }

  private parse(raw: string | null): number | null {
    if (raw === null || !/^\d+$/.test(raw.trim())) return null;
    const value = Number(raw);
    if (!Number.isSafeInteger(value) || value < 1 || value > MAX_EDAD_MINIMA) {
      return null;
    }
    return value;
  }
}
