import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { S3ClientService } from './s3-client.service';

/**
 * S3 Client Module - Provides S3ClientService as a global provider
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [S3ClientService],
  exports: [S3ClientService],
})
export class S3ClientModule {}
