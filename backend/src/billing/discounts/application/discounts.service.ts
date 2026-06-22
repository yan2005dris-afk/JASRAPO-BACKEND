import { Injectable } from '@nestjs/common';
import { CreateDiscountDto } from '../interfaces/dto/create-discount.dto';
import { UpdateDiscountDto } from '../interfaces/dto/update-discount.dto';
import { DiscountFilterDto } from '../interfaces/dto/discount-filter.dto';
import { ApplyDiscountToPreinvoiceDto } from '../interfaces/dto/apply-discount-to-preinvoice.dto';
import { CreateDiscountUseCase } from './use-cases/create-discount.use-case';
import { FindAllDiscountsUseCase } from './use-cases/find-all-discounts.use-case';
import { FindOneDiscountUseCase } from './use-cases/find-one-discount.use-case';
import { UpdateDiscountUseCase } from './use-cases/update-discount.use-case';
import { RemoveDiscountUseCase } from './use-cases/remove-discount.use-case';
import { ApplyDiscountToPreinvoiceUseCase } from './use-cases/apply-discount-to-preinvoice.use-case';

@Injectable()
export class DiscountsService {
  constructor(
    private readonly createUseCase: CreateDiscountUseCase,
    private readonly findAllUseCase: FindAllDiscountsUseCase,
    private readonly findOneUseCase: FindOneDiscountUseCase,
    private readonly updateUseCase: UpdateDiscountUseCase,
    private readonly removeUseCase: RemoveDiscountUseCase,
    private readonly applyToPreinvoiceUseCase: ApplyDiscountToPreinvoiceUseCase,
  ) {}

  create(dto: CreateDiscountDto) {
    return this.createUseCase.execute(dto);
  }

  findAll(filter: DiscountFilterDto) {
    return this.findAllUseCase.execute(filter);
  }

  findOne(id: number) {
    return this.findOneUseCase.execute(id);
  }

  update(id: number, dto: UpdateDiscountDto) {
    return this.updateUseCase.execute(id, dto);
  }

  remove(id: number) {
    return this.removeUseCase.execute(id);
  }

  applyToPreinvoice(prefacturaId: number, dto: ApplyDiscountToPreinvoiceDto) {
    return this.applyToPreinvoiceUseCase.execute(prefacturaId, dto);
  }
}
