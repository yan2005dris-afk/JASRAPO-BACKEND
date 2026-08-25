import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/infrastructure/database/prisma.module';
import { StorageModule } from 'src/infrastructure/storage/storage.module';
import { InstitutionalProfileResolver } from './application/institutional-profile.resolver';
import {
  InstitutionalAssetPort,
  InstitutionalProfileQueryPort,
} from './application/ports/institutional-profile.ports';
import { PrismaInstitutionalProfileQueryAdapter } from './infrastructure/prisma-institutional-profile-query.adapter';
import { StorageInstitutionalAssetAdapter } from './infrastructure/storage-institutional-asset.adapter';
import { InstitutionalAssetsBootstrap } from './infrastructure/institutional-assets.bootstrap';

@Module({
  imports: [DatabaseModule, StorageModule],
  providers: [
    InstitutionalProfileResolver,
    InstitutionalAssetsBootstrap,
    {
      provide: InstitutionalProfileQueryPort,
      useClass: PrismaInstitutionalProfileQueryAdapter,
    },
    {
      provide: InstitutionalAssetPort,
      useClass: StorageInstitutionalAssetAdapter,
    },
  ],
  exports: [InstitutionalProfileResolver],
})
export class InstitutionalProfileModule {}
