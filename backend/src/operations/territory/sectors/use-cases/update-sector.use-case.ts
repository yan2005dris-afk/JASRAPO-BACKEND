import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { UpdateSectorDto } from '../dto/update-sector.dto';

@Injectable()
export class UpdateSectorUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: number, dto: UpdateSectorDto) {
    return this.prisma.sectores.update({
      where: { sectorId: id },
      data: dto,
    });
  }
}
