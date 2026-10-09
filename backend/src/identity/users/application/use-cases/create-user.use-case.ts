import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../../interfaces/dto/create-user.dto';
import { ValidationUtil } from 'src/infrastructure/common/utils/validation.util';
import { PhoneUtil } from 'src/infrastructure/common/utils/phone.util';
import { UserRepository } from '../../domain/repositories/user.repository';
import { RoleRepository } from '../../../roles/domain/repositories/role.repository';
import { UserRow } from '../../domain/types/user.types';
import { StorageService } from 'src/infrastructure/storage/storage.service';
import { uploadAvatar, rollbackAvatarUpload } from '../avatar-upload.helper';
import {
  EntityNotFoundException,
  EntityAlreadyExistsException,
} from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly storageService: StorageService,
  ) {}

  async execute(
    createUsersDto: CreateUserDto,
    file?: Express.Multer.File,
  ): Promise<UserRow> {
    ValidationUtil.requireNonEmpty(createUsersDto.email, 'email');
    ValidationUtil.requireNonEmpty(createUsersDto.nombres, 'nombres');
    ValidationUtil.requireNonEmpty(createUsersDto.apellidos, 'apellidos');
    ValidationUtil.requireNonEmpty(createUsersDto.telefono, 'telefono');

    const cleanPhone = PhoneUtil.validateAndClean(
      createUsersDto.telefono,
      'telefono',
    );

    const existingUser = await this.userRepository.findByEmail(
      createUsersDto.email,
    );
    if (existingUser) {
      if (existingUser.deletedAt) {
        throw new EntityAlreadyExistsException(
          'Usuario',
          'email (eliminado)',
          createUsersDto.email,
        );
      }
      throw new EntityAlreadyExistsException(
        'Usuario',
        'email',
        createUsersDto.email,
      );
    }

    let roleId: number;

    if (createUsersDto.rolId) {
      const role = await this.roleRepository.findUnique(createUsersDto.rolId);
      if (!role || role.deletedAt) {
        throw new EntityNotFoundException('Rol', createUsersDto.rolId);
      }
      roleId = role.rolId;
    } else {
      const defaultRole = await this.roleRepository.findByName('user');
      if (!defaultRole) {
        throw new EntityNotFoundException('Rol por defecto "user"', 'default');
      }
      roleId = defaultRole.rolId;
    }

    let avatarKey: string | undefined;
    if (file) {
      avatarKey = await uploadAvatar(file, this.storageService);
      createUsersDto.avatar = { key: avatarKey };
    }

    try {
      return await this.userRepository.create({
        email: createUsersDto.email,
        clave: null, // Usuario nuevo sin contraseña hasta aceptar invitación
        nombres: createUsersDto.nombres,
        apellidos: createUsersDto.apellidos,
        telefono: cleanPhone,
        avatar: createUsersDto.avatar,
        rolId: roleId,
      });
    } catch (error) {
      if (avatarKey) {
        await rollbackAvatarUpload(avatarKey, this.storageService);
      }
      throw error;
    }
  }
}
