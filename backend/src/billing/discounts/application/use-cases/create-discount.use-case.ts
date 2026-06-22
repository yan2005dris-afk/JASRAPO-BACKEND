import { Injectable } from '@nestjs/common';
import { DiscountRepository } from '../../domain/repositories/discount.repository';
import { CreateDiscountDto } from '../../interfaces/dto/create-discount.dto';

@Injectable()
export class CreateDiscountUseCase {
  constructor(private readonly discountRepository: DiscountRepository) {}

  async execute(dto: CreateDiscountDto) {
    const { rubroId, ...data } = dto;
    return this.discountRepository.createCatalogo({
      ...data,
      rubroId: rubroId ?? null,
    } as any);
  }
}
