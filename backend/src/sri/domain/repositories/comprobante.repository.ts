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
} from '../interfaces/repository.interface';

export abstract class ComprobanteRepository {
  abstract create(
    data: ComprobanteRecord,
    tx?: any,
  ): Promise<ComprobanteRecord>;

  abstract update(
    id: bigint | string,
    data: Partial<ComprobanteRecord>,
    tx?: any,
  ): Promise<ComprobanteRecord>;

  abstract findByClaveAcceso(
    claveAcceso: string,
  ): Promise<ComprobanteRecord | null>;

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
    tx?: any,
  ): Promise<DetalleRecord[]>;

  abstract createImpuestos(
    impuestos: ImpuestoRecord[],
    tx?: any,
  ): Promise<ImpuestoRecord[]>;

  abstract createTotales(
    totales: TotalRecord[],
    tx?: any,
  ): Promise<TotalRecord[]>;

  abstract createPagos(pagos: PagoRecord[], tx?: any): Promise<PagoRecord[]>;

  abstract createRetenciones(
    retenciones: RetencionRecord[],
    tx?: any,
  ): Promise<RetencionRecord[]>;

  abstract createImpuestosDocSustento(
    impuestos: ImpuestoDocSustentoRecord[],
    tx?: any,
  ): Promise<ImpuestoDocSustentoRecord[]>;

  abstract saveXml(data: XmlRecord, tx?: any): Promise<XmlRecord>;

  abstract createInfoAdicional(
    items: InfoAdicionalRecord[],
    tx?: any,
  ): Promise<InfoAdicionalRecord[]>;

  abstract createDetallesAdicionales(
    items: DetalleAdicionalRecord[],
    tx?: any,
  ): Promise<DetalleAdicionalRecord[]>;

  abstract createMotivosNotaDebito(
    motivos: MotivoNotaDebitoRecord[],
    tx?: any,
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

  abstract executeTransaction<T>(callback: (tx: any) => Promise<T>): Promise<T>;
}
