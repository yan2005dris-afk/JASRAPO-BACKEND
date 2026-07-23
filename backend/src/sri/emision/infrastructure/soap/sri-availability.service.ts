import { Injectable } from '@nestjs/common';
import { SriSoapFactoryService } from './sri-soap-factory.service';
import { Ambiente } from '../../domain/constants';

export interface SriAvailabilityStatus {
  ambiente: Ambiente;
  recepcionOpen: boolean;
  autorizacionOpen: boolean;
  down: boolean;
}

/**
 * Detecta si los servicios web del SRI están disponibles, apoyándose en el
 * estado del Circuit Breaker ya existente en `SriSoapFactoryService`
 * (uno por servicio+ambiente: `recepcion_{ambiente}`, `autorizacion_{ambiente}`).
 *
 * No realiza llamadas de red por sí misma: solo consulta el estado en
 * memoria de los breakers, que se actualiza cada vez que
 * `SriSoapClient` invoca al SRI real. Esto la hace barata de consultar en
 * el hot path de emisión de comprobantes.
 *
 * Un breaker en HALF-OPEN cuenta como "SRI caído" para efectos de negocio:
 * todavía no hay una llamada real confirmando la recuperación.
 */
@Injectable()
export class SriAvailabilityService {
  constructor(private readonly soapFactory: SriSoapFactoryService) {}

  /**
   * true si el servicio de Recepción de Comprobantes está caído/degradado
   * para el ambiente dado (Pruebas o Producción).
   */
  isRecepcionDown(ambiente: Ambiente): boolean {
    return this.soapFactory.getCircuitBreaker(`recepcion_${ambiente}`).isOpen();
  }

  /**
   * true si el servicio de Autorización está caído/degradado para el
   * ambiente dado.
   */
  isAutorizacionDown(ambiente: Ambiente): boolean {
    return this.soapFactory
      .getCircuitBreaker(`autorizacion_${ambiente}`)
      .isOpen();
  }

  /**
   * true si el SRI se considera no disponible para efectos de emisión de
   * comprobantes: el envío (Recepción) es lo que bloquea la emisión, así
   * que basta con que ese breaker esté abierto.
   */
  isSriDown(ambiente: Ambiente): boolean {
    return this.isRecepcionDown(ambiente);
  }

  /**
   * Snapshot completo de ambos breakers para un ambiente. Útil para
   * diagnóstico/observabilidad (logs, endpoint de estado, jobs de
   * reconciliación).
   */
  getStatus(ambiente: Ambiente): SriAvailabilityStatus {
    const recepcionOpen = this.isRecepcionDown(ambiente);
    const autorizacionOpen = this.isAutorizacionDown(ambiente);
    return {
      ambiente,
      recepcionOpen,
      autorizacionOpen,
      down: recepcionOpen,
    };
  }
}
