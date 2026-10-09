import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from '../interfaces/dto/create-role.dto';
import { UpdateRoleDto } from '../interfaces/dto/update-role.dto';
import { CreateRoleUseCase } from './use-cases/create-role.use-case';
import { FindAllRolesUseCase } from './use-cases/find-all-roles.use-case';
import { FindOneRoleUseCase } from './use-cases/find-one-role.use-case';
import { UpdateRoleUseCase } from './use-cases/update-role.use-case';
import type { RoleRow } from '../domain/types/role.types';
import type { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';

@Injectable()
export class RolesService {
  constructor(
    private readonly createRoleUseCase: CreateRoleUseCase,
    private readonly findAllRolesUseCase: FindAllRolesUseCase,
    private readonly findOneRoleUseCase: FindOneRoleUseCase,
    private readonly updateRoleUseCase: UpdateRoleUseCase,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<RoleRow> {
    return this.createRoleUseCase.execute(createRoleDto);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResult<RoleRow>> {
    return this.findAllRolesUseCase.execute(page, limit);
  }

  async findOne(id: number) {
    return this.findOneRoleUseCase.execute(id);
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    return this.updateRoleUseCase.execute(id, updateRoleDto);
  }
}
