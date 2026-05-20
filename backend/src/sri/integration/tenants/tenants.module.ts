import { Module } from '@nestjs/common';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';
import { RawPgModule } from '../../../infrastructure/database/raw-pg/raw-pg.module';

@Module({
  imports: [RawPgModule],
  controllers: [TenantsController],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}
