import { SriOperationResult } from '../interfaces';

export abstract class SriSoapClientPort {
  abstract enviarYAutorizar(
    xmlFirmado: string,
    claveAcceso: string,
    maxRetries?: number,
    retryDelay?: number,
  ): Promise<SriOperationResult>;
}
