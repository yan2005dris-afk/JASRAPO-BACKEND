import { PreInvoiceResponseDto } from './pre-invoice-response.dto';
import { preInvoiceRow } from '../../__test-utils__/pre-invoice-row.factory';

describe('PreInvoiceResponseDto', () => {
  it('includes the related contract guide in the response', () => {
    const entity = preInvoiceRow({
      prefacturaId: 1n,
      uuid: 'prefactura-uuid',
      contratoId: 2n,
      contrato: {
        contratoId: 2n,
        numeroGuia: 'OLON-SN84920-00124',
        cliente: null,
      },
    });

    expect(PreInvoiceResponseDto.fromRow(entity)).toMatchObject({
      contratoId: 2,
      numeroGuia: 'OLON-SN84920-00124',
    });
  });
});
