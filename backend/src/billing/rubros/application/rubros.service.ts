import { Injectable } from '@nestjs/common';
import { CreateRubroUseCase } from './use-cases/create-rubro.use-case';
import {
  FindAllRubrosUseCase,
  type FindAllRubrosParams,
} from './use-cases/find-all-rubros.use-case';
import { FindOneRubroUseCase } from './use-cases/find-one-rubro.use-case';
import { UpdateRubroUseCase } from './use-cases/update-rubro.use-case';
import { DeleteRubroUseCase } from './use-cases/delete-rubro.use-case';
import { GetTarifasImpuestoUseCase } from './use-cases/get-tarifas-impuesto.use-case';
import type {
  CreateRubroData,
  UpdateRubroData,
  TarifaImpuestoInfo,
} from '../domain/types/rubro.types';
import type { RubroRow } from '../domain/types/rubro.types';
import type { PaginatedResult } from 'src/shared/domain/types/pagination.types';

@Injectable()
export class RubrosService {
  constructor(
    private readonly createRubroUseCase: CreateRubroUseCase,
    private readonly findAllRubrosUseCase: FindAllRubrosUseCase,
    private readonly findOneRubroUseCase: FindOneRubroUseCase,
    private readonly updateRubroUseCase: UpdateRubroUseCase,
    private readonly deleteRubroUseCase: DeleteRubroUseCase,
    private readonly getTarifasImpuestoUseCase: GetTarifasImpuestoUseCase,
  ) {}

  async create(data: CreateRubroData): Promise<RubroRow> {
    return this.createRubroUseCase.execute(data);
  }

  async findAll(
    params: FindAllRubrosParams,
  ): Promise<PaginatedResult<RubroRow>> {
    return this.findAllRubrosUseCase.execute(params);
  }

  async findOne(id: number): Promise<RubroRow> {
    return this.findOneRubroUseCase.execute(id);
  }

  async update(id: number, data: UpdateRubroData): Promise<RubroRow> {
    return this.updateRubroUseCase.execute(id, data);
  }

  async remove(id: number): Promise<RubroRow> {
    return this.deleteRubroUseCase.execute(id);
  }

  async getTarifasImpuesto(): Promise<TarifaImpuestoInfo[]> {
    return this.getTarifasImpuestoUseCase.execute();
  }
}
