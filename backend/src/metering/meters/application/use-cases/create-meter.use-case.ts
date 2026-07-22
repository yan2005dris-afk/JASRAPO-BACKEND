import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { MeterRepository } from '../../domain/repositories/meter.repository';
import { CreateMeterDto } from '../../interfaces/dto/create-meter.dto';
import { MeterEntity } from '../../domain/entities/meter.entity';
import { EstadoMedidor } from 'src/shared/enums';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { LogContext } from 'src/shared/decorators/log-context.decorator';

@LogContext()
@Injectable()
export class CreateMeterUseCase {
  constructor(
    private readonly meterRepository: MeterRepository,
    private readonly logger: LoggerService,
  ) {}

  async execute(createDto: CreateMeterDto): Promise<MeterEntity> {
    try {
      return await this.meterRepository.create({
        marca: createDto.marca,
        modelo: createDto.modelo,
        serie: createDto.serie,
        estado: EstadoMedidor.BODEGA,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.logger.warn(
          `Duplicate meter creation attempt for serial ${createDto.serie}`,
        );
        throw this.duplicateSerialException(createDto.serie);
      }

      this.logger.error(
        `Failed to create meter with serial ${createDto.serie}`,
        error instanceof Error ? error.stack : String(error),
        CreateMeterUseCase.name,
      );
      throw error;
    }
  }

  private duplicateSerialException(serie: string): ConflictException {
    return new ConflictException(
      `Ya existe un medidor registrado con el número de serie "${serie}".`,
    );
  }
}
