import { Injectable } from '@nestjs/common';
import { DiscountRepository } from '../../domain/repositories/discount.repository';
import type { UpdateDiscountDto } from '../../interfaces/dto/update-discount.dto';
import type { DiscountEntity } from '../../domain/entities/discount.entity';
import { FindOneDiscountUseCase } from './find-one-discount.use-case';

@Injectable()
export class UpdateDiscountUseCase {
  constructor(
    private readonly discountRepository: DiscountRepository,
    private readonly findOneUseCase: FindOneDiscountUseCase,
  ) {}

  async execute(id: number, dto: UpdateDiscountDto): Promise<DiscountEntity> {
    await this.findOneUseCase.execute(id);
    const { rubroId, ...data } = dto;
    return this.discountRepository.updateCatalogo(id, {
      ...data,
      ...(rubroId !== undefined ? { rubroId } : {}),
    });
  }
}
