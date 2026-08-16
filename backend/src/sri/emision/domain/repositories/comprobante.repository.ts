import type {
  ComprobanteRecord,
  DetalleRecord,
  ImpuestoRecord,
  TotalRecord,
  PagoRecord,
  RetencionRecord,
  ImpuestoDocSustentoRecord,
  XmlRecord,
  InfoAdicionalRecord,
  DetalleAdicionalRecord,
  MotivoNotaDebitoRecord,
} from '../../../domain/interfaces/repository.interface';

export type TransactionContext = any;

export abstract class ComprobanteRepository {
  abstract create(
    data: ComprobanteRecord,
    tx?: TransactionContext,
  ): Promise<ComprobanteRecord>;

  abstract update(
    id: bigint | string,
    data: Partial<ComprobanteRecord>,
    tx?: TransactionContext,
  ): Promise<ComprobanteRecord>;

  abstract findByClaveAcceso(
    claveAcceso: string,
  ): Promise<ComprobanteRecord | null>;

  /**
   * Lightweight lookup by primary key. Returns only the requested fields
   * (defaults to `{ id, estado }`). Used by services that need to branch on
   * the comprobante's current state without paying the cost of a full record
   * mapping (e.g. `SRIEmissionDispatcherService`).
   */
  abstract findById(
    id: bigint,
    select?: { estado?: boolean; id?: boolean },
  ): Promise<{ id: bigint; estado: string } | null>;

  abstract findRecordById(id: bigint): Promise<ComprobanteRecord | null>;

  abstract findConDetalles(claveAcceso: string): Promise<any>;

  abstract findMany(filters: {
    rucEmisor?: string;
    emisorIds?: number[];
    identificacionComprador?: string;
    tipoComprobante?: string;
    estado?: string;
    estados?: string[];
    fechaDesde?: string;
    fechaHasta?: string;
    establecimiento?: string;
    puntoEmision?: string;
    page: number;
    limit: number;
  }): Promise<{ data: any[]; total: number }>;

  abstract createDetalles(
    detalles: DetalleRecord[],
    tx?: TransactionContext,
  ): Promise<DetalleRecord[]>;

  abstract createImpuestos(
    impuestos: ImpuestoRecord[],
    tx?: TransactionContext,
  ): Promise<ImpuestoRecord[]>;

  abstract createTotales(
    totales: TotalRecord[],
    tx?: TransactionContext,
  ): Promise<TotalRecord[]>;

  abstract createPagos(
    pagos: PagoRecord[],
    tx?: TransactionContext,
  ): Promise<PagoRecord[]>;

  abstract createRetenciones(
    retenciones: RetencionRecord[],
    tx?: TransactionContext,
  ): Promise<RetencionRecord[]>;

  abstract createImpuestosDocSustento(
    impuestos: ImpuestoDocSustentoRecord[],
    tx?: TransactionContext,
  ): Promise<ImpuestoDocSustentoRecord[]>;

  abstract saveXml(
    data: XmlRecord,
    tx?: TransactionContext,
  ): Promise<XmlRecord>;

  abstract createInfoAdicional(
    items: InfoAdicionalRecord[],
    tx?: TransactionContext,
  ): Promise<InfoAdicionalRecord[]>;

  abstract createDetallesAdicionales(
    items: DetalleAdicionalRecord[],
    tx?: TransactionContext,
  ): Promise<DetalleAdicionalRecord[]>;

  abstract createMotivosNotaDebito(
    motivos: MotivoNotaDebitoRecord[],
    tx?: TransactionContext,
  ): Promise<MotivoNotaDebitoRecord[]>;

  abstract findDetallesByComprobanteId(comprobanteId: bigint): Promise<any[]>;

  abstract findInfoAdicionalByComprobanteId(
    comprobanteId: bigint,
  ): Promise<any[]>;

  abstract findXmlAutorizado(comprobanteId: bigint): Promise<string | null>;

  abstract findXmlFirmado(comprobanteId: bigint): Promise<string | null>;

  abstract findXmlByComprobanteId(comprobanteId: bigint): Promise<{
    xml_firmado_path?: string;
    xml_autorizado_path?: string;
  } | null>;

  abstract deleteDetallesByComprobanteId(
    id: bigint,
    tx?: TransactionContext,
  ): Promise<void>;

  abstract deletePagosByComprobanteId(
    id: bigint,
    tx?: TransactionContext,
  ): Promise<void>;

  abstract deleteTotalesByComprobanteId(
    id: bigint,
    tx?: TransactionContext,
  ): Promise<void>;

  abstract deleteInfoAdicionalByComprobanteId(
    id: bigint,
    tx?: TransactionContext,
  ): Promise<void>;

  /**
   * Optimistic lock: updates estado only if current estado matches estadoEsperado.
   * Returns true if a row was updated, false if not (race condition lost).
   */
  abstract updateEstadoWithLock(
    id: bigint,
    estadoEsperado: string,
    nuevoEstado: string,
    tx?: TransactionContext,
  ): Promise<boolean>;

  abstract executeTransaction<T>(
    callback: (tx: TransactionContext) => Promise<T>,
  ): Promise<T>;
}
