import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { EmitirFacturaUseCase } from '../../../application/use-cases/emitir-factura.use-case';
import { EmitirNotaCreditoUseCase } from '../../../application/use-cases/emitir-nota-credito.use-case';
import { EmitirNotaDebitoUseCase } from '../../../application/use-cases/emitir-nota-debito.use-case';
import { EmitirRetencionUseCase } from '../../../application/use-cases/emitir-retencion.use-case';
import { SriIntegrationService } from '../../../application/services/sri-integration.service';
import { SRI_EMISION_JOB } from './sri-emision.constants';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { LogContext } from 'src/shared/decorators/log-context.decorator';

/** Minimal interface for the job service to avoid pg-boss ESM import issues */
export interface SRIJobWorker {
  work(name: string, handler: (jobs: any[]) => Promise<any>): Promise<any>;
}

@LogContext()
@Injectable()
export class SriEmisionProcessor implements OnModuleInit {
  constructor(
    @Inject('JobService') private readonly jobsService: SRIJobWorker,
    private readonly emitirFacturaUseCase: EmitirFacturaUseCase,
    private readonly emitirNotaCreditoUseCase: EmitirNotaCreditoUseCase,
    private readonly emitirNotaDebitoUseCase: EmitirNotaDebitoUseCase,
    private readonly emitirRetencionUseCase: EmitirRetencionUseCase,
    private readonly sriIntegrationService: SriIntegrationService,
    private readonly logger: LoggerService,
  ) {}

  async onModuleInit() {
    await this.jobsService.work(SRI_EMISION_JOB, async ([job]) => {
      if (job) {
        await this.processEmision(job);
      }
    });
    this.logger.log(
      `Worker de SRI escuchando en PostgreSQL (job: ${SRI_EMISION_JOB})`,
    );
  }

  async processEmision(job: any): Promise<any> {
    const { tipo, dto } = job.data;
    this.logger.log(
      `Procesando emisión asíncrona de ${tipo} - Job ID: ${job.id}`,
    );

    try {
      switch (tipo) {
        case 'FACTURA':
          return await this.emitirFacturaUseCase.emitirFactura(dto);
        case 'FACTURA_DESDE_PREFACTURA': {
          const { comprobanteId } = job.data;
          return await this.sriIntegrationService.emitirDesdeComprobante(
            BigInt(comprobanteId),
          );
        }
        case 'NOTA_CREDITO':
          return await this.emitirNotaCreditoUseCase.emitirNotaCredito(dto);
        case 'NOTA_DEBITO':
          return await this.emitirNotaDebitoUseCase.emitirNotaDebito(dto);
        case 'RETENCION':
          return await this.emitirRetencionUseCase.emitirRetencion(dto);
        default:
          throw new Error(`Tipo de comprobante no soportado: ${tipo}`);
      }
    } catch (error: any) {
      this.logger.error(
        `Error procesando job ${job.id} de tipo ${tipo}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
