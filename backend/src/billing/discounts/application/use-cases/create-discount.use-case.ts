import { Injectable } from '@nestjs/common';
import { DiscountRepository } from '../../domain/repositories/discount.repository';
import type { CreateDiscountDto } from '../../interfaces/dto/create-discount.dto';
import type { DiscountRow } from '../../domain/types/discount.types';

@Injectable()
export class CreateDiscountUseCase {
  constructor(private readonly discountRepository: DiscountRepository) {}

  async execute(dto: CreateDiscountDto): Promise<DiscountRow> {
    const { rubroId, ...data } = dto;
    return this.discountRepository.createCatalogo({
      ...data,
      rubroId: rubroId ?? null,
    });
  }
}
