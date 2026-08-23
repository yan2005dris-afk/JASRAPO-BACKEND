import { Module } from '@nestjs/common';
import { EmisoresController } from './interfaces/http/emisores.controller';
import { EmpresaAdminController } from './interfaces/http/empresa-admin.controller';
import { EmisoresService } from './application/emisores.service';
import { CertificateExpiryCheckService } from './application/services/certificate-expiry-check.service';
import { EmisorRepository } from './domain/repositories/emisor.repository';
import { PrismaEmisorRepository } from './infrastructure/repositories/prisma-emisor.repository';
import { JobsModule } from 'src/infrastructure/jobs/jobs.module';
import { JobsService } from 'src/infrastructure/jobs/jobs.service';

@Module({
  imports: [JobsModule],
  controllers: [EmisoresController, EmpresaAdminController],
  providers: [
    EmisoresService,
    CertificateExpiryCheckService,
    {
      provide: 'JobService',
      useExisting: JobsService,
    },
    {
      provide: EmisorRepository,
      useClass: PrismaEmisorRepository,
    },
  ],
  exports: [EmisoresService, EmisorRepository, CertificateExpiryCheckService],
})
export class EmisoresModule {}
