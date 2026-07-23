import { Injectable, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ClaveAccesoService } from '../../infrastructure/xml/clave-acceso.service';
import { XmlBuilderService } from '../../infrastructure/xml/xml-builder.service';
import { XmlSignerService } from '../../infrastructure/xml/xml-signer.service';
import { SriSoapClient } from '../../infrastructure/soap/sri-soap.client';
import { ComprobanteRepository } from '../../domain/repositories/comprobante.repository';
import { EmisorRepository } from '../../../emisores/domain/repositories/emisor.repository';
import { SecuencialRepository } from '../../domain/repositories/secuencial.repository';
import { XmlStorageService } from '../../infrastructure/storage/xml-storage.service';
import { SriBaseService } from '../../infrastructure/xml/sri-base.service';
import { CreateRetencionDto, RetencionResponseDto } from '../../interfaces/dto';
import {
  InfoTributaria,
  Retencion,
  InfoRetencion,
  ImpuestoRetenido,
  SriOperationResult,
} from '../../domain/interfaces';
import { TipoComprobante, Ambiente, TipoEmision } from '../../domain/constants';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { LogContext } from 'src/shared/decorators/log-context.decorator';

@LogContext()
@Injectable()
export class EmitirRetencionUseCase {
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
  ) {}

  /**
   * Emite un Comprobante de Retención electrónico
   */
  async emitirRetencion(
    dto: CreateRetencionDto,
  ): Promise<RetencionResponseDto> {
    this.logger.log('Iniciando emisión de comprobante de retención');

    try {
      // Validar identificación del sujeto retenido
      this.base.validarIdentificacion(
        dto.sujetoRetenido.tipoIdentificacion,
        dto.sujetoRetenido.identificacion,
        'sujeto retenido',
      );

      // Validar tipo de identificación contra catálogo
      await this.base.validarTipoIdentificacionCatalogo(
        dto.sujetoRetenido.tipoIdentificacion,
      );

      // Validar códigos de retención contra catálogo
      await this.base.validarRetencionesCatalogo(dto.impuestos);

      // Validar documento sustento contra catálogo
      for (const imp of dto.impuestos) {
        await this.base.validarDocumentoSustentoCatalogo(imp.codDocSustento);
      }

      const ambiente = dto.ambiente || this.base.getDefaultAmbiente();
      const tipoEmision = dto.tipoEmision || TipoEmision.NORMAL;

      // Get emisor info from database
      const emisor = await this.emisorRepository.findByRuc(dto.emisor.ruc);
      if (!emisor) {
        throw new BadRequestException(
          `El emisor con RUC ${dto.emisor.ruc} no está registrado en el sistema`,
        );
      }

      const puntoEmisionInfo = await this.emisorRepository.findPuntoEmision(
        emisor.id,
        dto.emisor.establecimiento,
        dto.emisor.puntoEmision,
      );

      if (!puntoEmisionInfo) {
        throw new BadRequestException(
          `El punto de emisión ${dto.emisor.establecimiento}-${dto.emisor.puntoEmision} no está registrado para el emisor ${dto.emisor.ruc}`,
        );
      }

      // Handle secuencial - auto-generate if not provided
      let secuencial: string;
      if (dto.secuencial) {
        secuencial = dto.secuencial.padStart(9, '0');
        this.logger.log(`Usando secuencial RET proporcionado: ${secuencial}`);
      } else {
        const nextSecuencial =
          await this.secuencialRepository.getNextSecuencial(
            puntoEmisionInfo.punto_emision_id,
            TipoComprobante.COMPROBANTE_RETENCION,
          );
        secuencial = nextSecuencial;
        this.logger.log(`Secuencial RET auto-generado: ${secuencial}`);
      }

      const [day, month, year] = dto.fechaEmision.split('/');
      const fechaEmision = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
      );

      const claveAcceso = this.claveAccesoService.generate({
        fechaEmision,
        tipoComprobante: TipoComprobante.COMPROBANTE_RETENCION,
        ruc: dto.emisor.ruc,
        ambiente,
        establecimiento: dto.emisor.establecimiento,
        puntoEmision: dto.emisor.puntoEmision,
        secuencial,
        tipoEmision,
      });

      this.logger.log(`Clave de acceso RET generada: ${claveAcceso}`);

      const retencion = this.buildRetencionFromDto(
        dto,
        claveAcceso,
        secuencial,
        ambiente,
        tipoEmision,
      );
      const xml = this.xmlBuilderService.buildRetencion(retencion);
      this.logger.log('XML de comprobante de retención generado');

      // Verify emisor has certificate in database
      if (
        !emisor.certificado_nombre ||
        !emisor.certificado_password_encrypted
      ) {
        throw new BadRequestException(
          `El emisor ${dto.emisor.ruc} no tiene certificado P12 configurado. ` +
            `Use el endpoint POST /emisores/:id/certificado para subir el certificado.`,
        );
      }

      this.logger.log(
        `Firmando RET con certificado del emisor: ${emisor.certificado_nombre}`,
      );
      const xmlFirmado = await this.xmlSignerService.signXmlForEmisor(
        xml,
        dto.emisor.ruc,
      );
      this.logger.log('XML de comprobante de retención firmado con XAdES-BES');

      // Validar firma antes de enviar
      const esFirmaValida =
        await this.xmlSignerService.verifySignature(xmlFirmado);
      if (!esFirmaValida) {
        throw new BadRequestException(
          'La firma del XML generado no es válida. Verifique el certificado del emisor.',
        );
      }

      // 1. Persistencia inicial en estado FIRMADO (antes de llamar al SRI)
      const comprobante = await this.persistirRetencion(
        dto,
        retencion,
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
          estado: 'FIRMADO',
          claveAcceso,
          mensajes: [],
        },
      );

      // 2. Llamada al SRI
      const resultado = await this.sriSoapClient.enviarYAutorizar(
        xmlFirmado,
        claveAcceso,
      );

      // 3. Actualización de estado final en BD
      await this.comprobanteRepository.update(comprobante.id, {
        estado: resultado.success ? 'AUTORIZADO' : resultado.estado,
        estado_sri: resultado.estado,
        fecha_autorizacion: resultado.fechaAutorizacion,
        numero_autorizacion: resultado.numeroAutorizacion || claveAcceso,
      });

      // 4. Si fue autorizado, guardar el XML autorizado
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

      return this.mapResultToRetencionResponse(resultado);
    } catch (error) {
      this.logger.error(
        `Error al emitir comprobante de retención: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  /**
   * Persists Retención and all related data to database
   */
  private async persistirRetencion(
    dto: CreateRetencionDto,
    retencion: Retencion,
    emisorId: number,
    puntoEmisionId: number,
    claveAcceso: string,
    secuencial: string,
    ambiente: string,
    tipoEmision: string,
    xmlSinFirma: string,
    xmlFirmado: string,
    resultado: SriOperationResult,
  ): Promise<any> {
    try {
      return await this.comprobanteRepository.executeTransaction(async (tx) => {
        // 1. Create main comprobante record
        const comprobante = await this.comprobanteRepository.create(
          {
            emisor_id: emisorId,
            punto_emision_id: puntoEmisionId,
            tipo_comprobante: TipoComprobante.COMPROBANTE_RETENCION,
            ambiente,
            tipo_emision: tipoEmision,
            secuencial,
            clave_acceso: claveAcceso,
            fecha_emision: dto.fechaEmision.split('/').reverse().join('-'),
            estado: resultado.estado,
            estado_sri: resultado.estado,
            fecha_autorizacion: resultado.fechaAutorizacion,
            numero_autorizacion: resultado.numeroAutorizacion || claveAcceso,
            receptor_tipo_identificacion: dto.sujetoRetenido.tipoIdentificacion,
            receptor_identificacion: dto.sujetoRetenido.identificacion,
            receptor_razon_social: dto.sujetoRetenido.razonSocial,
            receptor_email: dto.sujetoRetenido.email,
            periodo_fiscal: dto.periodoFiscal,
          },
          tx,
        );

        this.logger.log(`Retención creada con ID: ${comprobante.id}`);

        // 2. Create retenciones in comprobante_retenciones table
        if (retencion.impuestos && retencion.impuestos.length > 0) {
          const retencionesRecords =
            await this.comprobanteRepository.createRetenciones(
              retencion.impuestos.map((imp) => ({
                comprobante_id: comprobante.id!,
                codigo: imp.codigo,
                codigo_retencion: imp.codigoRetencion,
                base_imponible: imp.baseImponible,
                porcentaje_retener: imp.porcentajeRetener,
                valor_retenido: imp.valorRetenido,
                cod_doc_sustento: imp.codDocSustento,
                num_doc_sustento: imp.numDocSustento,
                fecha_emision_doc_sustento: imp.fechaEmisionDocSustento
                  ?.split('/')
                  .reverse()
                  .join('-'),
                total_sin_impuestos: imp.totalSinImpuestos,
                importe_total: imp.importeTotal,
                pago_loc_ext: imp.pagoLocExt,
              })),
              tx,
            );

          // Create impuestos de sustento for each retencion record
          for (let i = 0; i < retencion.impuestos.length; i++) {
            const imp = retencion.impuestos[i];
            const retRecord = retencionesRecords[i];

            if (
              imp.impuestosDocSustento &&
              imp.impuestosDocSustento.length > 0
            ) {
              await this.comprobanteRepository.createImpuestosDocSustento(
                imp.impuestosDocSustento.map((ids) => ({
                  comprobante_retencion_id: retRecord.id!,
                  cod_impuesto_doc_sustento: ids.codImpuestoDocSustento,
                  codigo_porcentaje: ids.codigoPorcentaje,
                  base_imponible: ids.baseImponible,
                  tarifa: ids.tarifa,
                  valor_impuesto: ids.valorImpuesto,
                })),
                tx,
              );
            }
          }
        }

        // 3. Save signed XML always (needed for retry), authorized only if authorized
        const fechaEmision = new Date(
          parseInt(dto.fechaEmision.split('/')[2]),
          parseInt(dto.fechaEmision.split('/')[1]) - 1,
          parseInt(dto.fechaEmision.split('/')[0]),
        );
        const xmlPaths = await this.xmlStorage.saveAllXmls(
          dto.emisor.ruc,
          claveAcceso,
          fechaEmision,
          undefined,
          xmlFirmado, // firmado - always save for retry
          resultado.xmlAutorizado,
        );
        await this.comprobanteRepository.saveXml(
          {
            comprobante_id: comprobante.id!,
            xml_firmado_path: xmlPaths.firmadoKey,
            xml_autorizado_path: xmlPaths.autorizadoKey,
          },
          tx,
        );

        // 4. Create info adicional
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

        this.logger.log(`Retención ${claveAcceso} persistida correctamente`);

        return comprobante;
      });
    } catch (error) {
      this.logger.error(
        `CRÍTICO: RET ${claveAcceso} autorizada por SRI pero NO persistida: ${(error as Error).message}`,
      );
      this.eventEmitter.emit('comprobante.persistencia_fallida', {
        claveAcceso,
        emisorRuc: dto.emisor.ruc,
        tipoComprobante: TipoComprobante.COMPROBANTE_RETENCION,
        error: (error as Error).message,
        timestamp: new Date(),
      });
      throw error;
    }
  }

  /**
   * Construye objeto Retencion desde el DTO
   */
  private buildRetencionFromDto(
    dto: CreateRetencionDto,
    claveAcceso: string,
    secuencial: string,
    ambiente: Ambiente,
    tipoEmision: TipoEmision,
  ): Retencion {
    const infoTributaria: InfoTributaria = {
      ambiente,
      tipoEmision,
      razonSocial: dto.emisor.razonSocial,
      nombreComercial: dto.emisor.nombreComercial,
      ruc: dto.emisor.ruc,
      claveAcceso,
      codDoc: TipoComprobante.COMPROBANTE_RETENCION,
      estab: dto.emisor.establecimiento.padStart(3, '0'),
      ptoEmi: dto.emisor.puntoEmision.padStart(3, '0'),
      secuencial: secuencial.padStart(9, '0'),
      dirMatriz: dto.emisor.dirMatriz,
      agenteRetencion: dto.emisor.agenteRetencion,
      contribuyenteRimpe: dto.emisor.contribuyenteRimpe,
    };

    const infoCompRetencion: InfoRetencion = {
      fechaEmision: dto.fechaEmision,
      dirEstablecimiento: dto.emisor.dirEstablecimiento,
      contribuyenteEspecial: dto.emisor.contribuyenteEspecial,
      obligadoContabilidad: dto.emisor.obligadoContabilidad,
      tipoIdentificacionSujetoRetenido: dto.sujetoRetenido
        .tipoIdentificacion as any,
      tipoSujetoRetenido: dto.sujetoRetenido.tipoSujetoRetenido,
      razonSocialSujetoRetenido: dto.sujetoRetenido.razonSocial,
      identificacionSujetoRetenido: dto.sujetoRetenido.identificacion,
      periodoFiscal: dto.periodoFiscal,
    };

    const impuestos: ImpuestoRetenido[] = dto.impuestos.map((imp) => ({
      codigo: imp.codigo,
      codigoRetencion: imp.codigoRetencion,
      baseImponible: imp.baseImponible,
      porcentajeRetener: imp.porcentajeRetener,
      valorRetenido: imp.valorRetenido,
      codDocSustento: imp.codDocSustento,
      codSustento: imp.codSustento,
      numDocSustento: imp.numDocSustento,
      fechaEmisionDocSustento: imp.fechaEmisionDocSustento,
      totalSinImpuestos: imp.totalSinImpuestos,
      importeTotal: imp.importeTotal,
      pagoLocExt: imp.pagoLocExt,
      formaPago: imp.formaPago,
      impuestosDocSustento: imp.impuestosDocSustento.map((impDoc) => ({
        codImpuestoDocSustento: impDoc.codImpuestoDocSustento,
        codigoPorcentaje: impDoc.codigoPorcentaje,
        baseImponible: impDoc.baseImponible,
        tarifa: impDoc.tarifa,
        valorImpuesto: impDoc.valorImpuesto,
      })),
    }));

    const retencion: Retencion = {
      infoTributaria,
      infoCompRetencion,
      impuestos,
    };

    // Información adicional
    const infoAdicional: any[] = [];

    if (dto.sujetoRetenido.email) {
      infoAdicional.push({ nombre: 'email', valor: dto.sujetoRetenido.email });
    }
    if (dto.sujetoRetenido.direccion) {
      infoAdicional.push({
        nombre: 'direccion',
        valor: dto.sujetoRetenido.direccion,
      });
    }

    if (dto.infoAdicional) {
      infoAdicional.push(...dto.infoAdicional);
    }

    if (infoAdicional.length > 0) {
      retencion.infoAdicional = infoAdicional;
    }

    return retencion;
  }

  mapResultToRetencionResponse(
    result: SriOperationResult,
  ): RetencionResponseDto {
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
