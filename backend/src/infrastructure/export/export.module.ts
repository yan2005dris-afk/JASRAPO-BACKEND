import { Module } from '@nestjs/common';
import { ExportStreamService } from './services/export-stream.service';

@Module({
  providers: [ExportStreamService],
  exports: [ExportStreamService],
})
export class ExportModule {}
