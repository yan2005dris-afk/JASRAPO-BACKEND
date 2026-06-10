import { Injectable } from '@nestjs/common';
import { PermissionRepository } from '../../domain/repositories/permission.repository';

@Injectable()
export class RemovePermissionUseCase {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async execute(id: number) {
    return this.permissionRepository.update(id, { deletedAt: new Date() });
  }
}
