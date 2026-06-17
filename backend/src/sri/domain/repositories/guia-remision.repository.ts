import { DestinatarioGuiaRecord, DetalleGuiaRecord } from '../interfaces/repository.interface';

export abstract class GuiaRemisionRepository {
  abstract createDestinatarios(
    destinatarios: DestinatarioGuiaRecord[],
    tx?: any,
  ): Promise<DestinatarioGuiaRecord[]>;

  abstract createDetalles(
    detalles: DetalleGuiaRecord[],
    tx?: any,
  ): Promise<DetalleGuiaRecord[]>;
}
