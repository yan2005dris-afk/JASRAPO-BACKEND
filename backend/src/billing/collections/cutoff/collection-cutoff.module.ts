import { Module } from '@nestjs/common';
import { CollectionCutoffController } from './collection-cutoff.controller';
import { CollectionCutoffJob } from './collection-cutoff.job';
import { CollectionCutoffService } from './collection-cutoff.service';

@Module({
  controllers: [CollectionCutoffController],
  providers: [CollectionCutoffService, CollectionCutoffJob],
  exports: [CollectionCutoffService],
})
export class CollectionCutoffModule {}
