import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { ComprobanteRepository } from '../../domain/repositories/comprobante.repository';
import { Prisma } from '../../../../generated/prisma/client.js';
import {
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

@Injectable()
export class PrismaComprobanteRepository extends ComprobanteRepository {
  private readonly logger = new Logger(PrismaComprobanteRepository.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(
    data: ComprobanteRecord,
    tx?: Prisma.TransactionClient,
  ): Promise<ComprobanteRecord> {
    const client = tx ?? this.prisma;

    const created = await client.comprobantes.create({
      data: {
        emisorId: data.emisor_id,
        puntoEmisionId: data.punto_emision_id,
        tipoComprobante: data.tipo_comprobante,
        ambiente: data.ambiente,
        tipoEmision: data.tipo_emision,
        secuencial: data.secuencial,
        claveAcceso: data.clave_acceso,
        fechaEmision: data.fecha_emision
          ? new Date(data.fecha_emision)
          : new Date(),
        estado: data.estado,
        estadoSri: data.estado_sri ?? undefined,
        fechaAutorizacion: data.fecha_autorizacion
          ? new Date(data.fecha_autorizacion)
          : undefined,
        numeroAutorizacion: data.numero_autorizacion ?? undefined,
        totalSinImpuestos: data.total_sin_impuestos ?? undefined,
        totalDescuento: data.total_descuento ?? 0,
        importeTotal: data.importe_total ?? undefined,
        propina: data.propina ?? undefined,
        moneda: data.moneda ?? 'DOLAR',
        receptorTipoIdentificacion:
          data.receptor_tipo_identificacion ?? undefined,
        receptorIdentificacion: data.receptor_identificacion ?? undefined,
        receptorRazonSocial: data.receptor_razon_social ?? undefined,
        receptorDireccion: data.receptor_direccion ?? undefined,
        receptorEmail: data.receptor_email ?? undefined,
        receptorTelefono: data.receptor_telefono ?? undefined,
        docModificadoTipo: data.doc_modificado_tipo ?? undefined,
        docModificadoNumero: data.doc_modificado_numero ?? undefined,
        docModificadoFecha: data.doc_modificado_fecha
          ? new Date(data.doc_modificado_fecha)
          : undefined,
        motivo: data.motivo ?? undefined,
        valorModificacion: data.valor_modificacion ?? undefined,
        rise: data.rise ?? undefined,
        periodoFiscal: data.periodo_fiscal ?? undefined,
        idReferenciaExterna: data.id_referencia_externa ?? undefined,
        tipoSistemaExterno: data.tipo_sistema_externo ?? undefined,
      },
    });

    return this.mapComprobanteToRecord(created);
  }

  async update(
    id: bigint | string,
    data: Partial<ComprobanteRecord>,
    tx?: Prisma.TransactionClient,
  ): Promise<ComprobanteRecord> {
    const client = tx ?? this.prisma;

    const updated = await client.comprobantes.update({
      where: typeof id === 'string' ? { uuid: id } : { id },
      data: {
        ...(data.estado !== undefined && { estado: data.estado }),
        ...(data.estado_sri !== undefined && { estadoSri: data.estado_sri }),
        ...(data.fecha_autorizacion !== undefined && {
          fechaAutorizacion: data.fecha_autorizacion
            ? new Date(data.fecha_autorizacion)
            : null,
        }),
        ...(data.numero_autorizacion !== undefined && {
          numeroAutorizacion: data.numero_autorizacion,
        }),
        ...(data.total_sin_impuestos !== undefined && {
          totalSinImpuestos: data.total_sin_impuestos,
        }),
        ...(data.total_descuento !== undefined && {
          totalDescuento: data.total_descuento,
        }),
        ...(data.importe_total !== undefined && {
          importeTotal: data.importe_total,
        }),
        ...(data.propina !== undefined && { propina: data.propina }),
        ...(data.moneda !== undefined && { moneda: data.moneda }),
        ...(data.receptor_tipo_identificacion !== undefined && {
          receptorTipoIdentificacion: data.receptor_tipo_identificacion,
        }),
        ...(data.receptor_identificacion !== undefined && {
          receptorIdentificacion: data.receptor_identificacion,
        }),
        ...(data.receptor_razon_social !== undefined && {
          receptorRazonSocial: data.receptor_razon_social,
        }),
        ...(data.receptor_direccion !== undefined && {
          receptorDireccion: data.receptor_direccion,
        }),
        ...(data.receptor_email !== undefined && {
          receptorEmail: data.receptor_email,
        }),
        ...(data.receptor_telefono !== undefined && {
          receptorTelefono: data.receptor_telefono,
        }),
        ...(data.motivo !== undefined && { motivo: data.motivo }),
        ...(data.rise !== undefined && { rise: data.rise }),
        ...(data.periodo_fiscal !== undefined && {
          periodoFiscal: data.periodo_fiscal,
        }),
      },
    });

    return this.mapComprobanteToRecord(updated);
  }

  async findByClaveAcceso(
    claveAcceso: string,
  ): Promise<ComprobanteRecord | null> {
    const found = await this.prisma.comprobantes.findUnique({
      where: { claveAcceso },
    });
    return found ? this.mapComprobanteToRecord(found) : null;
  }

  async findConDetalles(claveAcceso: string): Promise<any> {
    const c = await this.prisma.comprobantes.findUnique({
      where: { claveAcceso },
      include: {
        emisor: true,
        puntoEmision: { include: { establecimiento: true } },
        xmls: true,
      },
    });

    if (!c) return null;

    const record = this.mapComprobanteToRecord(c);

    return {
      ...record,
      id: record.id?.toString(),
      ruc_emisor: c.emisor?.ruc,
      razon_social_emisor: c.emisor?.razonSocial,
      establecimiento: c.puntoEmision?.establecimiento?.codigo,
      punto_emision: c.puntoEmision?.codigo,
      subtotal: c.totalSinImpuestos ? Number(c.totalSinImpuestos) : null,
      total: c.importeTotal ? Number(c.importeTotal) : null,
      identificacion_comprador: c.receptorIdentificacion,
      razon_social_comprador: c.receptorRazonSocial,
      num_autorizacion: c.numeroAutorizacion,
      xml_disponible: c.xmls !== null,
    };
  }

  async findMany(filters: {
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
  }): Promise<{ data: any[]; total: number }> {
    const where: Prisma.ComprobantesWhereInput = {};

    if (filters.emisorIds && filters.emisorIds.length > 0) {
      where.emisorId = { in: filters.emisorIds };
    } else if (filters.rucEmisor) {
      where.emisor = { ruc: filters.rucEmisor };
    }

    if (filters.identificacionComprador) {
      where.receptorIdentificacion = filters.identificacionComprador;
    }

    if (filters.tipoComprobante) {
      where.tipoComprobante = filters.tipoComprobante;
    }

    if (filters.estados && filters.estados.length > 0) {
      where.estado = { in: filters.estados };
    } else if (filters.estado) {
      where.estado = filters.estado;
    }

    if (filters.fechaDesde || filters.fechaHasta) {
      where.fechaEmision = {
        ...(filters.fechaDesde && { gte: new Date(filters.fechaDesde) }),
        ...(filters.fechaHasta && { lte: new Date(filters.fechaHasta) }),
      };
    }

    if (filters.establecimiento || filters.puntoEmision) {
      where.puntoEmision = {
        ...(filters.puntoEmision && { codigo: filters.puntoEmision }),
        ...(filters.establecimiento && {
          establecimiento: { codigo: filters.establecimiento },
        }),
      };
    }

    const offset = (filters.page - 1) * filters.limit;

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.comprobantes.findMany({
        where,
        include: {
          emisor: true,
          puntoEmision: { include: { establecimiento: true } },
          xmls: { select: { id: true } },
        },
        skip: offset,
        take: filters.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.comprobantes.count({ where }),
    ]);

    const data = rows.map((c) => ({
      id: c.id.toString(),
      uuid: c.uuid,
      emisor_id: c.emisorId,
      clave_acceso: c.claveAcceso,
      tipo_comprobante: c.tipoComprobante,
      ambiente: c.ambiente,
      fecha_emision: c.fechaEmision,
      secuencial: c.secuencial,
      estado: c.estado,
      fecha_autorizacion: c.fechaAutorizacion,
      num_autorizacion: c.numeroAutorizacion,
      subtotal: c.totalSinImpuestos ? Number(c.totalSinImpuestos) : null,
      total: c.importeTotal ? Number(c.importeTotal) : null,
      identificacion_comprador: c.receptorIdentificacion,
      razon_social_comprador: c.receptorRazonSocial,
      ruc_emisor: c.emisor?.ruc,
      razon_social_emisor: c.emisor?.razonSocial,
      establecimiento: c.puntoEmision?.establecimiento?.codigo,
      punto_emision: c.puntoEmision?.codigo,
      created_at: c.createdAt,
      updated_at: c.updatedAt,
    }));

    return { data, total };
  }

  async createDetalles(
    detalles: DetalleRecord[],
    tx?: Prisma.TransactionClient,
  ): Promise<DetalleRecord[]> {
    if (detalles.length === 0) return [];
    const client = tx ?? this.prisma;

    const created = await client.comprobanteDetalles.createManyAndReturn({
      data: detalles.map((d) => ({
        comprobanteId: d.comprobante_id,
        codigoPrincipal: d.codigo_principal ?? undefined,
        codigoAuxiliar: d.codigo_auxiliar ?? undefined,
        descripcion: d.descripcion,
        unidadMedida: d.unidad_medida ?? undefined,
        cantidad: new Prisma.Decimal(d.cantidad),
        precioUnitario: new Prisma.Decimal(d.precio_unitario),
        descuento: new Prisma.Decimal(d.descuento ?? 0),
        precioTotalSinImpuesto: d.precio_total_sin_impuesto
          ? new Prisma.Decimal(d.precio_total_sin_impuesto)
          : undefined,
        orden: d.orden ?? 0,
      })),
    });

    return created.map((r) => ({
      id: r.id,
      comprobante_id: r.comprobanteId,
      codigo_principal: r.codigoPrincipal ?? undefined,
      codigo_auxiliar: r.codigoAuxiliar ?? undefined,
      descripcion: r.descripcion,
      unidad_medida: r.unidadMedida ?? undefined,
      cantidad: Number(r.cantidad),
      precio_unitario: Number(r.precioUnitario),
      descuento: Number(r.descuento),
      precio_total_sin_impuesto: r.precioTotalSinImpuesto
        ? Number(r.precioTotalSinImpuesto)
        : undefined,
      orden: r.orden,
    }));
  }

  async createImpuestos(
    impuestos: ImpuestoRecord[],
    tx?: Prisma.TransactionClient,
  ): Promise<ImpuestoRecord[]> {
    if (impuestos.length === 0) return [];
    const client = tx ?? this.prisma;

    await client.comprobanteImpuestos.createMany({
      data: impuestos.map((imp) => ({
        comprobanteDetalleId: imp.comprobante_detalle_id,
        codigo: imp.codigo,
        codigoPorcentaje: imp.codigo_porcentaje,
        tarifa: imp.tarifa ?? undefined,
        baseImponible: imp.base_imponible ?? undefined,
        valor: imp.valor ?? undefined,
      })),
    });

    return impuestos;
  }

  async createTotales(
    totales: TotalRecord[],
    tx?: Prisma.TransactionClient,
  ): Promise<TotalRecord[]> {
    if (totales.length === 0) return [];
    const client = tx ?? this.prisma;

    await client.comprobanteTotales.createMany({
      data: totales.map((t) => ({
        comprobanteId: t.comprobante_id,
        codigo: t.codigo,
        codigoPorcentaje: t.codigo_porcentaje,
        descuentoAdicional: t.descuento_adicional ?? undefined,
        baseImponible: t.base_imponible ?? undefined,
        tarifa: t.tarifa ?? undefined,
        valor: t.valor ?? undefined,
        valorDevolucionIva: t.valor_devolucion_iva ?? undefined,
      })),
    });

    return totales;
  }

  async createPagos(
    pagos: PagoRecord[],
    tx?: Prisma.TransactionClient,
  ): Promise<PagoRecord[]> {
    if (pagos.length === 0) return [];
    const client = tx ?? this.prisma;

    await client.comprobantePagos.createMany({
      data: pagos.map((p) => ({
        comprobanteId: p.comprobante_id,
        formaPago: p.forma_pago,
        total: new Prisma.Decimal(p.total),
        plazo: p.plazo ?? undefined,
        unidadTiempo: p.unidad_tiempo ?? undefined,
      })),
    });

    return pagos;
  }

  async createRetenciones(
    retenciones: RetencionRecord[],
    tx?: Prisma.TransactionClient,
  ): Promise<RetencionRecord[]> {
    if (retenciones.length === 0) return [];
    const client = tx ?? this.prisma;

    const created = await Promise.all(
      retenciones.map((r) =>
        client.comprobanteRetenciones.create({
          data: {
            comprobanteId: r.comprobante_id,
            codigo: r.codigo,
            codigoRetencion: r.codigo_retencion,
            baseImponible: r.base_imponible ?? undefined,
            porcentajeRetener: r.porcentaje_retener ?? undefined,
            valorRetenido: r.valor_retenido ?? undefined,
            codDocSustento: r.cod_doc_sustento ?? undefined,
            numDocSustento: r.num_doc_sustento ?? undefined,
            fechaEmisionDocSustento: r.fecha_emision_doc_sustento
              ? new Date(r.fecha_emision_doc_sustento)
              : undefined,
            pagoLocExt: r.pago_loc_ext ?? '01',
          },
        }),
      ),
    );

    return created.map((r, index) => ({
      ...retenciones[index],
      id: r.id,
    }));
  }

  async createImpuestosDocSustento(
    impuestos: ImpuestoDocSustentoRecord[],
    tx?: Prisma.TransactionClient,
  ): Promise<ImpuestoDocSustentoRecord[]> {
    if (impuestos.length === 0) return [];
    const client = tx ?? this.prisma;

    await client.impuestosDocSustento.createMany({
      data: impuestos.map((imp) => ({
        comprobanteRetencionId: imp.comprobante_retencion_id,
        codImpuestoDocSustento: imp.cod_impuesto_doc_sustento,
        codigoPorcentaje: imp.codigo_porcentaje,
        baseImponible: imp.base_imponible ?? undefined,
        tarifa: imp.tarifa ?? undefined,
        valorImpuesto: imp.valor_impuesto ?? undefined,
      })),
    });

    return impuestos;
  }

  async saveXml(
    data: XmlRecord,
    tx?: Prisma.TransactionClient,
  ): Promise<XmlRecord> {
    const client = tx ?? this.prisma;

    const result = await client.comprobanteXmls.upsert({
      where: { comprobanteId: data.comprobante_id },
      create: {
        comprobanteId: data.comprobante_id,
        xmlFirmadoPath: data.xml_firmado_path ?? undefined,
        xmlAutorizadoPath: data.xml_autorizado_path ?? undefined,
      },
      update: {
        ...(data.xml_firmado_path !== undefined && {
          xmlFirmadoPath: data.xml_firmado_path,
        }),
        ...(data.xml_autorizado_path !== undefined && {
          xmlAutorizadoPath: data.xml_autorizado_path,
        }),
      },
    });

    return {
      id: result.id,
      comprobante_id: result.comprobanteId,
      xml_firmado_path: result.xmlFirmadoPath ?? undefined,
      xml_autorizado_path: result.xmlAutorizadoPath ?? undefined,
    };
  }

  async createInfoAdicional(
    items: InfoAdicionalRecord[],
    tx?: Prisma.TransactionClient,
  ): Promise<InfoAdicionalRecord[]> {
    if (items.length === 0) return [];
    const client = tx ?? this.prisma;

    await client.infoAdicional.createMany({
      data: items.map((item) => ({
        comprobanteId: item.comprobante_id,
        nombre: item.nombre,
        valor: item.valor,
      })),
    });

    return items;
  }

  async createDetallesAdicionales(
    items: DetalleAdicionalRecord[],
    tx?: Prisma.TransactionClient,
  ): Promise<DetalleAdicionalRecord[]> {
    if (items.length === 0) return [];
    const client = tx ?? this.prisma;

    await client.detallesAdicionales.createMany({
      data: items.map((item) => ({
        comprobanteDetalleId: item.comprobante_detalle_id,
        nombre: item.nombre,
        valor: item.valor,
      })),
    });

    return items;
  }

  async createMotivosNotaDebito(
    motivos: MotivoNotaDebitoRecord[],
    tx?: Prisma.TransactionClient,
  ): Promise<MotivoNotaDebitoRecord[]> {
    if (motivos.length === 0) return [];
    const client = tx ?? this.prisma;

    await client.motivosNotaDebito.createMany({
      data: motivos.map((m) => ({
        comprobanteId: m.comprobante_id,
        razon: m.razon,
        valor: new Prisma.Decimal(m.valor),
      })),
    });

    return motivos;
  }

  async findDetallesByComprobanteId(comprobanteId: bigint): Promise<any[]> {
    const detalles = await this.prisma.comprobanteDetalles.findMany({
      where: { comprobanteId },
      orderBy: { orden: 'asc' },
    });

    return detalles.map((d) => ({
      id: d.id,
      codigo_principal: d.codigoPrincipal,
      codigo_auxiliar: d.codigoAuxiliar,
      descripcion: d.descripcion,
      cantidad: Number(d.cantidad),
      precio_unitario: Number(d.precioUnitario),
      descuento: Number(d.descuento),
      subtotal: d.precioTotalSinImpuesto
        ? Number(d.precioTotalSinImpuesto)
        : null,
    }));
  }

  async findInfoAdicionalByComprobanteId(
    comprobanteId: bigint,
  ): Promise<any[]> {
    try {
      const rows = await this.prisma.infoAdicional.findMany({
        where: { comprobanteId },
      });
      return rows.map((r) => ({ nombre: r.nombre, valor: r.valor }));
    } catch (error: any) {
      if (error?.code === 'P2021') return [];
      throw error;
    }
  }

  async findXmlAutorizado(comprobanteId: bigint): Promise<string | null> {
    const result = await this.prisma.comprobanteXmls.findUnique({
      where: { comprobanteId },
      select: { xmlAutorizadoPath: true },
    });
    return result?.xmlAutorizadoPath ?? null;
  }

  async findXmlFirmado(comprobanteId: bigint): Promise<string | null> {
    const result = await this.prisma.comprobanteXmls.findUnique({
      where: { comprobanteId },
      select: { xmlFirmadoPath: true },
    });
    return result?.xmlFirmadoPath ?? null;
  }

  async findXmlByComprobanteId(comprobanteId: bigint): Promise<{
    xml_firmado_path?: string;
    xml_autorizado_path?: string;
  } | null> {
    const result = await this.prisma.comprobanteXmls.findUnique({
      where: { comprobanteId },
      select: { xmlFirmadoPath: true, xmlAutorizadoPath: true },
    });

    if (!result) return null;

    return {
      xml_firmado_path: result.xmlFirmadoPath ?? undefined,
      xml_autorizado_path: result.xmlAutorizadoPath ?? undefined,
    };
  }

  async deleteDetallesByComprobanteId(
    id: bigint,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const client = tx ?? this.prisma;
    await client.comprobanteDetalles.deleteMany({
      where: { comprobanteId: id },
    });
  }

  async deletePagosByComprobanteId(
    id: bigint,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const client = tx ?? this.prisma;
    await client.comprobantePagos.deleteMany({
      where: { comprobanteId: id },
    });
  }

  async deleteTotalesByComprobanteId(
    id: bigint,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const client = tx ?? this.prisma;
    await client.comprobanteTotales.deleteMany({
      where: { comprobanteId: id },
    });
  }

  async deleteInfoAdicionalByComprobanteId(
    id: bigint,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const client = tx ?? this.prisma;
    await client.infoAdicional.deleteMany({
      where: { comprobanteId: id },
    });
  }

  async updateEstadoWithLock(
    id: bigint,
    estadoEsperado: string,
    nuevoEstado: string,
    tx?: Prisma.TransactionClient,
  ): Promise<boolean> {
    const client = tx ?? this.prisma;
    const result = await client.comprobantes.updateMany({
      where: { id, estado: estadoEsperado },
      data: { estado: nuevoEstado },
    });
    return result.count > 0;
  }

  async executeTransaction<T>(
    callback: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(callback);
  }

  private mapComprobanteToRecord(c: any): ComprobanteRecord {
    return {
      id: c.id,
      uuid: c.uuid,
      emisor_id: c.emisorId,
      punto_emision_id: c.puntoEmisionId,
      tipo_comprobante: c.tipoComprobante,
      ambiente: c.ambiente,
      tipo_emision: c.tipoEmision,
      secuencial: c.secuencial,
      clave_acceso: c.claveAcceso,
      fecha_emision: c.fechaEmision?.toISOString?.() ?? c.fechaEmision,
      estado: c.estado,
      estado_sri: c.estadoSri ?? undefined,
      fecha_autorizacion: c.fechaAutorizacion?.toISOString?.() ?? undefined,
      numero_autorizacion: c.numeroAutorizacion ?? undefined,
      total_sin_impuestos: c.totalSinImpuestos
        ? Number(c.totalSinImpuestos)
        : undefined,
      total_descuento: c.totalDescuento ? Number(c.totalDescuento) : undefined,
      importe_total: c.importeTotal ? Number(c.importeTotal) : undefined,
      propina: c.propina ? Number(c.propina) : undefined,
      moneda: c.moneda,
      receptor_tipo_identificacion: c.receptorTipoIdentificacion ?? undefined,
      receptor_identificacion: c.receptorIdentificacion ?? undefined,
      receptor_razon_social: c.receptorRazonSocial ?? undefined,
      receptor_direccion: c.receptorDireccion ?? undefined,
      receptor_email: c.receptorEmail ?? undefined,
      receptor_telefono: c.receptorTelefono ?? undefined,
      doc_modificado_tipo: c.docModificadoTipo ?? undefined,
      doc_modificado_numero: c.docModificadoNumero ?? undefined,
      doc_modificado_fecha: c.docModificadoFecha?.toISOString?.() ?? undefined,
      motivo: c.motivo ?? undefined,
      valor_modificacion: c.valorModificacion
        ? Number(c.valorModificacion)
        : undefined,
      rise: c.rise ?? undefined,
      periodo_fiscal: c.periodoFiscal ?? undefined,
      id_referencia_externa: c.idReferenciaExterna ?? undefined,
      tipo_sistema_externo: c.tipoSistemaExterno ?? undefined,
    };
  }
}
