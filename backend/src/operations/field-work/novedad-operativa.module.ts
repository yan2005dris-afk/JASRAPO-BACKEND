import { Module } from '@nestjs/common';
import { NovedadOperativaService } from './novedad-operativa.service';
import { NovedadOperativaController } from './novedad-operativa.controller';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { CreateFieldWorkUseCase } from './use-cases/create-field-work.use-case';
import { FindAllFieldWorksUseCase } from './use-cases/find-all-field-works.use-case';
import { FindOneFieldWorkUseCase } from './use-cases/find-one-field-work.use-case';
import { UpdateFieldWorkUseCase } from './use-cases/update-field-work.use-case';
import { RemoveFieldWorkUseCase } from './use-cases/remove-field-work.use-case';

@Module({
  controllers: [NovedadOperativaController],
  providers: [
    NovedadOperativaService,
    PrismaService,
    CreateFieldWorkUseCase,
    FindAllFieldWorksUseCase,
    FindOneFieldWorkUseCase,
    UpdateFieldWorkUseCase,
    RemoveFieldWorkUseCase,
  ],
  exports: [
    NovedadOperativaService,
    CreateFieldWorkUseCase,
    FindAllFieldWorksUseCase,
    FindOneFieldWorkUseCase,
    UpdateFieldWorkUseCase,
    RemoveFieldWorkUseCase,
  ],
})
export class NovedadOperativaModule {}
