import { Module } from '@nestjs/common';
import { SignatureController } from './interfaces/http/signature.controller';
import { SignatureService } from './application/signature.service';
import { GenerateAndSignPdfUseCase } from './application/use-cases/generate-and-sign-pdf.use-case';

@Module({
  controllers: [SignatureController],
  providers: [SignatureService, GenerateAndSignPdfUseCase],
  exports: [SignatureService, GenerateAndSignPdfUseCase],
})
export class SignatureModule {}
