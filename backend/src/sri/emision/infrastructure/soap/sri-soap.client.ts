import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { parseStringPromise } from 'xml2js';
import { SimpleCircuitBreaker } from '../../../../infrastructure/common/resilience/circuit-breaker';
import type {
  SriRecepcionResponse,
  SriAutorizacionResponse,
  SriOperationResult,
  SriMensaje,
} from '../../domain/interfaces/sri-response.interface';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { LogContext } from 'src/shared/decorators/log-context.decorator';

/**
 * Cliente HTTP nativo para comunicación con los servicios web SOAP del SRI Ecuador.
 * No requiere la librería pesada 'soap' ni descarga de WSDLs en tiempo de ejecución.
 * Construye envelopes SOAP 1.1 y despacha peticiones HTTP nativas con fetch y circuit breaker.
 */
@LogContext()
@Injectable()
export class SriSoapClient {
  private readonly breakers = new Map<string, SimpleCircuitBreaker>();

  private readonly SRI_URLS = {
    recepcion: {
      '1': 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline',
      '2': 'https://cel.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline',
    },
    autorizacion: {
      '1': 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline',
      '2': 'https://cel.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline',
    },
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  getCircuitBreaker(name: string): SimpleCircuitBreaker {
    if (!this.breakers.has(name)) {
      this.breakers.set(name, new SimpleCircuitBreaker(name));
    }
    return this.breakers.get(name)!;
  }

  /**
   * Envía un comprobante XML firmado al SRI para validación (Recepción).
   */
  async validarComprobante(
    xmlFirmado: string,
    ambiente: '1' | '2',
  ): Promise<SriRecepcionResponse> {
    this.logger.log(
      `Enviando comprobante al SRI para validación (Ambiente ${ambiente})`,
    );

    const xmlBase64 = Buffer.from(xmlFirmado, 'utf-8').toString('base64');
    const endpoint = this.SRI_URLS.recepcion[ambiente];
    if (!endpoint) {
      throw new Error(`Ambiente no válido para recepción: ${ambiente}`);
    }

    const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ec="http://ec.gob.sri.ws.recepcion">
  <soapenv:Header/>
  <soapenv:Body>
    <ec:validarComprobante>
      <xml>${xmlBase64}</xml>
    </ec:validarComprobante>
  </soapenv:Body>
</soapenv:Envelope>`;

    const breaker = this.getCircuitBreaker(`recepcion_${ambiente}`);

    try {
      const responseXml = await breaker.execute(async () => {
        return await this.sendSoapRequest(endpoint, soapEnvelope);
      });

      const parsed = await parseStringPromise(responseXml, {
        explicitArray: false,
        ignoreAttrs: true,
      });

      const root =
        parsed?.['soap:Envelope']?.['soap:Body']?.[
          'ns2:validarComprobanteResponse'
        ]?.RespuestaRecepcionComprobante ||
        parsed?.['soap:Envelope']?.['soap:Body']?.validarComprobanteResponse
          ?.RespuestaRecepcionComprobante ||
        parsed?.RespuestaRecepcionComprobante ||
        {};

      this.logger.log(
        `Respuesta del SRI - Estado: ${root?.estado || 'DEVUELTA'}`,
      );
      return this.parseRecepcionResponse(root);
    } catch (error) {
      this.logger.error(
        `Error al validar comprobante: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  /**
   * Consulta el estado de autorización de un comprobante ante el SRI.
   */
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
    const endpoint = this.SRI_URLS.autorizacion[ambiente];
    if (!endpoint) {
      throw new Error(`Ambiente no válido para autorización: ${ambiente}`);
    }

    const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ec="http://ec.gob.sri.ws.autorizacion">
  <soapenv:Header/>
  <soapenv:Body>
    <ec:autorizacionComprobante>
      <claveAccesoComprobante>${claveAcceso}</claveAccesoComprobante>
    </ec:autorizacionComprobante>
  </soapenv:Body>
</soapenv:Envelope>`;

    const breaker = this.getCircuitBreaker(`autorizacion_${ambiente}`);

    try {
      const responseXml = await breaker.execute(async () => {
        return await this.sendSoapRequest(endpoint, soapEnvelope);
      });

      const parsed = await parseStringPromise(responseXml, {
        explicitArray: false,
        ignoreAttrs: true,
      });

      const root =
        parsed?.['soap:Envelope']?.['soap:Body']?.[
          'ns2:autorizacionComprobanteResponse'
        ]?.RespuestaAutorizacionComprobante ||
        parsed?.['soap:Envelope']?.['soap:Body']
          ?.autorizacionComprobanteResponse?.RespuestaAutorizacionComprobante ||
        parsed?.RespuestaAutorizacionComprobante ||
        {};

      this.logger.log(
        `Respuesta del SRI - Autorizaciones: ${root?.numeroComprobantes || 0}`,
      );
      return this.parseAutorizacionResponse(root);
    } catch (error) {
      this.logger.error(
        `Error al consultar autorización: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  /**
   * Ejecuta el flujo completo: recepción + reintentos de consulta de autorización.
   */
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

  private async sendSoapRequest(url: string, bodyXml: string): Promise<string> {
    const timeoutMs = this.configService.get<number>('SRI_TIMEOUT_MS', 15000);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          SOAPAction: '""',
        },
        body: bodyXml,
        signal: controller.signal,
      });

      const responseText = await response.text();

      if (!response.ok) {
        // Verificar si es un SOAP Fault
        if (responseText.includes('Fault')) {
          const parsed = await parseStringPromise(responseText, {
            explicitArray: false,
            ignoreAttrs: true,
          }).catch(() => null);
          const fault =
            parsed?.['soap:Envelope']?.['soap:Body']?.['soap:Fault'] ||
            parsed?.['soap:Envelope']?.['soap:Body']?.Fault;
          const faultString = fault?.faultstring || response.statusText;
          throw new Error(`SRI SOAP Fault: ${faultString}`);
        }
        throw new Error(
          `Error en comunicación con el SRI (HTTP ${response.status}): ${response.statusText}`,
        );
      }

      return responseText;
    } catch (error) {
      if (error?.name === 'AbortError') {
        throw new Error(
          `Timeout de comunicación con el SRI tras ${timeoutMs}ms`,
        );
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  private parseRecepcionResponse(response: any): SriRecepcionResponse {
    let comprobantes = response?.comprobantes;
    if (comprobantes && !Array.isArray(comprobantes?.comprobante)) {
      if (comprobantes.comprobante) {
        comprobantes = {
          comprobante: [comprobantes.comprobante],
        };
      }
    }

    if (comprobantes?.comprobante) {
      for (const comp of comprobantes.comprobante) {
        if (comp.mensajes && !Array.isArray(comp.mensajes.mensaje)) {
          comp.mensajes.mensaje = comp.mensajes.mensaje
            ? [comp.mensajes.mensaje]
            : [];
        }
      }
    }

    return {
      estado: response?.estado || 'DEVUELTA',
      comprobantes,
    };
  }

  private parseAutorizacionResponse(response: any): SriAutorizacionResponse {
    let autorizaciones = response?.autorizaciones;
    if (autorizaciones && !Array.isArray(autorizaciones?.autorizacion)) {
      if (autorizaciones.autorizacion) {
        autorizaciones = {
          autorizacion: [autorizaciones.autorizacion],
        };
      }
    }

    if (autorizaciones?.autorizacion) {
      for (const auth of autorizaciones.autorizacion) {
        if (auth.mensajes && !Array.isArray(auth.mensajes.mensaje)) {
          auth.mensajes.mensaje = auth.mensajes.mensaje
            ? [auth.mensajes.mensaje]
            : [];
        }
      }
    }

    return {
      claveAccesoConsultada: response?.claveAccesoConsultada || '',
      numeroComprobantes: String(response?.numeroComprobantes || '0'),
      autorizaciones,
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
