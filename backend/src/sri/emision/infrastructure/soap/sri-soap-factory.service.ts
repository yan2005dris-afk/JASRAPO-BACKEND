import { Injectable, Logger } from '@nestjs/common';
import * as soap from 'soap';
import { Client } from 'soap';

export class SimpleCircuitBreaker {
  private readonly logger = new Logger(SimpleCircuitBreaker.name);
  private state: 'CLOSED' | 'OPEN' | 'HALF-OPEN' = 'CLOSED';
  private failureCount = 0;
  private nextAttemptTime = 0;

  constructor(
    private readonly name: string,
    private readonly threshold = 5,
    private readonly cooldownMs = 30000,
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() > this.nextAttemptTime) {
        this.logger.warn(`Circuit Breaker [${this.name}] is HALF-OPEN. Testing service availability.`);
        this.state = 'HALF-OPEN';
      } else {
        throw new Error(`Circuit Breaker [${this.name}] is OPEN. Request fast-failed.`);
      }
    }

    try {
      const result = await fn();
      if (this.state === 'HALF-OPEN') {
        this.logger.log(`Circuit Breaker [${this.name}] is CLOSED again. Service recovered.`);
        this.state = 'CLOSED';
        this.failureCount = 0;
      }
      return result;
    } catch (error) {
      this.failureCount++;
      this.logger.warn(`Failure [${this.failureCount}/${this.threshold}] on Circuit Breaker [${this.name}]: ${(error as Error).message}`);
      
      if (this.state === 'HALF-OPEN' || this.failureCount >= this.threshold) {
        this.logger.error(`Circuit Breaker [${this.name}] is now OPEN. Cooldown active for ${this.cooldownMs}ms.`);
        this.state = 'OPEN';
        this.nextAttemptTime = Date.now() + this.cooldownMs;
      }
      throw error;
    }
  }
}

@Injectable()
export class SriSoapFactoryService {
  private readonly logger = new Logger(SriSoapFactoryService.name);

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
