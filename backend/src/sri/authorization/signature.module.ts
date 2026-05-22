import { Module, forwardRef } from '@nestjs/common';
import { SignatureController } from './signature.controller';
import { SignatureService } from './signature.service';
import { DocumentsModule } from '../documents/documents.module';
import { IntegrationModule } from '../integration/integration.module';

@Module({
  imports: [
    forwardRef(() => DocumentsModule),
    forwardRef(() => IntegrationModule),
  ],
  controllers: [SignatureController],
  providers: [SignatureService],
  exports: [SignatureService],
})
export class SignatureModule {}
