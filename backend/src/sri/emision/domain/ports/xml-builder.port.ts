import {
  Factura,
  NotaCredito,
  NotaDebito,
  Retencion,
} from '../interfaces';

export abstract class XmlBuilderPort {
  abstract buildFactura(factura: Factura): string;
  abstract buildNotaCredito(notaCredito: NotaCredito): string;
  abstract buildNotaDebito(notaDebito: NotaDebito): string;
  abstract buildRetencion(retencion: Retencion): string;
}
