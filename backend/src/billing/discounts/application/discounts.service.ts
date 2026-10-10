import { Injectable } from '@nestjs/common';
import type { CreateDiscountDto } from '../interfaces/dto/create-discount.dto';
import type { UpdateDiscountDto } from '../interfaces/dto/update-discount.dto';
import type { DiscountFilterDto } from '../interfaces/dto/discount-filter.dto';
import type { ApplyDiscountToPreinvoiceDto } from '../interfaces/dto/apply-discount-to-preinvoice.dto';
import { CreateDiscountUseCase } from './use-cases/create-discount.use-case';
import { FindAllDiscountsUseCase } from './use-cases/find-all-discounts.use-case';
import { FindOneDiscountUseCase } from './use-cases/find-one-discount.use-case';
import { UpdateDiscountUseCase } from './use-cases/update-discount.use-case';
import { RemoveDiscountUseCase } from './use-cases/remove-discount.use-case';
import { ApplyDiscountToPreinvoiceUseCase } from './use-cases/apply-discount-to-preinvoice.use-case';
import { GetDiscountRubrosUseCase } from './use-cases/get-discount-rubros.use-case';
import type { DiscountRow } from '../domain/types/discount.types';
import type { PaginatedResult } from 'src/shared/pagination/pagination.types';

@Injectable()
export class DiscountsService {
  constructor(
    private readonly createUseCase: CreateDiscountUseCase,
    private readonly findAllUseCase: FindAllDiscountsUseCase,
    private readonly findOneUseCase: FindOneDiscountUseCase,
    private readonly updateUseCase: UpdateDiscountUseCase,
    private readonly removeUseCase: RemoveDiscountUseCase,
    private readonly applyToPreinvoiceUseCase: ApplyDiscountToPreinvoiceUseCase,
    private readonly getRubrosUseCase: GetDiscountRubrosUseCase,
  ) {}

  async getRubros() {
    return this.getRubrosUseCase.execute();
  }

  async create(dto: CreateDiscountDto): Promise<DiscountRow> {
    return this.createUseCase.execute(dto);
  }

  async findAll(
    filter: DiscountFilterDto,
  ): Promise<PaginatedResult<DiscountRow>> {
    return this.findAllUseCase.execute(filter);
  }

  async findOne(id: number): Promise<DiscountRow> {
    return this.findOneUseCase.execute(id);
  }

  async update(id: number, dto: UpdateDiscountDto): Promise<DiscountRow> {
    return this.updateUseCase.execute(id, dto);
  }

  async remove(id: number): Promise<DiscountRow> {
    return this.removeUseCase.execute(id);
  }

  async applyToPreinvoice(
    prefacturaId: number,
    dto: ApplyDiscountToPreinvoiceDto,
  ) {
    return this.applyToPreinvoiceUseCase.execute(prefacturaId, dto);
  }
}
