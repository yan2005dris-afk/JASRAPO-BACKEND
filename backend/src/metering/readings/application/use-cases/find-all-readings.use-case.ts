import { Injectable } from '@nestjs/common';
import { ReadingRepository } from '../../domain/repositories/reading.repository';
import { Prisma } from 'src/generated/prisma/client';
import { LecturaEntity } from '../../domain/entities/lectura.entity';

@Injectable()
export class FindAllReadingsUseCase {
  constructor(private readonly readingRepository: ReadingRepository) {}

  async execute(params: {
    skip?: number;
    take?: number;
    where?: Prisma.LecturasWhereInput;
  }): Promise<LecturaEntity[]> {
    const { skip, take, where } = params;
    const lecturas = await this.readingRepository.findMany({
      skip,
      take,
      where: { ...where, deletedAt: null },
      orderBy: { fecha: 'desc' },
    });
    return lecturas.map((l) => new LecturaEntity(l));
  }
}
