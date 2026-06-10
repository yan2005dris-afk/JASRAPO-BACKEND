import { Injectable } from '@nestjs/common';
import { CreatePermissionDto } from '../../interfaces/dto/create-permission.dto';
import { PermissionRepository } from '../../domain/repositories/permission.repository';

@Injectable()
export class CreatePermissionUseCase {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async execute(createPermissionDto: CreatePermissionDto) {
    return this.permissionRepository.create(createPermissionDto);
  }
}
