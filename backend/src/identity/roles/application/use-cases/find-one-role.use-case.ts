import { Injectable } from '@nestjs/common';
import { RoleRepository } from '../../domain/repositories/role.repository';
import { RoleEntity } from '../../domain/entities/role.entity';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class FindOneRoleUseCase {
  constructor(private readonly roleRepository: RoleRepository) {}

  async execute(id: number): Promise<RoleEntity> {
    const role = await this.roleRepository.findUnique(id);

    if (!role || role.deletedAt) {
      throw new EntityNotFoundException('Rol', id);
    }

    return role;
  }
}
