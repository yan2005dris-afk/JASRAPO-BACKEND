import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { Prisma } from 'src/generated/prisma/client';
import { CreateUserDto } from '../../interfaces/dto/create-user.dto';
import { ValidationUtil } from 'src/infrastructure/common/utils/validation.util';
import { PhoneUtil } from 'src/infrastructure/common/utils/phone.util';
import { UserRepository } from '../../domain/repositories/user.repository';
import { RoleRepository } from '../../../roles/domain/repositories/role.repository';
import { UserEntity } from '../../domain/entities/user.entity';
import { ImageProcessorUtil } from 'src/infrastructure/common/utils/image-processor.util';
import {
  StorageService,
  SRI_STORAGE_TYPES,
} from 'src/infrastructure/storage/storage.service';

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
  ): Promise<UserEntity> {
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
        throw new ConflictException(
          'El correo electrónico pertenece a un usuario eliminado. Contacte al administrador para restaurar el usuario.',
        );
      }
      throw new ConflictException('El correo electrónico ya está en uso');
    }

    let roleId: number;

    if (createUsersDto.rolId) {
      const role = await this.roleRepository.findUnique(createUsersDto.rolId);
      if (!role || role.deletedAt) {
        throw new NotFoundException('Rol no encontrado o eliminado');
      }
      roleId = role.rolId;
    } else {
      const defaultRole = await this.roleRepository.findByName('user');
      if (!defaultRole) {
        throw new Error('No existe el rol por defecto "user".');
      }
      roleId = defaultRole.rolId;
    }

    let avatarKey: string | undefined;
    if (file) {
      avatarKey = await this.uploadAndProcessAvatar(file);
      createUsersDto.avatar = { key: avatarKey };
    }

    const temporaryPassword = 'TEMP_' + Date.now();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    try {
      return await this.userRepository.create({
        email: createUsersDto.email,
        clave: hashedPassword,
        nombres: createUsersDto.nombres,
        apellidos: createUsersDto.apellidos,
        telefono: cleanPhone,
        avatar: createUsersDto.avatar,
        rolId: roleId,
      });
    } catch (error) {
      if (avatarKey) {
        this.storageService
          .delete(SRI_STORAGE_TYPES.PROFILE_PHOTOS, avatarKey)
          .catch(() => {});
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('El correo electrónico ya está en uso');
      }
      throw error;
    }
  }

  private async uploadAndProcessAvatar(
    file: Express.Multer.File,
  ): Promise<string> {
    const processedBuffer = await ImageProcessorUtil.processProfilePicture(
      file.buffer,
    );

    const avatarKey = `avatars/${randomUUID()}.webp`;

    await this.storageService.upload(
      SRI_STORAGE_TYPES.PROFILE_PHOTOS,
      avatarKey,
      processedBuffer,
      { contentType: 'image/webp' },
    );

    return avatarKey;
  }
}
