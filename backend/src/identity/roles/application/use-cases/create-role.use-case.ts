import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from '../../interfaces/dto/create-role.dto';
import { RoleRepository } from '../../domain/repositories/role.repository';

@Injectable()
export class CreateRoleUseCase {
  constructor(private readonly roleRepository: RoleRepository) {}

  async execute(createRoleDto: CreateRoleDto) {
    try {
      return await this.roleRepository.create(createRoleDto.nombre);
    } catch (error: unknown) {
      if (this.isRolesIdUniqueConstraintError(error)) {
        await this.roleRepository.syncSequence();
        return await this.roleRepository.create(createRoleDto.nombre);
      }
      throw error;
    }
  }

  private isRolesIdUniqueConstraintError(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false;
    const prismaError = error as {
      code?: unknown;
      meta?: {
        target?: unknown;
        driverAdapterError?: { cause?: { constraint?: { fields?: unknown } } };
      };
    };
    if (prismaError.code !== 'P2002') return false;
    const target = prismaError.meta?.target;
    if (Array.isArray(target) && target.some((field) => field === 'roles_id'))
      return true;
    const driverFields =
      prismaError.meta?.driverAdapterError?.cause?.constraint?.fields;
    if (
      Array.isArray(driverFields) &&
      driverFields.some((field) => field === 'roles_id')
    )
      return true;
    return false;
  }
}
