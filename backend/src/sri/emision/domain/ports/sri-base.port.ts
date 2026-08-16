import { Ambiente } from '../constants';

export abstract class SriBasePort {
  abstract getDefaultAmbiente(): Ambiente;
  abstract validarIdentificacion(
    tipoIdentificacion: string,
    identificacion: string,
    contexto: string,
  ): void;
  abstract validarFechaEmision(
    fechaEmisionStr: string,
    maxDiasRetroactivos?: number,
  ): void;
  abstract validarImpuestosDetalles(
    detalles: Array<{
      impuestos: Array<{ codigo: string; codigoPorcentaje: string }>;
    }>,
  ): Promise<void>;
  abstract validarRetencionesCatalogo(
    retenciones: Array<{ codigo: string; codigoRetencion: string }>,
  ): Promise<void>;
  abstract validarTipoIdentificacionCatalogo(
    tipoIdentificacion: string,
  ): Promise<void>;
  abstract validarFormasPagoCatalogo(
    pagos: Array<{ formaPago: string }>,
  ): Promise<void>;
  abstract validarDocumentoSustentoCatalogo(
    codDocSustento: string,
  ): Promise<void>;
}
