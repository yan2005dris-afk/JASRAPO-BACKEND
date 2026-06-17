import type {
  DestinatarioGuiaRecord,
  DetalleGuiaRecord,
} from '../interfaces/repository.interface';
import type { TransactionContext } from './comprobante.repository';

export abstract class GuiaRemisionRepository {
  abstract createDestinatarios(
    destinatarios: DestinatarioGuiaRecord[],
    tx?: TransactionContext,
  ): Promise<DestinatarioGuiaRecord[]>;

  abstract createDetalles(
    detalles: DetalleGuiaRecord[],
    tx?: TransactionContext,
  ): Promise<DetalleGuiaRecord[]>;
}
