import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma } from 'src/generated/prisma/client';
import { CreateUserDto } from '../../interfaces/dto/create-user.dto';
import { ValidationUtil } from 'src/infrastructure/common/utils/validation.util';
import { PhoneUtil } from 'src/infrastructure/common/utils/phone.util';
import { UserRepository } from '../../domain/repositories/user.repository';
import { RoleRepository } from '../../../roles/domain/repositories/role.repository';
import { UserEntity } from '../../domain/entities/user.entity';

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
  ) {}

  async execute(createUsersDto: CreateUserDto): Promise<UserEntity> {
    // Validar campos obligatorios
    ValidationUtil.requireNonEmpty(createUsersDto.email, 'email');
    ValidationUtil.requireNonEmpty(createUsersDto.nombres, 'nombres');
    ValidationUtil.requireNonEmpty(createUsersDto.apellidos, 'apellidos');
    ValidationUtil.requireNonEmpty(createUsersDto.telefono, 'telefono');

    const cleanPhone = PhoneUtil.validateAndClean(
      createUsersDto.telefono,
      'telefono',
    );

    // Verificar que el email no exista previamente (incluye usuarios eliminados)
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

    // Determinar el rol a asignar
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

    // TODO: Generar contraseña temporal y enviar por email
    // Por ahora se crea con un hash placeholder
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
      // Manejar error de constraint único de Prisma
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('El correo electrónico ya está en uso');
      }
      throw error;
    }
  }
}
