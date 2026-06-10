import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { SectorRepository } from '../../domain/repositories/sector.repository';
import { CreateSectorDto } from '../../interfaces/dto/create-sector.dto';

@Injectable()
export class CreateSectorUseCase {
  constructor(private readonly sectorRepository: SectorRepository) {}

  async execute(dto: CreateSectorDto) {
    const comunidad = await this.sectorRepository.findComunidad({
      comunidadId: dto.comunidadId,
    });

    if (!comunidad) {
      throw new NotFoundException('La comunidad especificada no existe.');
    }

    try {
      await this.sectorRepository.create(dto);
      return { message: 'Sector creado exitosamente.', statusCode: 201 };
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'El sector ya existe (código o ID duplicado).',
        );
      }
      throw error;
    }
  }
}
