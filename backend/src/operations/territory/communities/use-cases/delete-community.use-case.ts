import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

@Injectable()
export class DeleteCommunityUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: number) {
    return this.prisma.comunidades.delete({
      where: { comunidadId: id },
    });
  }
}
