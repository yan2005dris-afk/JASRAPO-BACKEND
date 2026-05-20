import { Module } from '@nestjs/common';
import { EmisoresController } from './emisores.controller';
import { EmisoresService } from './emisores.service';
import { RawPgModule } from '../../../infrastructure/database/raw-pg/raw-pg.module';

@Module({
  imports: [RawPgModule],
  controllers: [EmisoresController],
  providers: [EmisoresService],
  exports: [EmisoresService],
})
export class EmisoresModule {}
