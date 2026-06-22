import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/prisma.module';
import { DiscountsController } from './interfaces/http/discounts.controller';
import { DiscountsService } from './application/discounts.service';
import { DiscountRepository } from './domain/repositories/discount.repository';
import { PrismaDiscountRepository } from './infrastructure/repositories/prisma-discount.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [DiscountsController],
  providers: [
    { provide: DiscountRepository, useClass: PrismaDiscountRepository },
    DiscountsService,
  ],
  exports: [DiscountRepository, DiscountsService],
})
export class DiscountsModule {}
