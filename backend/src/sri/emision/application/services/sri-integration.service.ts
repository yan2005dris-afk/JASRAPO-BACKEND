import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { SriService } from './sri.service';
import { EmitirFacturaUseCase } from '../use-cases/emitir-factura.use-case';
import { CreateFacturaDto } from '../../interfaces/dto';
import { TipoIdentificacion, FormaPago } from '../../domain/constants';
import { format } from 'date-fns';
import { ComprobanteRecord } from '../../../domain/interfaces/repository.interface';

@Injectable()
export class SriIntegrationService {
  private readonly logger = new Logger(SriIntegrationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly sriService: SriService,
    private readonly emitirFacturaUseCase: EmitirFacturaUseCase,
  ) {}

  /**
   * Toma una prefactura de JASRAPO y la convierte en una Factura Electrónica en el SRI
   * (flujo legacy — sin comprobante BORRADOR pre-creado)
   */
  async emitirFacturaDesdePrefactura(prefacturaId: number, _emisorId: number) {
    this.logger.log(`Iniciando emisión SRI para prefactura: ${prefacturaId}`);

    const prefactura = await this.prisma.prefacturas.findUnique({
      where: { prefacturaId: BigInt(prefacturaId) },
      include: {
        prefacturaDetalle: { include: { rubro: true } },
        contrato: { include: { cliente: true } },
        puntoEmision: {
          include: {
            establecimiento: { include: { emisor: true } },
          },
        },
      },
    });

    if (!prefactura) {
      throw new NotFoundException(`Prefactura ${prefacturaId} no encontrada`);
    }

    // Use shared helper to build DTO
    const { dto: facturaDto } = this.buildFacturaDtoFromPrefactura(prefactura);

    // Call SRI motor
    const result = await this.sriService.emitirFactura(facturaDto);

    // Update prefactura with comprobanteId
    if (result && 'claveAcceso' in result) {
      const comprobante = await this.prisma.comprobantes.findUnique({
        where: { claveAcceso: result.claveAcceso },
      });

      if (comprobante) {
        await this.prisma.prefacturas.update({
          where: { prefacturaId: BigInt(prefacturaId) },
          data: { comprobanteId: comprobante.id },
        });
      }
    }

    return result;
  }

  /**
   * Emite una factura desde un comprobante ya existente (BORRADOR),
   * buscando la prefactura vinculada para construir el DTO.
   * Usado por el handler FACTURA_DESDE_PREFACTURA en SriEmisionProcessor.
   */
  async emitirDesdeComprobante(comprobanteId: bigint) {
    this.logger.log(
      `Emitiendo factura desde comprobante existente ID: ${comprobanteId}`,
    );

    // 1. Fetch comprobante + find related prefactura
    const prefactura = await this.prisma.prefacturas.findFirst({
      where: { comprobanteId },
      include: {
        prefacturaDetalle: {
          include: { rubro: true },
        },
        contrato: {
          include: { cliente: true },
        },
        puntoEmision: {
          include: {
            establecimiento: {
              include: { emisor: true },
            },
          },
        },
      },
    });

    if (!prefactura) {
      throw new NotFoundException(
        `Prefactura con comprobanteId ${comprobanteId} no encontrada`,
      );
    }

    // 2. Build DTO using shared helper
    const { dto, emisor } = this.buildFacturaDtoFromPrefactura(prefactura);

    // 3. Fetch existing BORRADOR comprobante to pass as comprobanteExistente
    const comprobante = await this.prisma.comprobantes.findUnique({
      where: { id: comprobanteId },
    });

    if (!comprobante) {
      throw new NotFoundException(`Comprobante ${comprobanteId} no encontrado`);
    }

    // 4. Emit using existing comprobante (UPDATE path in persistirFactura).
    // Adapt the Prisma camelCase model to the domain ComprobanteRecord
    // (snake_case) required by EmitirFacturaUseCase.
    const comprobanteExistente = this.toComprobanteRecord(comprobante);

    return this.emitirFacturaUseCase.emitirFactura(dto, {
      comprobanteExistente,
    });
  }

  /**
   * Construye CreateFacturaDto + extrae el emisor desde el modelo de prefactura
   */
  private buildFacturaDtoFromPrefactura(prefactura: any): {
    dto: CreateFacturaDto;
    emisor: any;
  } {
    const emisor = prefactura.puntoEmision.establecimiento.emisor;

    const facturaDto: CreateFacturaDto = {
      fechaEmision: format(prefactura.createdAt, 'dd/MM/yyyy'),
      emisor: {
        ruc: emisor.ruc,
        razonSocial: emisor.razonSocial,
        dirMatriz: emisor.direccionMatriz,
        establecimiento: prefactura.puntoEmision.establecimiento.codigo,
        puntoEmision: prefactura.puntoEmision.codigo,
        obligadoContabilidad: emisor.obligadoContabilidad ? 'SI' : 'NO',
      },
      comprador: {
        tipoIdentificacion: this.mapTipoIdentificacion(
          Number(prefactura.contrato.cliente.tipoIdentificacionId),
        ),
        identificacion: prefactura.contrato.cliente.identificacion,
        razonSocial: `${prefactura.contrato.cliente.nombres} ${prefactura.contrato.cliente.apellidos}`,
        direccion: prefactura.clienteDireccion || 'S/N',
        email: prefactura.clienteEmail || undefined,
      },
      detalles: prefactura.prefacturaDetalle.map((det: any) => ({
        codigoPrincipal: det.rubroId.toString(),
        descripcion: det.rubro.nombre,
        cantidad: Number(det.cantidad),
        precioUnitario: Number(det.precioUnitario),
        descuento: Number(det.descuento),
        impuestos: [
          {
            codigo: '2',
            codigoPorcentaje: '2',
            tarifa: 12,
            baseImponible: Number(det.subtotal),
            valor: Number(det.subtotal) * 0.12,
          },
        ],
      })),
      pagos: [
        {
          formaPago: FormaPago.SIN_UTILIZACION_SISTEMA_FINANCIERO,
          total: Number(prefactura.totalPagar),
        },
      ],
      infoAdicional: [
        { nombre: 'Contrato', valor: prefactura.contratoId.toString() },
      ],
    };

    return { dto: facturaDto, emisor };
  }

  private mapTipoIdentificacion(tipoId: number): TipoIdentificacion {
    // Mapeo según catálogo: 1=RUC('04'), 2=CEDULA('05'), 3=PASAPORTE('06'), 4=CONSUMIDOR_FINAL('07')
    const map: Record<number, TipoIdentificacion> = {
      1: TipoIdentificacion.RUC,
      2: TipoIdentificacion.CEDULA,
      3: TipoIdentificacion.PASAPORTE,
      4: TipoIdentificacion.CONSUMIDOR_FINAL,
    };
    return map[tipoId] || TipoIdentificacion.CEDULA;
  }

  /**
   * Adapt a raw Prisma `comprobantes` row (camelCase) to the domain
   * `ComprobanteRecord` (snake_case) expected by EmitirFacturaUseCase.
   * Mirrors `PrismaComprobanteRepository.mapComprobanteToRecord` so the
   * existing UPDATE-existing-comprobante flow receives the same shape
   * as a CREATE, including `id` and all required fields.
   */
  private toComprobanteRecord(c: any): ComprobanteRecord {
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
