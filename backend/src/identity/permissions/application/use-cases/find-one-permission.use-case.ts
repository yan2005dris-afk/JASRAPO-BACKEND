import { Injectable } from '@nestjs/common';
import { PermissionRepository } from '../../domain/repositories/permission.repository';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class FindOnePermissionUseCase {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async execute(id: number) {
    const permission = await this.permissionRepository.findUnique(id);

    if (!permission || permission.deletedAt) {
      throw new EntityNotFoundException('Permiso', id);
    }

    return permission;
  }
}
