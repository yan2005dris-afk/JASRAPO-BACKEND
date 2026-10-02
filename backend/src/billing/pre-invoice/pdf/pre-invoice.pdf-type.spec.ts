import { PreInvoicePdfDocumentType } from './pre-invoice.pdf-type';

type AdaptedPreInvoice = {
  prefactura: { subsidioLey: number; otrosDescuentos: number };
};

const adapt = (raw: Record<string, unknown>) =>
  PreInvoicePdfDocumentType.adaptData(raw) as AdaptedPreInvoice;

describe('PreInvoicePdfDocumentType', () => {
  describe('adaptData', () => {
    it('separa el subsidio de ley de los demás descuentos', () => {
      const data = adapt({
        descuentoTotal: 7,
        subsidioLey: 2,
      });

      expect(data.prefactura.subsidioLey).toBe(2);
      expect(data.prefactura.otrosDescuentos).toBe(5);
    });

    it('no muestra otros descuentos cuando todo el descuento es subsidio', () => {
      const data = adapt({
        descuentoTotal: 2,
        subsidioLey: 2,
      });

      expect(data.prefactura.subsidioLey).toBe(2);
      expect(data.prefactura.otrosDescuentos).toBe(0);
    });

    it('trata como descuento normal cuando no hay subsidio', () => {
      const data = adapt({ descuentoTotal: 3 });

      expect(data.prefactura.subsidioLey).toBe(0);
      expect(data.prefactura.otrosDescuentos).toBe(3);
    });
  });
});
