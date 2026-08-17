import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/prisma.module';
import { RubrosController } from './interfaces/http/rubros.controller';
import { RubrosService } from './application/rubros.service';
import { RubroRepository } from './domain/repositories/rubro.repository';
import { PrismaRubroRepository } from './infrastructure/repositories/prisma-rubro.repository';
import { CreateRubroUseCase } from './application/use-cases/create-rubro.use-case';
import { FindAllRubrosUseCase } from './application/use-cases/find-all-rubros.use-case';
import { FindOneRubroUseCase } from './application/use-cases/find-one-rubro.use-case';
import { UpdateRubroUseCase } from './application/use-cases/update-rubro.use-case';
import { DeleteRubroUseCase } from './application/use-cases/delete-rubro.use-case';
import { GetTarifasImpuestoUseCase } from './application/use-cases/get-tarifas-impuesto.use-case';

@Module({
  imports: [DatabaseModule],
  controllers: [RubrosController],
  providers: [
    {
      provide: RubroRepository,
      useClass: PrismaRubroRepository,
    },
    CreateRubroUseCase,
    FindAllRubrosUseCase,
    FindOneRubroUseCase,
    UpdateRubroUseCase,
    DeleteRubroUseCase,
    GetTarifasImpuestoUseCase,
    RubrosService,
  ],
  exports: [
    RubroRepository,
    RubrosService,
    FindOneRubroUseCase,
    FindAllRubrosUseCase,
    GetTarifasImpuestoUseCase,
  ],
})
export class RubrosModule {}
