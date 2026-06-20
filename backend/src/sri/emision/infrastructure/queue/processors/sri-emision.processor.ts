import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { JobsService } from '../../../../../infrastructure/jobs/jobs.service';
import { EmitirFacturaUseCase } from '../../../application/use-cases/emitir-factura.use-case';
import { EmitirNotaCreditoUseCase } from '../../../application/use-cases/emitir-nota-credito.use-case';
import { EmitirNotaDebitoUseCase } from '../../../application/use-cases/emitir-nota-debito.use-case';
import { EmitirRetencionUseCase } from '../../../application/use-cases/emitir-retencion.use-case';

export const SRI_EMISION_JOB = 'sri-emision';

@Injectable()
export class SriEmisionProcessor implements OnModuleInit {
  private readonly logger = new Logger(SriEmisionProcessor.name);

  constructor(
    private readonly jobsService: JobsService,
    private readonly emitirFacturaUseCase: EmitirFacturaUseCase,
    private readonly emitirNotaCreditoUseCase: EmitirNotaCreditoUseCase,
    private readonly emitirNotaDebitoUseCase: EmitirNotaDebitoUseCase,
    private readonly emitirRetencionUseCase: EmitirRetencionUseCase,
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

  private async processEmision(job: any): Promise<any> {
    const { tipo, dto } = job.data;
    this.logger.log(
      `Procesando emisión asíncrona de ${tipo} - Job ID: ${job.id}`,
    );

    try {
      switch (tipo) {
        case 'FACTURA':
          return await this.emitirFacturaUseCase.emitirFactura(dto);
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
