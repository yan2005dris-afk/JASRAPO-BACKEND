import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IdentificacionValidatorService } from './identificacion-validator.service';
import { CatalogoValidatorService } from './catalogo-validator.service';
import { Ambiente } from '../../domain/constants/sri.enums';
import { InvalidDomainOperationException } from '../../../../shared/domain/exceptions/domain.exception';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { LogContext } from 'src/shared/decorators/log-context.decorator';

/**
 * Servicio base con métodos compartidos entre todos los tipos de comprobante SRI.
 * Contiene validaciones contra catálogos, helpers de ambiente, etc.
 */
@LogContext()
@Injectable()
export class SriBaseService {
  constructor(
    private readonly configService: ConfigService,
    private readonly identificacionValidator: IdentificacionValidatorService,
    private readonly catalogoValidator: CatalogoValidatorService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Obtiene el ambiente por defecto desde la configuración
   */
  getDefaultAmbiente(): Ambiente {
    const env = this.configService.get<string>(
      'sri.environment',
      'development',
    );
    return env === 'production' ? Ambiente.PRODUCCION : Ambiente.PRUEBAS;
  }

  /**
   * Valida una identificación antes de enviar al SRI
   * @throws InvalidDomainOperationException si la identificación es inválida
   */
  validarIdentificacion(
    tipoIdentificacion: string,
    identificacion: string,
    contexto: string,
  ): void {
    const resultado = this.identificacionValidator.validar(
      tipoIdentificacion,
      identificacion,
    );

    if (!resultado.valido) {
      this.logger.warn(
        `Identificación inválida para ${contexto}: ${resultado.error}`,
      );
      throw new InvalidDomainOperationException(
        `Identificación del ${contexto} inválida: ${resultado.error}`,
      );
    }

    this.logger.log(`Identificación del ${contexto} validada correctamente`);
  }

  /**
   * Valida la fecha de emisión del comprobante.
   * Reglas SRI:
   * 1. No puede ser una fecha futura.
   * 2. No puede tener una antigüedad mayor a maxDiasRetroactivos (default 3 días / 72h).
   */
  validarFechaEmision(
    fechaEmisionStr: string,
    maxDiasRetroactivos: number = 3,
  ): void {
    const [day, month, year] = fechaEmisionStr.split('/').map(Number);
    if (!day || !month || !year) {
      throw new InvalidDomainOperationException(
        `Formato de fecha de emisión inválido: ${fechaEmisionStr}. Debe ser dd/MM/yyyy`,
      );
    }

    const ahora = new Date();
    const hoy = new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      ahora.getDate(),
    );
    const fechaEmisionInicio = new Date(year, month - 1, day);

    // Margen de hasta 24h por posibles desfasajes de zona horaria
    const limiteFuturo = new Date(hoy.getTime() + 24 * 60 * 60 * 1000);
    if (fechaEmisionInicio > limiteFuturo) {
      throw new InvalidDomainOperationException(
        `La fecha de emisión (${fechaEmisionStr}) no puede ser una fecha futura`,
      );
    }

    const limitePasado = new Date(
      hoy.getTime() - maxDiasRetroactivos * 24 * 60 * 60 * 1000,
    );
    if (fechaEmisionInicio < limitePasado) {
      throw new InvalidDomainOperationException(
        `La fecha de emisión (${fechaEmisionStr}) es extemporánea; no puede exceder ${maxDiasRetroactivos} días de antigüedad según la normativa del SRI`,
      );
    }
  }

  /**
   * Valida los códigos de impuesto de los detalles contra el catálogo
   */
  async validarImpuestosDetalles(
    detalles: Array<{
      impuestos: Array<{ codigo: string; codigoPorcentaje: string }>;
    }>,
  ): Promise<void> {
    const impuestosToValidate: Array<{
      codigo: string;
      codigoPorcentaje: string;
    }> = [];

    for (const detalle of detalles) {
      if (detalle.impuestos) {
        for (const imp of detalle.impuestos) {
          impuestosToValidate.push({
            codigo: imp.codigo,
            codigoPorcentaje: imp.codigoPorcentaje,
          });
        }
      }
    }

    if (impuestosToValidate.length === 0) {
      return;
    }

    const result =
      await this.catalogoValidator.validateImpuestos(impuestosToValidate);

    if (!result.valid) {
      this.logger.warn(`Impuestos inválidos: ${result.errors.join(', ')}`);
      throw new InvalidDomainOperationException(
        `Códigos de impuesto inválidos: ${result.errors.join(', ')}`,
      );
    }

    this.logger.log(
      `Validados ${impuestosToValidate.length} impuestos contra catálogo`,
    );
  }

  /**
   * Valida los códigos de retención contra el catálogo
   */
  async validarRetencionesCatalogo(
    retenciones: Array<{ codigo: string; codigoRetencion: string }>,
  ): Promise<void> {
    if (!retenciones || retenciones.length === 0) {
      return;
    }

    const result =
      await this.catalogoValidator.validateRetenciones(retenciones);

    if (!result.valid) {
      this.logger.warn(`Retenciones inválidas: ${result.errors.join(', ')}`);
      throw new InvalidDomainOperationException(
        `Códigos de retención inválidos: ${result.errors.join(', ')}`,
      );
    }

    this.logger.log(
      `Validadas ${retenciones.length} retenciones contra catálogo`,
    );
  }

  /**
   * Valida el tipo de identificación contra el catálogo
   */
  async validarTipoIdentificacionCatalogo(
    tipoIdentificacion: string,
  ): Promise<void> {
    const result =
      await this.catalogoValidator.validateTipoIdentificacion(
        tipoIdentificacion,
      );

    if (!result.valid) {
      this.logger.warn(`Tipo identificación inválido: ${result.error}`);
      throw new InvalidDomainOperationException(
        `Tipo de identificación inválido: ${result.error}`,
      );
    }

    this.logger.log(
      `Tipo de identificación ${tipoIdentificacion} validado contra catálogo`,
    );
  }

  /**
   * Valida las formas de pago contra el catálogo
   */
  async validarFormasPagoCatalogo(
    pagos: Array<{ formaPago: string }>,
  ): Promise<void> {
    if (!pagos || pagos.length === 0) {
      return;
    }

    const result = await this.catalogoValidator.validateFormasPago(pagos);

    if (!result.valid) {
      this.logger.warn(`Formas de pago inválidas: ${result.errors.join(', ')}`);
      throw new InvalidDomainOperationException(
        `Formas de pago inválidas: ${result.errors.join(', ')}`,
      );
    }

    this.logger.log(`Validadas ${pagos.length} formas de pago contra catálogo`);
  }

  /**
   * Valida el código de documento sustento contra el catálogo
   */
  async validarDocumentoSustentoCatalogo(
    codDocSustento: string,
  ): Promise<void> {
    const result =
      await this.catalogoValidator.validateDocumentoSustento(codDocSustento);

    if (!result.valid) {
      this.logger.warn(`Documento sustento inválido: ${result.error}`);
      throw new InvalidDomainOperationException(
        `Código de documento sustento inválido: ${result.error}`,
      );
    }

    this.logger.log(
      `Documento sustento ${codDocSustento} validado contra catálogo`,
    );
  }
}
