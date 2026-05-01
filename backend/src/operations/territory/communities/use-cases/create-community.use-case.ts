import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { CreateComunidadDto } from '../dto/create-comunidad.dto';

@Injectable()
export class CreateCommunityUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateComunidadDto) {
    return this.prisma.comunidades.create({
      data: dto,
    });
  }
}
