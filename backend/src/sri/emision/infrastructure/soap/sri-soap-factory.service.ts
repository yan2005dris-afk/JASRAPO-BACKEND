import { Injectable } from '@nestjs/common';
import * as soap from 'soap';
import { Client } from 'soap';
import { SimpleCircuitBreaker } from '../../../../infrastructure/common/resilience/circuit-breaker';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { LogContext } from 'src/shared/decorators/log-context.decorator';

@LogContext()
@Injectable()
export class SriSoapFactoryService {
  constructor(private readonly logger: LoggerService) {}

  // Cache de clientes en memoria. Clave: tipo_ambiente (ej: 'recepcion_1')
  private clients = new Map<string, Client>();
  private breakers = new Map<string, SimpleCircuitBreaker>();

  private readonly WSDL_URLS = {
    recepcion: {
      '1': 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl', // Pruebas
      '2': 'https://cel.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl', // Producción
    },
    autorizacion: {
      '1': 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl', // Pruebas
      '2': 'https://cel.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl', // Producción
    },
  };

  getCircuitBreaker(name: string): SimpleCircuitBreaker {
    if (!this.breakers.has(name)) {
      this.breakers.set(name, new SimpleCircuitBreaker(name));
    }
    return this.breakers.get(name)!;
  }

  /**
   * Obtiene (o crea y cachea) un cliente SOAP para el servicio de Recepción
   * @param ambiente '1' para Pruebas, '2' para Producción
   */
  async getRecepcionClient(ambiente: '1' | '2'): Promise<Client> {
    const cacheKey = `recepcion_${ambiente}`;

    if (this.clients.has(cacheKey)) {
      return this.clients.get(cacheKey)!;
    }

    const wsdlUrl = this.WSDL_URLS.recepcion[ambiente];
    if (!wsdlUrl) {
      throw new Error(`Ambiente no válido para recepción: ${ambiente}`);
    }

    this.logger.log(
      `Creando nuevo cliente SOAP de Recepción para ambiente ${ambiente}`,
    );
    const client = await soap.createClientAsync(wsdlUrl, {
      wsdl_options: {
        timeout: 15000,
      },
    });

    this.clients.set(cacheKey, client);
    return client;
  }

  /**
   * Obtiene (o crea y cachea) un cliente SOAP para el servicio de Autorización
   * @param ambiente '1' para Pruebas, '2' para Producción
   */
  async getAutorizacionClient(ambiente: '1' | '2'): Promise<Client> {
    const cacheKey = `autorizacion_${ambiente}`;

    if (this.clients.has(cacheKey)) {
      return this.clients.get(cacheKey)!;
    }

    const wsdlUrl = this.WSDL_URLS.autorizacion[ambiente];
    if (!wsdlUrl) {
      throw new Error(`Ambiente no válido para autorización: ${ambiente}`);
    }

    this.logger.log(
      `Creando nuevo cliente SOAP de Autorización para ambiente ${ambiente}`,
    );
    const client = await soap.createClientAsync(wsdlUrl, {
      wsdl_options: {
        timeout: 15000,
      },
    });

    this.clients.set(cacheKey, client);
    return client;
  }
}
