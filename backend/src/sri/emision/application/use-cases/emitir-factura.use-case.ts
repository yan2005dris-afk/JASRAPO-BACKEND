import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Decimal } from 'decimal.js';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from '../../../../shared/domain/exceptions/domain.exception';
import { ClaveAccesoService } from '../../infrastructure/xml/clave-acceso.service';
import { XmlBuilderService } from '../../infrastructure/xml/xml-builder.service';
import { XmlSignerService } from '../../infrastructure/xml/xml-signer.service';
import { SriSoapClient } from '../../infrastructure/soap/sri-soap.client';
import {
  ComprobanteRepository,
  TransactionContext,
} from '../../domain/repositories/comprobante.repository';
import { EmisorRepository } from '../../../emisores/domain/repositories/emisor.repository';
import { SecuencialRepository } from '../../domain/repositories/secuencial.repository';
import { XmlStorageService } from '../../infrastructure/storage/xml-storage.service';
import { SriBaseService } from '../../infrastructure/xml/sri-base.service';
import { CreateFacturaDto, FacturaResponseDto } from '../../interfaces/dto';
import {
  Factura,
  InfoTributaria,
  InfoFactura,
  DetalleFactura,
  TotalImpuesto,
  SriOperationResult,
} from '../../domain/interfaces';
import { TipoComprobante, Ambiente, TipoEmision } from '../../domain/constants';
import { ComprobanteEstado } from '../../domain/constants/comprobante-estado.enum';
import { ComprobanteRecord } from '../../../domain/interfaces/repository.interface';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { LogContext } from 'src/shared/decorators/log-context.decorator';

export interface EmitirFacturaOpts {
  comprobanteExistente?: ComprobanteRecord;
}

@LogContext()
@Injectable()
export class EmitirFacturaUseCase {
  constructor(
    private readonly claveAccesoService: ClaveAccesoService,
    private readonly xmlBuilderService: XmlBuilderService,
    private readonly xmlSignerService: XmlSignerService,
    private readonly sriSoapClient: SriSoapClient,
    private readonly comprobanteRepository: ComprobanteRepository,
    private readonly emisorRepository: EmisorRepository,
    private readonly secuencialRepository: SecuencialRepository,
    private readonly xmlStorage: XmlStorageService,
    private readonly base: SriBaseService,
    private readonly eventEmitter: EventEmitter2,
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Emite una factura electrónica al SRI.
   * Flujo en 3 fases:
   * 1. Reserva secuencial en transacción DB (~5ms)
   * 2. Firma + envío SOAP al SRI fuera de transacción
   * 3. Persistencia de resultado en transacción DB (~10ms)
   */
  async emitirFactura(
    dto: CreateFacturaDto,
    opts: EmitirFacturaOpts = {},
  ): Promise<FacturaResponseDto> {
    this.logger.log(
      `Iniciando emisión de factura para emisor: ${dto.emisor.ruc}`,
    );

    try {
      // Validar fecha de emisión
      this.base.validarFechaEmision(dto.fechaEmision);

      // Validaciones previas básicas contra catálogo
      const [, , , emisor] = await Promise.all([
        this.base.validarTipoIdentificacionCatalogo(
          dto.comprador.tipoIdentificacion,
        ),
        this.base.validarImpuestosDetalles(dto.detalles),
        dto.pagos && dto.pagos.length > 0
          ? this.base.validarFormasPagoCatalogo(dto.pagos)
          : Promise.resolve(),
        this.emisorRepository.findByRuc(dto.emisor.ruc),
      ]);

      if (!emisor) {
        throw new EntityNotFoundException('Emisor', dto.emisor.ruc);
      }

      // Validación preventiva legal SRI: Negocio RIMPE
      if (emisor.contribuyente_rimpe) {
        const hasTarifaInvalida = dto.detalles.some((d) =>
          d.impuestos.some(
            (i) =>
              i.codigo === '2' &&
              i.codigoPorcentaje !== '0' &&
              i.tarifa > 0 &&
              i.codigoPorcentaje !== '4',
          ),
        );
        if (hasTarifaInvalida) {
          this.logger.warn(
            `Emisor ${dto.emisor.ruc} es RIMPE pero incluye detalle con tarifa no permitida`,
          );
        }
      }

      // Variables de configuración
      const ambiente = dto.ambiente || this.base.getDefaultAmbiente();
      const tipoEmision = dto.tipoEmision || TipoEmision.NORMAL;
      const [day, month, year] = dto.fechaEmision.split('/');
      const fechaEmision = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
      );

      // Buscar punto de emisión
      const puntoEmisionInfo = await this.emisorRepository.findPuntoEmision(
        emisor.id,
        dto.emisor.establecimiento,
        dto.emisor.puntoEmision,
      );

      if (!puntoEmisionInfo) {
        throw new InvalidDomainOperationException(
          `El punto de emisión ${dto.emisor.establecimiento}-${dto.emisor.puntoEmision} no está registrado para el emisor ${dto.emisor.ruc}`,
        );
      }

      // ─── FASE 1: Transacción corta (~5ms) — Solo reservar secuencial si no existe ───
      let secuencial: string;
      let claveAcceso: string;

      if (
        opts?.comprobanteExistente?.secuencial &&
        opts?.comprobanteExistente?.clave_acceso
      ) {
        // Idempotencia en reintentos de emisión: reutilizar secuencial y clave_acceso ya asignados
        secuencial = opts.comprobanteExistente.secuencial;
        claveAcceso = opts.comprobanteExistente.clave_acceso;
      } else if (dto.secuencial) {
        secuencial = dto.secuencial.padStart(9, '0');
        claveAcceso = this.claveAccesoService.generate({
          fechaEmision,
          tipoComprobante: TipoComprobante.FACTURA,
          ruc: dto.emisor.ruc,
          ambiente,
          establecimiento: dto.emisor.establecimiento,
          puntoEmision: dto.emisor.puntoEmision,
          secuencial,
          tipoEmision,
        });
      } else {
        secuencial = await this.comprobanteRepository.executeTransaction(
          async (tx) => {
            return this.secuencialRepository.getNextSecuencial(
              puntoEmisionInfo.punto_emision_id,
              TipoComprobante.FACTURA,
              tx,
            );
          },
        );
        claveAcceso = this.claveAccesoService.generate({
          fechaEmision,
          tipoComprobante: TipoComprobante.FACTURA,
          ruc: dto.emisor.ruc,
          ambiente,
          establecimiento: dto.emisor.establecimiento,
          puntoEmision: dto.emisor.puntoEmision,
          secuencial,
          tipoEmision,
        });
      }

      const factura = this.buildFacturaFromDto(
        dto,
        claveAcceso,
        secuencial,
        ambiente,
        tipoEmision,
      );
      const xml = this.xmlBuilderService.buildFactura(factura);

      // Verificar certificado
      if (
        !emisor.certificado_nombre ||
        !emisor.certificado_password_encrypted
      ) {
        throw new InvalidDomainOperationException(
          `El emisor con RUC ${dto.emisor.ruc} no tiene certificado digital configurado. ` +
            'Use el endpoint POST /certificates/upload-cert con el RUC para vincular un certificado P12.',
        );
      }

      // Firmar XML
      const xmlFirmado = await this.xmlSignerService.signXmlForEmisor(
        xml,
        dto.emisor.ruc,
      );

      // Validar firma antes de enviar
      const esFirmaValida =
        await this.xmlSignerService.verifySignature(xmlFirmado);
      if (!esFirmaValida) {
        throw new InvalidDomainOperationException(
          'La firma del XML generado no es válida. Verifique el certificado del emisor.',
        );
      }

      // ─── FASE 2.5: Persistencia inicial en estado FIRMADO ───
      const comprobante = await this.comprobanteRepository.executeTransaction(
        async (tx) => {
          return await this.persistirFactura(
            dto,
            factura,
            emisor.id,
            puntoEmisionInfo.punto_emision_id,
            claveAcceso,
            secuencial,
            ambiente,
            tipoEmision,
            xml,
            xmlFirmado,
            {
              success: false,
              claveAcceso,
              estado: ComprobanteEstado.FIRMADO,
              mensajes: [],
            },
            tx,
            opts?.comprobanteExistente,
          );
        },
      );

      // Enviar y autorizar en SRI (puede tardar 2-10 segundos — sin bloquear DB)
      let resultado: SriOperationResult;
      try {
        resultado = await this.sriSoapClient.enviarYAutorizar(
          xmlFirmado,
          claveAcceso,
        );
      } catch (error) {
        // El SRI no respondió — el registro ya existe como FIRMADO
        this.logger.warn(
          `SRI no respondió para factura ${claveAcceso}: ${error.message}`,
        );
        throw error;
      }

      // ─── FASE 3: Transacción corta (~5ms) — Actualizar resultado ───
      await this.comprobanteRepository.update(comprobante.id, {
        estado: resultado.success
          ? ComprobanteEstado.AUTORIZADO
          : resultado.estado,
        estado_sri: resultado.estado,
        fecha_autorizacion: resultado.fechaAutorizacion,
        numero_autorizacion: resultado.numeroAutorizacion || claveAcceso,
      });

      // Si fue autorizado, guardar el XML autorizado
      if (resultado.xmlAutorizado) {
        const xmlPaths = await this.xmlStorage.saveAllXmls(
          dto.emisor.ruc,
          claveAcceso,
          fechaEmision,
          undefined,
          undefined,
          resultado.xmlAutorizado,
        );
        await this.comprobanteRepository.saveXml({
          comprobante_id: comprobante.id!,
          xml_autorizado_path: xmlPaths.autorizadoKey,
        });
      }

      // 4. Emitir eventos para Webhooks
      if (
        resultado.success ||
        resultado.estado === ComprobanteEstado.AUTORIZADO
      ) {
        this.eventEmitter.emit('comprobante.autorizado', {
          emisorId: emisor?.id,
          claveAcceso,
          tipoComprobante: TipoComprobante.FACTURA,
          secuencial,
          fechaAutorizacion: resultado.fechaAutorizacion,
          numeroAutorizacion: resultado.numeroAutorizacion,
        });
      } else if (
        resultado.estado === ComprobanteEstado.RECHAZADO ||
        resultado.estado === ComprobanteEstado.DEVUELTA
      ) {
        this.eventEmitter.emit('comprobante.rechazado', {
          emisorId: emisor?.id,
          claveAcceso,
          tipoComprobante: TipoComprobante.FACTURA,
          estado: resultado.estado,
          mensajes: resultado.mensajes,
        });
      }

      return this.mapResultToResponse(resultado);
    } catch (error) {
      this.logger.error(`Error al emitir factura: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Genera XML preview de factura sin firmar ni enviar
   */
  generarXmlPreview(dto: CreateFacturaDto): string {
    if (!dto.secuencial) {
      throw new InvalidDomainOperationException(
        'Para preview, el secuencial es obligatorio',
      );
    }
    const secuencial = dto.secuencial.padStart(9, '0');

    const ambiente = dto.ambiente || this.base.getDefaultAmbiente();
    const tipoEmision = dto.tipoEmision || TipoEmision.NORMAL;

    const [day, month, year] = dto.fechaEmision.split('/');
    const fechaEmision = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
    );

    const claveAcceso = this.claveAccesoService.generate({
      fechaEmision,
      tipoComprobante: TipoComprobante.FACTURA,
      ruc: dto.emisor.ruc,
      ambiente,
      establecimiento: dto.emisor.establecimiento,
      puntoEmision: dto.emisor.puntoEmision,
      secuencial,
      tipoEmision,
    });

    const factura = this.buildFacturaFromDto(
      dto,
      claveAcceso,
      secuencial,
      ambiente,
      tipoEmision,
    );
    return this.xmlBuilderService.buildFactura(factura);
  }

  /**
   * Genera XML firmado para debugging sin enviarlo al SRI
   */
  async generarFacturaFirmadaDebug(dto: CreateFacturaDto): Promise<{
    claveAcceso: string;
    xmlSinFirma: string;
    xmlFirmado: string;
  }> {
    this.logger.log('Generando factura firmada para debug');

    if (!dto.secuencial) {
      throw new InvalidDomainOperationException(
        'Para debug, el secuencial es obligatorio',
      );
    }
    const secuencial = dto.secuencial.padStart(9, '0');

    const ambiente = dto.ambiente || this.base.getDefaultAmbiente();
    const tipoEmision = dto.tipoEmision || TipoEmision.NORMAL;

    const [day, month, year] = dto.fechaEmision.split('/');
    const fechaEmision = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
    );

    const claveAcceso = this.claveAccesoService.generate({
      fechaEmision,
      tipoComprobante: TipoComprobante.FACTURA,
      ruc: dto.emisor.ruc,
      ambiente,
      establecimiento: dto.emisor.establecimiento,
      puntoEmision: dto.emisor.puntoEmision,
      secuencial,
      tipoEmision,
    });

    const factura = this.buildFacturaFromDto(
      dto,
      claveAcceso,
      secuencial,
      ambiente,
      tipoEmision,
    );
    const xmlSinFirma = this.xmlBuilderService.buildFactura(factura);

    // Debug method - use emisor certificate from DB
    const xmlFirmado = await this.xmlSignerService.signXmlForEmisor(
      xmlSinFirma,
      dto.emisor.ruc,
    );

    // Validar firma, igual que en los flujos de emisión reales
    const esFirmaValida =
      await this.xmlSignerService.verifySignature(xmlFirmado);
    if (!esFirmaValida) {
      throw new InvalidDomainOperationException(
        'La firma del XML generado no es válida. Verifique el certificado del emisor.',
      );
    }

    return {
      claveAcceso,
      xmlSinFirma,
      xmlFirmado,
    };
  }

  /**
   * Persists factura and all related data to database
   * If comprobanteExistente is provided, UPDATE + deleteChildren + insertChildren
   * Otherwise, CREATE a new comprobante record
   */
  private async persistirFactura(
    dto: CreateFacturaDto,
    factura: Factura,
    emisorId: number,
    puntoEmisionId: number,
    claveAcceso: string,
    secuencial: string,
    ambiente: string,
    tipoEmision: string,
    xmlSinFirma: string,
    xmlFirmado: string,
    resultado: SriOperationResult,
    tx: TransactionContext,
    comprobanteExistente?: ComprobanteRecord,
  ): Promise<any> {
    try {
      const comprobanteData = {
        emisor_id: emisorId,
        punto_emision_id: puntoEmisionId,
        tipo_comprobante: TipoComprobante.FACTURA,
        ambiente,
        tipo_emision: tipoEmision,
        secuencial: secuencial,
        clave_acceso: claveAcceso,
        fecha_emision: dto.fechaEmision.split('/').reverse().join('-'),
        estado: resultado.success
          ? ComprobanteEstado.AUTORIZADO
          : resultado.estado,
        estado_sri: resultado.estado,
        fecha_autorizacion: resultado.fechaAutorizacion,
        numero_autorizacion: resultado.numeroAutorizacion || claveAcceso,
        total_sin_impuestos: factura.infoFactura.totalSinImpuestos,
        total_descuento: factura.infoFactura.totalDescuento,
        importe_total: factura.infoFactura.importeTotal,
        propina: factura.infoFactura.propina,
        moneda: factura.infoFactura.moneda,
        receptor_tipo_identificacion: dto.comprador.tipoIdentificacion,
        receptor_identificacion: dto.comprador.identificacion,
        receptor_razon_social: dto.comprador.razonSocial,
        receptor_direccion: dto.comprador.direccion,
        receptor_email: dto.comprador.email,
        receptor_telefono: dto.comprador.telefono,
      };

      let comprobante: any;

      if (comprobanteExistente) {
        // Branch: UPDATE existing comprobante + delete + insert children
        const existingId = comprobanteExistente.id!;
        comprobante = await this.comprobanteRepository.update(
          existingId,
          comprobanteData,
          tx,
        );

        // Delete all children before re-creating them
        await this.comprobanteRepository.deleteDetallesByComprobanteId(
          existingId,
          tx,
        );
        await this.comprobanteRepository.deletePagosByComprobanteId(
          existingId,
          tx,
        );
        await this.comprobanteRepository.deleteTotalesByComprobanteId(
          existingId,
          tx,
        );
        await this.comprobanteRepository.deleteInfoAdicionalByComprobanteId(
          existingId,
          tx,
        );

        this.logger.log(
          `Comprobante actualizado con ID: ${existingId} (children re-created)`,
        );
      } else {
        // Branch: CREATE new comprobante record
        comprobante = await this.comprobanteRepository.create(
          comprobanteData,
          tx,
        );
        this.logger.log(`Comprobante creado con ID: ${comprobante.id}`);
      }

      // 2. Create detalles and their impuestos
      for (let i = 0; i < factura.detalles.length; i++) {
        const det = factura.detalles[i];
        const detalleRecords = await this.comprobanteRepository.createDetalles(
          [
            {
              comprobante_id: comprobante.id!,
              codigo_principal: det.codigoPrincipal,
              codigo_auxiliar: det.codigoAuxiliar,
              descripcion: det.descripcion,
              unidad_medida: det.unidadMedida,
              cantidad: det.cantidad,
              precio_unitario: det.precioUnitario,
              descuento: det.descuento,
              precio_total_sin_impuesto: det.precioTotalSinImpuesto,
              orden: i,
            },
          ],
          tx,
        );

        const detalleId = detalleRecords[0].id!;

        // Create impuestos for this detalle
        if (det.impuestos && det.impuestos.length > 0) {
          await this.comprobanteRepository.createImpuestos(
            det.impuestos.map((imp) => ({
              comprobante_detalle_id: detalleId,
              codigo: imp.codigo,
              codigo_porcentaje: imp.codigoPorcentaje,
              tarifa: imp.tarifa,
              base_imponible: imp.baseImponible,
              valor: imp.valor,
            })),
            tx,
          );
        }

        // Create detalles adicionales
        if (det.detallesAdicionales && det.detallesAdicionales.length > 0) {
          await this.comprobanteRepository.createDetallesAdicionales(
            det.detallesAdicionales.map((da) => ({
              comprobante_detalle_id: detalleId,
              nombre: da.nombre,
              valor: da.valor,
            })),
            tx,
          );
        }
      }

      // 3. Create totales (totalConImpuestos)
      if (factura.infoFactura.totalConImpuestos) {
        await this.comprobanteRepository.createTotales(
          factura.infoFactura.totalConImpuestos.map((tot) => ({
            comprobante_id: comprobante.id!,
            codigo: tot.codigo,
            codigo_porcentaje: tot.codigoPorcentaje,
            descuento_adicional: tot.descuentoAdicional,
            base_imponible: tot.baseImponible,
            tarifa: tot.tarifa,
            valor: tot.valor,
            valor_devolucion_iva: tot.valorDevolucionIva,
          })),
          tx,
        );
      }

      // 4. Create pagos
      if (factura.infoFactura.pagos) {
        await this.comprobanteRepository.createPagos(
          factura.infoFactura.pagos.map((pago) => ({
            comprobante_id: comprobante.id!,
            forma_pago: pago.formaPago,
            total: pago.total,
            plazo: pago.plazo,
            unidad_tiempo: pago.unidadTiempo,
          })),
          tx,
        );
      }

      // 5. Save signed XML always (needed for retry), authorized only if authorized
      const fechaEmision = new Date(
        parseInt(dto.fechaEmision.split('/')[2]),
        parseInt(dto.fechaEmision.split('/')[1]) - 1,
        parseInt(dto.fechaEmision.split('/')[0]),
      );
      const xmlPaths = await this.xmlStorage.saveAllXmls(
        dto.emisor.ruc,
        claveAcceso,
        fechaEmision,
        undefined, // sin_firma - not needed
        xmlFirmado, // firmado - always save for retry
        resultado.xmlAutorizado, // autorizado - only if success
      );
      await this.comprobanteRepository.saveXml(
        {
          comprobante_id: comprobante.id!,
          xml_firmado_path: xmlPaths.firmadoKey,
          xml_autorizado_path: xmlPaths.autorizadoKey,
        },
        tx,
      );

      // 6. Create info adicional
      if (dto.infoAdicional && dto.infoAdicional.length > 0) {
        await this.comprobanteRepository.createInfoAdicional(
          dto.infoAdicional.map((info) => ({
            comprobante_id: comprobante.id!,
            nombre: info.nombre,
            valor: info.valor,
          })),
          tx,
        );
      }

      this.logger.log(`Factura ${claveAcceso} persistida correctamente`);
      return comprobante;
    } catch (error) {
      this.logger.error(
        `CRÍTICO: Factura ${claveAcceso} autorizada por SRI pero NO persistida: ${(error as Error).message}`,
      );

      // Emitir evento de alerta para reconciliación posterior
      this.eventEmitter.emit('comprobante.persistencia_fallida', {
        claveAcceso,
        emisorRuc: dto.emisor.ruc,
        tipoComprobante: TipoComprobante.FACTURA,
        error: (error as Error).message,
        timestamp: new Date(),
      });
      throw error;
    }
  }

  /**
   * Construye objeto Factura a partir del DTO
   */
  private buildFacturaFromDto(
    dto: CreateFacturaDto,
    claveAcceso: string,
    secuencial: string,
    ambiente: Ambiente,
    tipoEmision: TipoEmision,
  ): Factura {
    const detalles = this.buildDetalles(dto.detalles);
    const {
      totalSinImpuestos,
      totalDescuento,
      totalConImpuestos,
      importeTotal,
    } = this.calculateTotales(detalles);

    const infoTributaria: InfoTributaria = {
      ambiente,
      tipoEmision,
      razonSocial: dto.emisor.razonSocial,
      nombreComercial: dto.emisor.nombreComercial,
      ruc: dto.emisor.ruc,
      claveAcceso,
      codDoc: TipoComprobante.FACTURA,
      estab: dto.emisor.establecimiento.padStart(3, '0'),
      ptoEmi: dto.emisor.puntoEmision.padStart(3, '0'),
      secuencial: secuencial.padStart(9, '0'),
      dirMatriz: dto.emisor.dirMatriz,
      agenteRetencion: dto.emisor.agenteRetencion,
      contribuyenteRimpe: dto.emisor.contribuyenteRimpe,
    };

    const infoFactura: InfoFactura = {
      fechaEmision: dto.fechaEmision,
      dirEstablecimiento: dto.emisor.dirEstablecimiento,
      contribuyenteEspecial: dto.emisor.contribuyenteEspecial,
      obligadoContabilidad: dto.emisor.obligadoContabilidad,
      tipoIdentificacionComprador: dto.comprador.tipoIdentificacion,
      razonSocialComprador: dto.comprador.razonSocial,
      identificacionComprador: dto.comprador.identificacion,
      direccionComprador: dto.comprador.direccion,
      totalSinImpuestos,
      totalDescuento,
      totalConImpuestos,
      importeTotal,
      moneda: 'DOLAR',
      pagos: dto.pagos.map((p) => ({
        formaPago: p.formaPago,
        total: p.total,
        plazo: p.plazo,
        unidadTiempo: p.unidadTiempo,
      })),
    };

    const factura: Factura = {
      infoTributaria,
      infoFactura,
      detalles,
    };

    const infoAdicional: any[] = [];

    // Mandatory field: SRI requires the software provider's RUC in every voucher.
    const developerRuc = this.configService.get<string>('SRI_DEVELOPER_RUC');
    if (developerRuc) {
      infoAdicional.push({ nombre: 'RUC Proveedor', valor: developerRuc });
    }

    if (dto.comprador.email) {
      infoAdicional.push({ nombre: 'email', valor: dto.comprador.email });
    }
    if (dto.comprador.telefono) {
      infoAdicional.push({ nombre: 'telefono', valor: dto.comprador.telefono });
    }
    if (dto.comprador.direccion) {
      infoAdicional.push({
        nombre: 'direccion',
        valor: dto.comprador.direccion,
      });
    }

    if (dto.infoAdicional) {
      infoAdicional.push(...dto.infoAdicional);
    }

    if (infoAdicional.length > 0) {
      factura.infoAdicional = infoAdicional;
    }

    return factura;
  }

  private buildDetalles(
    dtoDetalles: CreateFacturaDto['detalles'],
  ): DetalleFactura[] {
    return dtoDetalles.map((d) => {
      const subtotal = d.cantidad * d.precioUnitario;
      if (d.descuento > subtotal) {
        throw new InvalidDomainOperationException(
          `Descuento (${d.descuento}) no puede ser mayor al subtotal del detalle (${subtotal})`,
        );
      }
      const precioTotalSinImpuesto = subtotal - d.descuento;

      return {
        codigoPrincipal: d.codigoPrincipal,
        codigoAuxiliar: d.codigoAuxiliar,
        descripcion: d.descripcion,
        unidadMedida: d.unidadMedida,
        cantidad: d.cantidad,
        precioUnitario: d.precioUnitario,
        descuento: d.descuento,
        precioTotalSinImpuesto,
        detallesAdicionales: d.detallesAdicionales,
        impuestos: d.impuestos.map((imp) => ({
          codigo: imp.codigo,
          codigoPorcentaje: imp.codigoPorcentaje,
          tarifa: imp.tarifa,
          baseImponible: imp.baseImponible,
          valor: imp.valor,
        })),
      };
    });
  }

  private calculateTotales(detalles: DetalleFactura[]): {
    totalSinImpuestos: number;
    totalDescuento: number;
    totalConImpuestos: TotalImpuesto[];
    importeTotal: number;
  } {
    let totalSinImpuestos = new Decimal(0);
    let totalDescuento = new Decimal(0);
    const impuestosMap = new Map<
      string,
      {
        codigo: string;
        codigoPorcentaje: string;
        tarifa: number;
        baseImponible: Decimal;
        valor: Decimal;
      }
    >();

    detalles.forEach((detalle) => {
      totalSinImpuestos = totalSinImpuestos.plus(
        new Decimal(detalle.precioTotalSinImpuesto),
      );
      totalDescuento = totalDescuento.plus(new Decimal(detalle.descuento));

      detalle.impuestos.forEach((imp) => {
        const key = `${imp.codigo}-${imp.codigoPorcentaje}`;
        const existing = impuestosMap.get(key);

        if (existing) {
          existing.baseImponible = existing.baseImponible.plus(
            new Decimal(imp.baseImponible),
          );
          existing.valor = existing.valor.plus(new Decimal(imp.valor));
        } else {
          impuestosMap.set(key, {
            codigo: imp.codigo,
            codigoPorcentaje: imp.codigoPorcentaje,
            tarifa: imp.tarifa,
            baseImponible: new Decimal(imp.baseImponible),
            valor: new Decimal(imp.valor),
          });
        }
      });
    });

    const totalConImpuestos: TotalImpuesto[] = Array.from(
      impuestosMap.values(),
    ).map((imp) => ({
      ...imp,
      baseImponible: imp.baseImponible.toDecimalPlaces(2).toNumber(),
      valor: imp.valor.toDecimalPlaces(2).toNumber(),
    }));

    const totalImpuestos = totalConImpuestos.reduce(
      (sum, imp) => sum.plus(new Decimal(imp.valor)),
      new Decimal(0),
    );
    const importeTotal = totalSinImpuestos.plus(totalImpuestos);

    return {
      totalSinImpuestos: totalSinImpuestos.toDecimalPlaces(2).toNumber(),
      totalDescuento: totalDescuento.toDecimalPlaces(2).toNumber(),
      totalConImpuestos,
      importeTotal: importeTotal.toDecimalPlaces(2).toNumber(),
    };
  }

  mapResultToResponse(result: SriOperationResult): FacturaResponseDto {
    return {
      success: result.success,
      claveAcceso: result.claveAcceso,
      estado: result.estado,
      fechaAutorizacion: result.fechaAutorizacion,
      numeroAutorizacion: result.numeroAutorizacion,
      xmlAutorizado: result.xmlAutorizado,
      mensajes: result.mensajes,
    };
  }
}
