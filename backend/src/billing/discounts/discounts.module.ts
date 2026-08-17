import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/prisma.module';
import { DiscountsController } from './interfaces/http/discounts.controller';
import { DiscountsService } from './application/discounts.service';
import { DiscountRepository } from './domain/repositories/discount.repository';
import { PrismaDiscountRepository } from './infrastructure/repositories/prisma-discount.repository';
import { CreateDiscountUseCase } from './application/use-cases/create-discount.use-case';
import { FindAllDiscountsUseCase } from './application/use-cases/find-all-discounts.use-case';
import { FindOneDiscountUseCase } from './application/use-cases/find-one-discount.use-case';
import { UpdateDiscountUseCase } from './application/use-cases/update-discount.use-case';
import { RemoveDiscountUseCase } from './application/use-cases/remove-discount.use-case';
import { ApplyDiscountToPreinvoiceUseCase } from './application/use-cases/apply-discount-to-preinvoice.use-case';
import { GetDiscountRubrosUseCase } from './application/use-cases/get-discount-rubros.use-case';

@Module({
  imports: [DatabaseModule],
  controllers: [DiscountsController],
  providers: [
    { provide: DiscountRepository, useClass: PrismaDiscountRepository },
    DiscountsService,
    CreateDiscountUseCase,
    FindAllDiscountsUseCase,
    FindOneDiscountUseCase,
    UpdateDiscountUseCase,
    RemoveDiscountUseCase,
    ApplyDiscountToPreinvoiceUseCase,
    GetDiscountRubrosUseCase,
  ],
  exports: [DiscountRepository, DiscountsService, FindOneDiscountUseCase],
})
export class DiscountsModule {}
