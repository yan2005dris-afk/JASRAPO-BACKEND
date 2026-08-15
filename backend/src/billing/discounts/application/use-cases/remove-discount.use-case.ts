import { Injectable } from '@nestjs/common';
import { DiscountRepository } from '../../domain/repositories/discount.repository';
import type { DiscountEntity } from '../../domain/entities/discount.entity';
import { FindOneDiscountUseCase } from './find-one-discount.use-case';

@Injectable()
export class RemoveDiscountUseCase {
  constructor(
    private readonly discountRepository: DiscountRepository,
    private readonly findOneUseCase: FindOneDiscountUseCase,
  ) {}

  async execute(id: number): Promise<DiscountEntity> {
    await this.findOneUseCase.execute(id);
    return this.discountRepository.updateCatalogo(id, { activo: false });
  }
}
