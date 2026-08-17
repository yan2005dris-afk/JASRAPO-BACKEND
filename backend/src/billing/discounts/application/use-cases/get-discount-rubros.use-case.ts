import { Injectable } from '@nestjs/common';
import { DiscountRepository } from '../../domain/repositories/discount.repository';

@Injectable()
export class GetDiscountRubrosUseCase {
  constructor(private readonly repository: DiscountRepository) {}

  async execute() {
    return this.repository.findRubros();
  }
}
