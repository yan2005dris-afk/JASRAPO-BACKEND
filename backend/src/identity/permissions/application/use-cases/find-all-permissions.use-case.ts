import { Injectable } from '@nestjs/common';
import { PermissionRepository } from '../../domain/repositories/permission.repository';

@Injectable()
export class FindAllPermissionsUseCase {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async execute() {
    return this.permissionRepository.findAll();
  }
}
