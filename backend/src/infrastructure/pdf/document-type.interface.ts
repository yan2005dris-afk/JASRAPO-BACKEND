/**
 * PDF Document Type Interface
 *
 * Cada tipo de documento (prefactura, factura, informe, etc.)
 * implementa esta interfaz para proporcionar su plantilla y transformación de datos.
 */
export interface PdfDocumentType {
  readonly type: string;

  readonly name: string;

  readonly template: string;

  /**
   * Transforma datos crudos en la estructura esperada por la plantilla.
   * Aquí es donde mapeas las entidades del dominio a objetos amigables para la plantilla.
   */
  adaptData(raw: Record<string, any>): Record<string, any>;
}
