import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/prisma.module';
import { DiscountsController } from './interfaces/http/discounts.controller';
import { DiscountsService } from './application/discounts.service';

@Module({
  imports: [DatabaseModule],
  controllers: [DiscountsController],
  providers: [DiscountsService],
  exports: [DiscountsService],
})
export class DiscountsModule {}
