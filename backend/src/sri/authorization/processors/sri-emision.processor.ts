import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { JobsService } from '../../../infrastructure/jobs/jobs.service';
import { FacturaService } from '../../issuance/services/factura.service';
import { NotaCreditoService } from '../../issuance/services/nota-credito.service';
import { NotaDebitoService } from '../../issuance/services/nota-debito.service';
import { RetencionService } from '../../issuance/services/retencion.service';
import { GuiaRemisionService } from '../../issuance/services/guia-remision.service';

export const SRI_EMISION_JOB = 'sri-emision';

@Injectable()
export class SriEmisionProcessor implements OnModuleInit {
  private readonly logger = new Logger(SriEmisionProcessor.name);

  constructor(
    private readonly jobsService: JobsService,
    private readonly facturaService: FacturaService,
    private readonly notaCreditoService: NotaCreditoService,
    private readonly notaDebitoService: NotaDebitoService,
    private readonly retencionService: RetencionService,
    private readonly guiaRemisionService: GuiaRemisionService,
  ) {}

  async onModuleInit() {
    await this.jobsService.work(SRI_EMISION_JOB, async (job) => {
      await this.processEmision(job);
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
          return await this.facturaService.emitirFactura(dto);
        case 'NOTA_CREDITO':
          return await this.notaCreditoService.emitirNotaCredito(dto);
        case 'NOTA_DEBITO':
          return await this.notaDebitoService.emitirNotaDebito(dto);
        case 'RETENCION':
          return await this.retencionService.emitirRetencion(dto);
        case 'GUIA_REMISION':
          return await this.guiaRemisionService.emitirGuiaRemision(dto);
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
