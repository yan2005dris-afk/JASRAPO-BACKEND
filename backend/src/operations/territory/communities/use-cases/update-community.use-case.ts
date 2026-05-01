import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { UpdateComunidadDto } from '../dto/update-comunidad.dto';

@Injectable()
export class UpdateCommunityUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: number, dto: UpdateComunidadDto) {
    return this.prisma.comunidades.update({
      where: { comunidadId: id },
      data: dto,
    });
  }
}
