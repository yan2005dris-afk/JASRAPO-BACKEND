import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { EstadoMedidor, Medidores } from 'src/generated/prisma/client';
import { CreateMeterDto } from '../dto/create-meter.dto';

@Injectable()
export class CreateMeterUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(createDto: CreateMeterDto): Promise<Medidores> {
    return await this.prisma.medidores.create({
      data: { ...createDto, estado: EstadoMedidor.BODEGA },
    });
  }
}
