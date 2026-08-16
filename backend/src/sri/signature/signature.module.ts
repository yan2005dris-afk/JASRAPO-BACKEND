import { Module } from '@nestjs/common';
import { SignatureController } from './interfaces/http/signature.controller';
import { SignatureService } from './application/signature.service';
import { GenerateAndSignPdfUseCase } from './application/use-cases/generate-and-sign-pdf.use-case';
import { EmisoresModule } from '../emisores/emisores.module';
import { CertificatesModule } from '../certificates/certificates.module';
import { EmisionModule } from '../emision/emision.module';

@Module({
  imports: [EmisoresModule, CertificatesModule, EmisionModule],
  controllers: [SignatureController],
  providers: [SignatureService, GenerateAndSignPdfUseCase],
  exports: [SignatureService, GenerateAndSignPdfUseCase],
})
export class SignatureModule {}
