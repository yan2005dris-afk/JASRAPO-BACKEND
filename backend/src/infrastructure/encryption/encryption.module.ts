import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EncryptionService } from './encryption.service';

/**
 * Módulo Global de Encriptación.
 * Provee herramientas para proteger datos sensibles en toda la aplicación.
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [EncryptionService],
  exports: [EncryptionService],
})
export class EncryptionModule {}
