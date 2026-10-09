import { PreInvoiceResponseDto } from './pre-invoice-response.dto';
import { PreInvoiceEntity } from '../../domain/entities/pre-invoice.entity';

describe('PreInvoiceResponseDto', () => {
  it('includes the related contract guide in the response', () => {
    const entity = new PreInvoiceEntity({
      prefacturaId: 1n,
      uuid: 'prefactura-uuid',
      contratoId: 2n,
      contrato: {
        contratoId: 2n,
        numeroGuia: 'OLON-SN84920-00124',
      },
    });

    expect(PreInvoiceResponseDto.fromRow(entity)).toMatchObject({
      contratoId: 2,
      numeroGuia: 'OLON-SN84920-00124',
    });
  });
});
