import { Injectable } from '@nestjs/common';
import { DiscountRepository } from '../../domain/repositories/discount.repository';
import { UpdateDiscountDto } from '../../interfaces/dto/update-discount.dto';
import { FindOneDiscountUseCase } from './find-one-discount.use-case';

@Injectable()
export class UpdateDiscountUseCase {
  constructor(
    private readonly discountRepository: DiscountRepository,
    private readonly findOneUseCase: FindOneDiscountUseCase,
  ) {}

  async execute(id: number, dto: UpdateDiscountDto) {
    await this.findOneUseCase.execute(id);
    const { rubroId, ...data } = dto;
    return this.discountRepository.updateCatalogo(
      { id },
      { ...data, rubroId: rubroId ?? undefined },
    );
  }
}
