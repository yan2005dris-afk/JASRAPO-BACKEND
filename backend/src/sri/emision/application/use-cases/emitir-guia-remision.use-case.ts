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
import {
  CreateGuiaRemisionDto,
  GuiaRemisionResponseDto,
} from '../../interfaces/dto';
import {
  InfoTributaria,
  GuiaRemision,
  InfoGuiaRemision,
  DestinatarioGuiaRemision,
  DetalleGuiaRemision,
  SriOperationResult,
} from '../../domain/interfaces';
import { TipoComprobante, Ambiente, TipoEmision } from '../../domain/constants';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { LogContext } from 'src/shared/decorators/log-context.decorator';

@LogContext()
@Injectable()
export class EmitirGuiaRemisionUseCase {
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
   * Emite una Guía de Remisión electrónica
   */
  async emitirGuiaRemision(
    dto: CreateGuiaRemisionDto,
  ): Promise<GuiaRemisionResponseDto> {
    this.logger.log('Iniciando emisión de guía de remisión');

    try {
      // Validar tipo e identificación del transportista
      this.base.validarIdentificacion(
        dto.tipoIdentificacionTransportista,
        dto.rucTransportista,
        'transportista',
      );
      await this.base.validarTipoIdentificacionCatalogo(
        dto.tipoIdentificacionTransportista,
      );

      // Validar destinatarios
      for (const dest of dto.destinatarios) {
        this.base.validarIdentificacion(
          dest.tipoIdentificacionDestinatario,
          dest.identificacionDestinatario,
          'destinatario',
        );
        await this.base.validarTipoIdentificacionCatalogo(
          dest.tipoIdentificacionDestinatario,
        );

        if (dest.codDocSustento) {
          await this.base.validarDocumentoSustentoCatalogo(
            dest.codDocSustento,
          );
        }
      }

      const ambiente = dto.ambiente || this.base.getDefaultAmbiente();
      const tipoEmision = dto.tipoEmision || TipoEmision.NORMAL;

      // Obtener emisor desde base de datos
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

      // Secuencial auto-generado si no se provee
      let secuencial: string;
      if (dto.secuencial) {
        secuencial = dto.secuencial.padStart(9, '0');
        this.logger.log(`Usando secuencial GR proporcionado: ${secuencial}`);
      } else {
        const nextSecuencial =
          await this.secuencialRepository.getNextSecuencial(
            puntoEmisionInfo.punto_emision_id,
            TipoComprobante.GUIA_REMISION,
          );
        secuencial = nextSecuencial;
        this.logger.log(`Secuencial GR auto-generado: ${secuencial}`);
      }

      const hoy = new Date();
      const claveAcceso = this.claveAccesoService.generate({
        fechaEmision: hoy,
        tipoComprobante: TipoComprobante.GUIA_REMISION,
        ruc: dto.emisor.ruc,
        ambiente,
        establecimiento: dto.emisor.establecimiento,
        puntoEmision: dto.emisor.puntoEmision,
        secuencial,
        tipoEmision,
      });

      this.logger.log(`Clave de acceso GR generada: ${claveAcceso}`);

      const guiaRemision = this.buildGuiaRemisionFromDto(
        dto,
        claveAcceso,
        secuencial,
        ambiente,
        tipoEmision,
      );

      const xml = this.xmlBuilderService.buildGuiaRemision(guiaRemision);
      this.logger.log('XML de guía de remisión generado');

      // Verificar certificado del emisor
      if (
        !emisor.certificado_nombre ||
        !emisor.certificado_password_encrypted
      ) {
        throw new BadRequestException(
          `El emisor ${dto.emisor.ruc} no tiene certificado P12 configurado. ` +
            `Use el endpoint /certificates/upload-cert para subir el certificado.`,
        );
      }

      this.logger.log(
        `Firmando GR con certificado del emisor: ${emisor.certificado_nombre}`,
      );
      const xmlFirmado = await this.xmlSignerService.signXmlForEmisor(
        xml,
        dto.emisor.ruc,
      );
      this.logger.log('XML de guía de remisión firmado con XAdES-BES');

      const esFirmaValida =
        await this.xmlSignerService.verifySignature(xmlFirmado);
      if (!esFirmaValida) {
        throw new BadRequestException(
          'La firma del XML generado no es válida. Verifique el certificado del emisor.',
        );
      }

      // 1. Persistencia inicial en estado FIRMADO
      const comprobante = await this.persistirGuiaRemision(
        dto,
        guiaRemision,
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

      // 2. Enviar y autorizar en el SRI
      const resultado = await this.sriSoapClient.enviarYAutorizar(
        xmlFirmado,
        claveAcceso,
      );

      // 3. Actualizar estado final en BD
      await this.comprobanteRepository.update(comprobante.id, {
        estado: resultado.success ? 'AUTORIZADO' : resultado.estado,
        estado_sri: resultado.estado,
        fecha_autorizacion: resultado.fechaAutorizacion,
        numero_autorizacion: resultado.numeroAutorizacion || claveAcceso,
      });

      // 4. Si fue autorizado, guardar XML autorizado
      if (resultado.xmlAutorizado) {
        const xmlPaths = await this.xmlStorage.saveAllXmls(
          dto.emisor.ruc,
          claveAcceso,
          hoy,
          undefined,
          undefined,
          resultado.xmlAutorizado,
        );
        await this.comprobanteRepository.saveXml({
          comprobante_id: comprobante.id!,
          xml_autorizado_path: xmlPaths.autorizadoKey,
        });
      }

      return this.mapResultToGuiaRemisionResponse(resultado);
    } catch (error) {
      this.logger.error(
        `Error al emitir guía de remisión: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  /**
   * Persiste la Guía de Remisión en base de datos
   */
  private async persistirGuiaRemision(
    dto: CreateGuiaRemisionDto,
    guiaRemision: GuiaRemision,
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
        // Tomar el primer destinatario como referencia del receptor principal
        const destPrincipal = dto.destinatarios[0];

        const comprobante = await this.comprobanteRepository.create(
          {
            emisor_id: emisorId,
            punto_emision_id: puntoEmisionId,
            tipo_comprobante: TipoComprobante.GUIA_REMISION,
            ambiente,
            tipo_emision: tipoEmision,
            secuencial,
            clave_acceso: claveAcceso,
            fecha_emision: new Date().toISOString().split('T')[0],
            estado: resultado.estado,
            estado_sri: resultado.estado,
            fecha_autorizacion: resultado.fechaAutorizacion,
            numero_autorizacion: resultado.numeroAutorizacion || claveAcceso,
            dir_partida: dto.dirPartida,
            placa: dto.placa,
            ruc_transportista: dto.rucTransportista,
            razon_social_transportista: dto.razonSocialTransportista,
            tipo_identificacion_transportista:
              dto.tipoIdentificacionTransportista,
            fecha_ini_transporte: dto.fechaIniTransporte
              ?.split('/')
              .reverse()
              .join('-'),
            fecha_fin_transporte: dto.fechaFinTransporte
              ?.split('/')
              .reverse()
              .join('-'),
            receptor_tipo_identificacion:
              destPrincipal?.tipoIdentificacionDestinatario,
            receptor_identificacion: destPrincipal?.identificacionDestinatario,
            receptor_razon_social: destPrincipal?.razonSocialDestinatario,
            receptor_direccion: destPrincipal?.dirDestinatario,
            receptor_email: destPrincipal?.emailDestinatario,
          },
          tx,
        );

        this.logger.log(`Guía de Remisión creada con ID: ${comprobante.id}`);

        // Crear detalles de mercadería de todos los destinatarios
        let orden = 0;
        for (const dest of guiaRemision.destinatarios) {
          for (const det of dest.detalles) {
            const detalleRecords =
              await this.comprobanteRepository.createDetalles(
                [
                  {
                    comprobante_id: comprobante.id!,
                    codigo_principal: det.codigoInterno,
                    codigo_auxiliar: det.codigoAdicional,
                    descripcion: det.descripcion,
                    cantidad: det.cantidad,
                    precio_unitario: 0,
                    descuento: 0,
                    precio_total_sin_impuesto: 0,
                    orden: orden++,
                  },
                ],
                tx,
              );

            if (
              det.detallesAdicionales &&
              det.detallesAdicionales.length > 0 &&
              detalleRecords[0]?.id
            ) {
              await this.comprobanteRepository.createDetallesAdicionales(
                det.detallesAdicionales.map((d) => ({
                  comprobante_detalle_id: detalleRecords[0].id!,
                  nombre: d.nombre,
                  valor: d.valor,
                })),
                tx,
              );
            }
          }
        }

        // Info adicional
        if (
          guiaRemision.infoAdicional &&
          guiaRemision.infoAdicional.length > 0
        ) {
          await this.comprobanteRepository.createInfoAdicional(
            guiaRemision.infoAdicional.map((info) => ({
              comprobante_id: comprobante.id!,
              nombre: info.nombre,
              valor: info.valor,
            })),
            tx,
          );
        }

        // Guardar XMLs
        const hoy = new Date();
        const xmlPaths = await this.xmlStorage.saveAllXmls(
          dto.emisor.ruc,
          claveAcceso,
          hoy,
          xmlSinFirma,
          xmlFirmado,
          resultado.xmlAutorizado,
        );

        await this.comprobanteRepository.saveXml(
          {
            comprobante_id: comprobante.id!,
            xml_generado_path: xmlPaths.generadoKey,
            xml_firmado_path: xmlPaths.firmadoKey,
            xml_autorizado_path: xmlPaths.autorizadoKey,
          },
          tx,
        );

        return comprobante;
      });
    } catch (error) {
      this.logger.error(
        `Error persistiendo guía de remisión: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  /**
   * Construye el objeto GuiaRemision de dominio a partir del DTO
   */
  private buildGuiaRemisionFromDto(
    dto: CreateGuiaRemisionDto,
    claveAcceso: string,
    secuencial: string,
    ambiente: Ambiente,
    tipoEmision: TipoEmision,
  ): GuiaRemision {
    const infoTributaria: InfoTributaria = {
      ambiente,
      tipoEmision,
      razonSocial: dto.emisor.razonSocial,
      nombreComercial: dto.emisor.nombreComercial,
      ruc: dto.emisor.ruc,
      claveAcceso,
      codDoc: TipoComprobante.GUIA_REMISION,
      estab: dto.emisor.establecimiento,
      ptoEmi: dto.emisor.puntoEmision,
      secuencial,
      dirMatriz: dto.emisor.dirMatriz,
      agenteRetencion: dto.emisor.agenteRetencion,
      contribuyenteRimpe: dto.emisor.contribuyenteRimpe,
    };

    const infoGuiaRemision: InfoGuiaRemision = {
      dirEstablecimiento: dto.emisor.dirEstablecimiento,
      dirPartida: dto.dirPartida,
      razonSocialTransportista: dto.razonSocialTransportista,
      tipoIdentificacionTransportista: dto.tipoIdentificacionTransportista as any,
      rucTransportista: dto.rucTransportista,
      obligadoContabilidad: dto.emisor.obligadoContabilidad,
      contribuyenteEspecial: dto.emisor.contribuyenteEspecial,
      fechaIniTransporte: dto.fechaIniTransporte,
      fechaFinTransporte: dto.fechaFinTransporte,
      placa: dto.placa,
    };

    const destinatarios: DestinatarioGuiaRemision[] = dto.destinatarios.map(
      (dest) => ({
        tipoIdentificacionDestinatario: dest.tipoIdentificacionDestinatario,
        identificacionDestinatario: dest.identificacionDestinatario,
        razonSocialDestinatario: dest.razonSocialDestinatario,
        dirDestinatario: dest.dirDestinatario,
        emailDestinatario: dest.emailDestinatario,
        motivoTraslado: dest.motivoTraslado,
        docAduaneroUnico: dest.docAduaneroUnico,
        codEstabDestino: dest.codEstabDestino,
        ruta: dest.ruta,
        codDocSustento: dest.codDocSustento,
        numDocSustento: dest.numDocSustento,
        numAutDocSustento: dest.numAutDocSustento,
        fechaEmisionDocSustento: dest.fechaEmisionDocSustento,
        detalles: dest.detalles.map((det) => ({
          codigoInterno: det.codigoInterno,
          codigoAdicional: det.codigoAdicional,
          descripcion: det.descripcion,
          cantidad: det.cantidad,
          detallesAdicionales: det.detallesAdicionales,
        })),
      }),
    );

    return {
      infoTributaria,
      infoGuiaRemision,
      destinatarios,
      infoAdicional: dto.infoAdicional,
    };
  }

  private mapResultToGuiaRemisionResponse(
    result: SriOperationResult,
  ): GuiaRemisionResponseDto {
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
