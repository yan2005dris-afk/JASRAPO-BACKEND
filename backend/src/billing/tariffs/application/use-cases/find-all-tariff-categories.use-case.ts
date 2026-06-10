import { Injectable } from '@nestjs/common';
import { TariffRepository } from '../../domain/repositories/tariff.repository';

@Injectable()
export class FindAllTariffCategoriesUseCase {
  constructor(private readonly tariffRepository: TariffRepository) {}

  async execute(nombre?: string) {
    return this.tariffRepository.findMany({
      where: {
        activo: true,
        deletedAt: null,
        ...(nombre && {
          nombre: {
            contains: nombre,
            mode: 'insensitive',
          },
        }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
