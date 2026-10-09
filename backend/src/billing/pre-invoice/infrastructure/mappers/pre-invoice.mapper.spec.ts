import { PreInvoiceMapper } from './pre-invoice.mapper';

const rawPrefactura = (prefacturaDetalle: unknown[]) => ({
  prefacturaId: 1,
  contratoId: 10,
  descuentoTotal: '2.00',
  prefacturaDetalle,
});

const detail = (descuentoDetalles: unknown[]) => ({
  prefacturaDetalleId: 1,
  prefacturaId: 1,
  descuentoDetalles,
});

describe('PreInvoiceMapper', () => {
  describe('subsidioLey', () => {
    it('suma los descuentos de tercera edad y discapacidad', () => {
      const result = PreInvoiceMapper.toDomain(
        rawPrefactura([
          detail([
            {
              montoDescontado: '2.0000',
              catalogo: { tipoDescuento: 'TERCERA_EDAD' },
            },
          ]),
          detail([
            {
              montoDescontado: '1.5000',
              catalogo: { tipoDescuento: 'DISCAPACIDAD' },
            },
          ]),
        ]),
      );

      expect(result!.subsidioLey).toBe(3.5);
    });

    it('ignora los descuentos que no son subsidio de ley', () => {
      const result = PreInvoiceMapper.toDomain(
        rawPrefactura([
          detail([
            {
              montoDescontado: '5.0000',
              catalogo: { tipoDescuento: 'INTERES_MORA' },
            },
            {
              montoDescontado: '2.0000',
              catalogo: { tipoDescuento: 'TERCERA_EDAD' },
            },
          ]),
        ]),
      );

      expect(result!.subsidioLey).toBe(2);
    });

    it('retorna 0 cuando la prefactura no tiene subsidio', () => {
      expect(
        PreInvoiceMapper.toDomain(rawPrefactura([detail([])]))!.subsidioLey,
      ).toBe(0);
      expect(
        PreInvoiceMapper.toDomain({ prefacturaId: 1, contratoId: 10 })!
          .subsidioLey,
      ).toBe(0);
    });
  });
});
