/**
 * PDF Document Type Interface
 *
 * Cada tipo de documento (prefactura, factura, informe, etc.)
 * implementa esta interfaz para proporcionar su plantilla y transformación de datos.
 */
export interface PdfDocumentType<
  TInput = object,
  TOutput extends object = object,
> {
  readonly type: string;

  readonly name: string;

  readonly template: string;

  /**
   * Indica si este tipo de documento requiere obligatoriamente un perfil institucional.
   * Por defecto es true para reportes, contratos y convenios.
   * Documentos basados únicamente en datos fiscales de Emisor (ej. SRI RIDE) pueden definirlo en false.
   */
  readonly requiresInstitutionalProfile?: boolean;

  /**
   * Transforma datos crudos en la estructura esperada por la plantilla.
   * Aquí es donde mapeas las entidades del dominio a objetos amigables para la plantilla.
   */
  adaptData(raw: TInput): TOutput;
}
