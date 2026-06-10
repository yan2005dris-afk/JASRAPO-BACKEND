import { Injectable } from '@nestjs/common';
import { UpdatePermissionDto } from '../../interfaces/dto/update-permission.dto';
import { PermissionRepository } from '../../domain/repositories/permission.repository';

@Injectable()
export class UpdatePermissionUseCase {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async execute(id: number, updatePermissionDto: UpdatePermissionDto) {
    return this.permissionRepository.update(id, updatePermissionDto);
  }
}
