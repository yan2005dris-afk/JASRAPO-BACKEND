import { Injectable, NotFoundException } from '@nestjs/common';
import { PermissionRepository } from '../../domain/repositories/permission.repository';

@Injectable()
export class FindOnePermissionUseCase {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async execute(id: number) {
    const permission = await this.permissionRepository.findUnique(id);

    if (!permission || permission.deletedAt) {
      throw new NotFoundException('Permiso no encontrado');
    }

    return permission;
  }
}
