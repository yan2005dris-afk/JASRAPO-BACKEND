import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SriSoapFactoryService } from './sri-soap-factory.service';
import type {
  SriRecepcionResponse,
  SriAutorizacionResponse,
  SriOperationResult,
  SriMensaje,
} from '../../domain/interfaces/sri-response.interface';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { LogContext } from 'src/shared/decorators/log-context.decorator';

/**
 * Cliente SOAP para comunicación con los servicios web del SRI Ecuador.
 */
@LogContext()
@Injectable()
export class SriSoapClient {
  constructor(
    private readonly configService: ConfigService,
    private readonly soapFactory: SriSoapFactoryService,
    private readonly logger: LoggerService,
  ) {}

  async validarComprobante(
    xmlFirmado: string,
    ambiente: '1' | '2',
  ): Promise<SriRecepcionResponse> {
    this.logger.log(
      `Enviando comprobante al SRI para validación (Ambiente ${ambiente})`,
    );
    const xmlBase64 = Buffer.from(xmlFirmado, 'utf-8').toString('base64');

    const breaker = this.soapFactory.getCircuitBreaker(`recepcion_${ambiente}`);

    try {
      const result = await breaker.execute(async () => {
        const client = await this.soapFactory.getRecepcionClient(ambiente);
        const [res] = await client.validarComprobanteAsync(
          { xml: xmlBase64 },
          { timeout: 15000 },
        );
        return res;
      });

      const response = result?.RespuestaRecepcionComprobante || result;
      this.logger.log(`Respuesta del SRI - Estado: ${response?.estado}`);

      return this.parseRecepcionResponse(response);
    } catch (error) {
      this.logger.error(
        `Error al validar comprobante: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  async autorizarComprobante(
    claveAcceso: string,
  ): Promise<SriAutorizacionResponse> {
    this.logger.log(
      `Consultando autorización para clave: ...${claveAcceso.slice(-8)}`,
    );

    if (claveAcceso.length !== 49) {
      throw new Error('La clave de acceso debe tener 49 dígitos');
    }

    const ambiente = claveAcceso.charAt(23) as '1' | '2';
    const breaker = this.soapFactory.getCircuitBreaker(
      `autorizacion_${ambiente}`,
    );

    try {
      const result = await breaker.execute(async () => {
        const client = await this.soapFactory.getAutorizacionClient(ambiente);
        const [res] = await client.autorizacionComprobanteAsync(
          { claveAccesoComprobante: claveAcceso },
          { timeout: 15000 },
        );
        return res;
      });

      const response = result?.RespuestaAutorizacionComprobante || result;
      this.logger.log(
        `Respuesta del SRI - Autorizaciones: ${response?.numeroComprobantes || 0}`,
      );

      return this.parseAutorizacionResponse(response);
    } catch (error) {
      this.logger.error(
        `Error al consultar autorización: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  async enviarYAutorizar(
    xmlFirmado: string,
    claveAcceso: string,
    maxRetries?: number,
    retryDelay?: number,
  ): Promise<SriOperationResult> {
    const retries =
      maxRetries ?? this.configService.get<number>('SRI_MAX_RETRIES', 3);
    const delay =
      retryDelay ?? this.configService.get<number>('SRI_RETRY_DELAY_MS', 2000);

    const ambiente = claveAcceso.charAt(23) as '1' | '2';
    // Paso 1: Validar comprobante (Recepción)
    const recepcion = await this.validarComprobante(xmlFirmado, ambiente);

    if (recepcion.estado === 'DEVUELTA') {
      const mensajes = this.extractMensajes(recepcion);
      return {
        success: false,
        claveAcceso,
        estado: 'DEVUELTA',
        mensajes,
      };
    }

    // Paso 2: Consultar autorización con reintentos
    for (let intento = 1; intento <= retries; intento++) {
      if (intento > 1) {
        const backoffDelay = delay * Math.pow(2, intento - 2);
        this.logger.log(
          `Esperando ${backoffDelay}ms antes de intentar consulta de autorización (intento ${intento}/${retries})`,
        );
        await this.delay(backoffDelay);
      }

      const autorizacion = await this.autorizarComprobante(claveAcceso);

      if (
        autorizacion.autorizaciones &&
        autorizacion.autorizaciones.autorizacion
      ) {
        const auth = Array.isArray(autorizacion.autorizaciones.autorizacion)
          ? autorizacion.autorizaciones.autorizacion[0]
          : autorizacion.autorizaciones.autorizacion;

        if (auth.estado === 'AUTORIZADO') {
          return {
            success: true,
            claveAcceso,
            estado: 'AUTORIZADO',
            fechaAutorizacion: auth.fechaAutorizacion,
            numeroAutorizacion: auth.numeroAutorizacion,
            xmlAutorizado: auth.comprobante,
            mensajes: this.extractMensajesAutorizacion(auth),
          };
        }

        if (auth.estado === 'NO AUTORIZADO') {
          this.logger.warn(
            `Comprobante NO AUTORIZADO: ...${claveAcceso.slice(-8)}`,
          );
          return {
            success: false,
            claveAcceso,
            estado: 'NO AUTORIZADO',
            mensajes: this.extractMensajesAutorizacion(auth),
          };
        }
      }
    }

    this.logger.warn(
      `Comprobante EN PROCESO después de ${retries} intentos: ...${claveAcceso.slice(-8)}`,
    );

    return {
      success: false,
      claveAcceso,
      estado: 'EN PROCESO',
      mensajes: [
        {
          identificador: 'TIMEOUT',
          mensaje: 'Se agotaron los reintentos de consulta de autorización',
          tipo: 'ADVERTENCIA',
        },
      ],
    };
  }

  private parseRecepcionResponse(response: any): SriRecepcionResponse {
    return {
      estado: response?.estado || 'DEVUELTA',
      comprobantes: response?.comprobantes,
    };
  }

  private parseAutorizacionResponse(response: any): SriAutorizacionResponse {
    return {
      claveAccesoConsultada: response?.claveAccesoConsultada || '',
      numeroComprobantes: response?.numeroComprobantes || '0',
      autorizaciones: response?.autorizaciones,
    };
  }

  private extractMensajes(response: SriRecepcionResponse): SriMensaje[] {
    if (!response.comprobantes || !response.comprobantes.comprobante) {
      return [];
    }

    const comprobantes = Array.isArray(response.comprobantes.comprobante)
      ? response.comprobantes.comprobante
      : [response.comprobantes.comprobante];

    const mensajes: SriMensaje[] = [];
    comprobantes.forEach((comp) => {
      if (comp.mensajes && comp.mensajes.mensaje) {
        const msgs = Array.isArray(comp.mensajes.mensaje)
          ? comp.mensajes.mensaje
          : [comp.mensajes.mensaje];
        mensajes.push(...msgs);
      }
    });

    return mensajes;
  }

  private extractMensajesAutorizacion(auth: any): SriMensaje[] {
    if (!auth.mensajes || !auth.mensajes.mensaje) {
      return [];
    }

    return Array.isArray(auth.mensajes.mensaje)
      ? auth.mensajes.mensaje
      : [auth.mensajes.mensaje];
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
